-- 1. Account bootstrap: profile + role + client linking
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  _is_first boolean;
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data->>'full_name', split_part(coalesce(new.email,'member'), '@', 1))
  )
  on conflict (id) do nothing;

  select not exists (select 1 from public.user_roles) into _is_first;

  insert into public.user_roles (user_id, role)
  values (new.id, case when _is_first then 'admin'::public.app_role else 'client'::public.app_role end)
  on conflict (user_id, role) do nothing;

  if not _is_first then
    update public.clients
      set user_id = new.id
      where user_id is null and lower(email) = lower(coalesce(new.email, ''));
  end if;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 2. Weekly summary log
create table if not exists public.weekly_summaries (
  id uuid primary key default gen_random_uuid(),
  week_start date not null,
  generated_at timestamptz not null default now(),
  payload jsonb not null default '{}'::jsonb,
  delivery_status text not null default 'logged',
  delivery_note text,
  created_at timestamptz not null default now(),
  unique (week_start)
);

grant select on public.weekly_summaries to authenticated;
grant all on public.weekly_summaries to service_role;
alter table public.weekly_summaries enable row level security;

create policy "weekly_summaries_staff_select" on public.weekly_summaries
  for select to authenticated using (public.is_staff(auth.uid()));

-- 3. Summary builder
create or replace function public.generate_weekly_summary()
returns public.weekly_summaries
language plpgsql
security definer
set search_path = public
as $$
declare
  _week_start date := (date_trunc('week', (now() at time zone 'Asia/Kolkata')))::date;
  _since timestamptz := now() - interval '7 days';
  _payload jsonb;
  _row public.weekly_summaries;
begin
  if auth.uid() is not null and not public.is_staff(auth.uid()) then
    raise exception 'Not authorised';
  end if;

  select jsonb_build_object(
    'active_projects', (select count(*) from public.projects where is_active),
    'projects_by_stage', (
      select coalesce(jsonb_object_agg(stage, c), '{}'::jsonb)
      from (select stage::text as stage, count(*) as c from public.projects where is_active group by stage) s
    ),
    'new_enquiries', (select count(*) from public.enquiries where created_at >= _since),
    'new_leads', (select count(*) from public.leads where created_at >= _since),
    'open_leads', (select count(*) from public.leads where stage not in ('won','lost')),
    'pending_approvals', (select count(*) from public.approvals where status = 'pending'),
    'overdue_tasks', (select count(*) from public.tasks where status <> 'done' and due_date < current_date),
    'upcoming_tasks', (select count(*) from public.tasks where status <> 'done' and due_date between current_date and current_date + 7),
    'receivables', (select coalesce(sum(total - amount_paid), 0) from public.invoices where status <> 'draft'),
    'collected_week', (select coalesce(sum(amount), 0) from public.payments where paid_at >= (now() - interval '7 days')::date),
    'enquiry_list', (
      select coalesce(jsonb_agg(jsonb_build_object(
        'id', e.id, 'name', e.name, 'city', e.city, 'space_type', e.space_type,
        'budget_band', e.budget_band, 'status', e.status, 'created_at', e.created_at
      ) order by e.created_at desc), '[]'::jsonb)
      from public.enquiries e where e.created_at >= _since
    ),
    'approval_projects', (
      select coalesce(jsonb_agg(x), '[]'::jsonb) from (
        select jsonb_build_object(
          'project_id', p.id, 'title', p.title, 'code', p.code,
          'client', c.name, 'pending', count(a.id)
        ) as x
        from public.approvals a
        join public.projects p on p.id = a.project_id
        join public.clients c on c.id = p.client_id
        where a.status = 'pending'
        group by p.id, p.title, p.code, c.name
        order by count(a.id) desc
        limit 25
      ) q
    )
  ) into _payload;

  insert into public.weekly_summaries (week_start, payload, delivery_status, delivery_note)
  values (_week_start, _payload, 'logged', 'Compiled in-app. Email delivery requires a verified sending domain.')
  on conflict (week_start) do update
    set payload = excluded.payload,
        generated_at = now(),
        delivery_status = excluded.delivery_status,
        delivery_note = excluded.delivery_note
  returning * into _row;

  return _row;
end;
$$;

revoke all on function public.generate_weekly_summary() from public;
revoke all on function public.generate_weekly_summary() from anon;
grant execute on function public.generate_weekly_summary() to authenticated, service_role;

-- 4. Schedule: Monday 08:00 Asia/Kolkata = 02:30 UTC Monday
create extension if not exists pg_cron with schema pg_catalog;

do $$
begin
  perform cron.unschedule('weekly-studio-summary');
exception when others then null;
end $$;

select cron.schedule('weekly-studio-summary', '30 2 * * 1', $$select public.generate_weekly_summary();$$);