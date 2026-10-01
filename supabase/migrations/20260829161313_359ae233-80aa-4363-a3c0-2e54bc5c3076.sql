-- ============ ENUMS ============
create type public.app_role as enum ('admin','designer','project_manager','accounts','client');
create type public.project_stage as enum ('brief','concept','design_development','execution','handover','completed');
create type public.task_status as enum ('todo','in_progress','blocked','done');
create type public.approval_status as enum ('pending','approved','changes_requested');
create type public.invoice_status as enum ('draft','sent','partial','paid','overdue');
create type public.lead_stage as enum ('new','contacted','qualified','proposal','won','lost');

-- ============ HELPERS ============
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  email text not null default '',
  title text,
  phone text,
  avatar_url text,
  created_at timestamptz not null default now()
);
grant select, insert, update on public.profiles to authenticated;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

create or replace function public.is_staff(_user_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.user_roles
    where user_id = _user_id
      and role in ('admin','designer','project_manager','accounts')
  )
$$;

-- ============ CRM / CLIENTS ============
create table public.clients (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  name text not null,
  company text,
  email text not null,
  phone text,
  city text,
  notes text,
  created_at timestamptz not null default now()
);
grant select, insert, update, delete on public.clients to authenticated;
grant all on public.clients to service_role;
alter table public.clients enable row level security;

create table public.enquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text,
  city text,
  space_type text,
  budget_band text,
  message text,
  source text not null default 'website',
  status text not null default 'new',
  created_at timestamptz not null default now()
);
grant select, insert, update, delete on public.enquiries to authenticated;
grant insert on public.enquiries to anon;
grant all on public.enquiries to service_role;
alter table public.enquiries enable row level security;

create table public.leads (
  id uuid primary key default gen_random_uuid(),
  enquiry_id uuid references public.enquiries(id) on delete set null,
  client_id uuid references public.clients(id) on delete set null,
  name text not null,
  email text not null,
  phone text,
  city text,
  space_type text,
  budget_band text,
  stage public.lead_stage not null default 'new',
  value_estimate numeric(14,2) not null default 0,
  owner_id uuid references auth.users(id) on delete set null,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update, delete on public.leads to authenticated;
grant all on public.leads to service_role;
alter table public.leads enable row level security;

-- ============ PROJECTS ============
create table public.projects (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  title text not null,
  slug text not null unique,
  client_id uuid not null references public.clients(id) on delete cascade,
  city text not null default '',
  space_type text not null default 'Residence',
  style text not null default 'Contemporary',
  budget_band text not null default 'Premium',
  budget_amount numeric(14,2) not null default 0,
  area_sqft integer not null default 0,
  stage public.project_stage not null default 'brief',
  progress integer not null default 0,
  is_active boolean not null default true,
  brief text,
  cover_image text,
  lead_designer_id uuid references auth.users(id) on delete set null,
  lead_designer_name text,
  start_date date,
  target_date date,
  created_at timestamptz not null default now()
);
grant select, insert, update, delete on public.projects to authenticated;
grant all on public.projects to service_role;
alter table public.projects enable row level security;

create or replace function public.owns_project(_user_id uuid, _project_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.projects p
    join public.clients c on c.id = p.client_id
    where p.id = _project_id and c.user_id = _user_id
  )
$$;

create table public.rooms (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  name text not null,
  room_type text not null default 'Living',
  area_sqft integer not null default 0,
  status text not null default 'design',
  sort_order integer not null default 0
);
grant select, insert, update, delete on public.rooms to authenticated;
grant all on public.rooms to service_role;
alter table public.rooms enable row level security;

create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  room_id uuid references public.rooms(id) on delete set null,
  title text not null,
  description text,
  assignee_name text,
  assignee_id uuid references auth.users(id) on delete set null,
  status public.task_status not null default 'todo',
  priority text not null default 'medium',
  due_date date,
  created_at timestamptz not null default now()
);
grant select, insert, update, delete on public.tasks to authenticated;
grant all on public.tasks to service_role;
alter table public.tasks enable row level security;

create table public.design_files (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  room_id uuid references public.rooms(id) on delete set null,
  title text not null,
  kind text not null default 'render',
  file_url text not null,
  version integer not null default 1,
  uploaded_by_name text,
  visible_to_client boolean not null default true,
  created_at timestamptz not null default now()
);
grant select, insert, update, delete on public.design_files to authenticated;
grant all on public.design_files to service_role;
alter table public.design_files enable row level security;

create table public.approvals (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  room_id uuid references public.rooms(id) on delete set null,
  design_file_id uuid references public.design_files(id) on delete set null,
  title text not null,
  notes text,
  status public.approval_status not null default 'pending',
  requested_at timestamptz not null default now(),
  decided_at timestamptz,
  decided_by_name text
);
grant select, insert, update, delete on public.approvals to authenticated;
grant all on public.approvals to service_role;
alter table public.approvals enable row level security;

create table public.approval_comments (
  id uuid primary key default gen_random_uuid(),
  approval_id uuid not null references public.approvals(id) on delete cascade,
  author_id uuid references auth.users(id) on delete set null,
  author_name text not null default 'Client',
  body text not null,
  created_at timestamptz not null default now()
);
grant select, insert, update, delete on public.approval_comments to authenticated;
grant all on public.approval_comments to service_role;
alter table public.approval_comments enable row level security;

-- ============ FINANCE ============
create table public.boq_items (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  room_id uuid references public.rooms(id) on delete set null,
  category text not null default 'Joinery',
  description text not null,
  unit text not null default 'nos',
  quantity numeric(12,2) not null default 1,
  rate numeric(12,2) not null default 0,
  amount numeric(14,2) generated always as (quantity * rate) stored,
  created_at timestamptz not null default now()
);
grant select, insert, update, delete on public.boq_items to authenticated;
grant all on public.boq_items to service_role;
alter table public.boq_items enable row level security;

create table public.quotations (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  number text not null unique,
  status text not null default 'draft',
  subtotal numeric(14,2) not null default 0,
  tax_percent numeric(5,2) not null default 18,
  total numeric(14,2) not null default 0,
  notes text,
  issued_at date,
  valid_until date,
  created_at timestamptz not null default now()
);
grant select, insert, update, delete on public.quotations to authenticated;
grant all on public.quotations to service_role;
alter table public.quotations enable row level security;

create table public.invoices (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  number text not null unique,
  milestone text not null default 'Milestone',
  status public.invoice_status not null default 'draft',
  amount numeric(14,2) not null default 0,
  tax_percent numeric(5,2) not null default 18,
  total numeric(14,2) not null default 0,
  amount_paid numeric(14,2) not null default 0,
  issued_at date,
  due_at date,
  created_at timestamptz not null default now()
);
grant select, insert, update, delete on public.invoices to authenticated;
grant all on public.invoices to service_role;
alter table public.invoices enable row level security;

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references public.invoices(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  amount numeric(14,2) not null,
  method text not null default 'bank_transfer',
  reference text,
  paid_at date not null default current_date,
  created_at timestamptz not null default now()
);
grant select, insert, update, delete on public.payments to authenticated;
grant all on public.payments to service_role;
alter table public.payments enable row level security;

-- ============ PROCUREMENT / SITE ============
create table public.vendors (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null default 'Joinery',
  city text,
  contact_name text,
  email text,
  phone text,
  rating numeric(2,1) not null default 4.5,
  created_at timestamptz not null default now()
);
grant select, insert, update, delete on public.vendors to authenticated;
grant all on public.vendors to service_role;
alter table public.vendors enable row level security;

create table public.purchase_orders (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  vendor_id uuid references public.vendors(id) on delete set null,
  number text not null unique,
  status text not null default 'draft',
  total numeric(14,2) not null default 0,
  expected_at date,
  created_at timestamptz not null default now()
);
grant select, insert, update, delete on public.purchase_orders to authenticated;
grant all on public.purchase_orders to service_role;
alter table public.purchase_orders enable row level security;

create table public.po_items (
  id uuid primary key default gen_random_uuid(),
  purchase_order_id uuid not null references public.purchase_orders(id) on delete cascade,
  description text not null,
  quantity numeric(12,2) not null default 1,
  unit text not null default 'nos',
  rate numeric(12,2) not null default 0
);
grant select, insert, update, delete on public.po_items to authenticated;
grant all on public.po_items to service_role;
alter table public.po_items enable row level security;

create table public.site_updates (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  title text not null,
  body text,
  image_url text,
  progress integer,
  visible_to_client boolean not null default true,
  created_by_name text,
  created_at timestamptz not null default now()
);
grant select, insert, update, delete on public.site_updates to authenticated;
grant all on public.site_updates to service_role;
alter table public.site_updates enable row level security;

create table public.documents (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  title text not null,
  kind text not null default 'drawing',
  file_url text not null,
  visible_to_client boolean not null default true,
  uploaded_by_name text,
  created_at timestamptz not null default now()
);
grant select, insert, update, delete on public.documents to authenticated;
grant all on public.documents to service_role;
alter table public.documents enable row level security;

-- ============ MEDIA / CMS ============
create table public.media_assets (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  url text not null,
  kind text not null default 'image',
  tags text[] not null default '{}',
  project_id uuid references public.projects(id) on delete set null,
  created_at timestamptz not null default now()
);
grant select, insert, update, delete on public.media_assets to authenticated;
grant all on public.media_assets to service_role;
alter table public.media_assets enable row level security;

create table public.case_studies (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null unique references public.projects(id) on delete cascade,
  slug text not null unique,
  title text not null,
  subtitle text,
  location text,
  year integer,
  hero_image text,
  summary text,
  brief text,
  solution text,
  materials text[] not null default '{}',
  gallery jsonb not null default '[]'::jsonb,
  credits jsonb not null default '{}'::jsonb,
  space_type text,
  style text,
  area_sqft integer,
  featured boolean not null default false,
  published boolean not null default false,
  published_at timestamptz,
  seo_title text,
  seo_description text
);
grant select, insert, update, delete on public.case_studies to authenticated;
grant select on public.case_studies to anon;
grant all on public.case_studies to service_role;
alter table public.case_studies enable row level security;

create table public.journal_posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  excerpt text,
  body text,
  cover_image text,
  category text not null default 'Studio Notes',
  author text not null default 'Atelier Vermilion',
  read_minutes integer not null default 4,
  published boolean not null default false,
  published_at timestamptz,
  created_at timestamptz not null default now()
);
grant select, insert, update, delete on public.journal_posts to authenticated;
grant select on public.journal_posts to anon;
grant all on public.journal_posts to service_role;
alter table public.journal_posts enable row level security;

create table public.site_settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
grant select, insert, update on public.site_settings to authenticated;
grant select on public.site_settings to anon;
grant all on public.site_settings to service_role;
alter table public.site_settings enable row level security;

-- ============ NOTIFICATIONS / AUDIT ============
create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  audience public.app_role,
  project_id uuid references public.projects(id) on delete cascade,
  title text not null,
  body text,
  link text,
  read boolean not null default false,
  created_at timestamptz not null default now()
);
grant select, insert, update, delete on public.notifications to authenticated;
grant all on public.notifications to service_role;
alter table public.notifications enable row level security;

create table public.activity_log (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects(id) on delete cascade,
  actor_id uuid references auth.users(id) on delete set null,
  actor_label text not null default 'System',
  action text not null,
  entity text not null default 'project',
  entity_id uuid,
  detail text,
  created_at timestamptz not null default now()
);
grant select, insert on public.activity_log to authenticated;
grant all on public.activity_log to service_role;
alter table public.activity_log enable row level security;

-- ============ POLICIES ============
create policy "profiles_self_select" on public.profiles for select to authenticated using (id = auth.uid() or public.is_staff(auth.uid()));
create policy "profiles_self_insert" on public.profiles for insert to authenticated with check (id = auth.uid());
create policy "profiles_self_update" on public.profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

create policy "user_roles_self_select" on public.user_roles for select to authenticated using (user_id = auth.uid() or public.is_staff(auth.uid()));

create policy "clients_staff_all" on public.clients for all to authenticated using (public.is_staff(auth.uid())) with check (public.is_staff(auth.uid()));
create policy "clients_self_select" on public.clients for select to authenticated using (user_id = auth.uid());

create policy "enquiries_public_insert" on public.enquiries for insert to anon with check (true);
create policy "enquiries_auth_insert" on public.enquiries for insert to authenticated with check (true);
create policy "enquiries_staff_all" on public.enquiries for all to authenticated using (public.is_staff(auth.uid())) with check (public.is_staff(auth.uid()));

create policy "leads_staff_all" on public.leads for all to authenticated using (public.is_staff(auth.uid())) with check (public.is_staff(auth.uid()));

create policy "projects_staff_all" on public.projects for all to authenticated using (public.is_staff(auth.uid())) with check (public.is_staff(auth.uid()));
create policy "projects_client_select" on public.projects for select to authenticated
  using (exists (select 1 from public.clients c where c.id = client_id and c.user_id = auth.uid()));

do $$
declare t text;
begin
  foreach t in array array['rooms','tasks','design_files','boq_items','quotations','invoices','payments','purchase_orders','site_updates','documents','approvals']
  loop
    execute format('create policy "%1$s_staff_all" on public.%1$s for all to authenticated using (public.is_staff(auth.uid())) with check (public.is_staff(auth.uid()))', t);
    execute format('create policy "%1$s_client_select" on public.%1$s for select to authenticated using (public.owns_project(auth.uid(), project_id))', t);
  end loop;
end $$;

create policy "approvals_client_update" on public.approvals for update to authenticated
  using (public.owns_project(auth.uid(), project_id))
  with check (public.owns_project(auth.uid(), project_id));

create policy "approval_comments_staff_all" on public.approval_comments for all to authenticated using (public.is_staff(auth.uid())) with check (public.is_staff(auth.uid()));
create policy "approval_comments_client_select" on public.approval_comments for select to authenticated
  using (exists (select 1 from public.approvals a where a.id = approval_id and public.owns_project(auth.uid(), a.project_id)));
create policy "approval_comments_client_insert" on public.approval_comments for insert to authenticated
  with check (author_id = auth.uid() and exists (select 1 from public.approvals a where a.id = approval_id and public.owns_project(auth.uid(), a.project_id)));

create policy "po_items_staff_all" on public.po_items for all to authenticated using (public.is_staff(auth.uid())) with check (public.is_staff(auth.uid()));
create policy "vendors_staff_all" on public.vendors for all to authenticated using (public.is_staff(auth.uid())) with check (public.is_staff(auth.uid()));
create policy "media_staff_all" on public.media_assets for all to authenticated using (public.is_staff(auth.uid())) with check (public.is_staff(auth.uid()));

create policy "case_studies_public_select" on public.case_studies for select to anon using (published = true);
create policy "case_studies_auth_select" on public.case_studies for select to authenticated using (published = true or public.is_staff(auth.uid()));
create policy "case_studies_staff_write" on public.case_studies for all to authenticated using (public.is_staff(auth.uid())) with check (public.is_staff(auth.uid()));

create policy "journal_public_select" on public.journal_posts for select to anon using (published = true);
create policy "journal_auth_select" on public.journal_posts for select to authenticated using (published = true or public.is_staff(auth.uid()));
create policy "journal_staff_write" on public.journal_posts for all to authenticated using (public.is_staff(auth.uid())) with check (public.is_staff(auth.uid()));

create policy "settings_public_select" on public.site_settings for select to anon using (true);
create policy "settings_auth_select" on public.site_settings for select to authenticated using (true);
create policy "settings_staff_write" on public.site_settings for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

create policy "notifications_own_select" on public.notifications for select to authenticated
  using (user_id = auth.uid() or (audience is not null and public.has_role(auth.uid(), audience)));
create policy "notifications_own_update" on public.notifications for update to authenticated
  using (user_id = auth.uid() or (audience is not null and public.has_role(auth.uid(), audience)))
  with check (true);
create policy "notifications_staff_insert" on public.notifications for insert to authenticated with check (true);

create policy "activity_staff_select" on public.activity_log for select to authenticated using (public.is_staff(auth.uid()));
create policy "activity_client_select" on public.activity_log for select to authenticated using (project_id is not null and public.owns_project(auth.uid(), project_id));
create policy "activity_insert" on public.activity_log for insert to authenticated with check (true);

create index on public.projects (stage);
create index on public.rooms (project_id);
create index on public.tasks (project_id, status);
create index on public.design_files (project_id);
create index on public.approvals (project_id, status);
create index on public.invoices (project_id, status);
create index on public.site_updates (project_id, created_at desc);
create index on public.activity_log (project_id, created_at desc);