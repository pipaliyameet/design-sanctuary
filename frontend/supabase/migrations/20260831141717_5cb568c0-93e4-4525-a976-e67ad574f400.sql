-- ============ 1. LOCK DOWN SECURITY DEFINER HELPERS ============
revoke all on function public.has_role(uuid, public.app_role) from public, anon;
revoke all on function public.is_staff(uuid) from public, anon;
revoke all on function public.owns_project(uuid, uuid) from public, anon;
grant execute on function public.has_role(uuid, public.app_role) to authenticated, service_role;
grant execute on function public.is_staff(uuid) to authenticated, service_role;
grant execute on function public.owns_project(uuid, uuid) to authenticated, service_role;

-- ============ 2. SEED DATA ============
create temporary table seed_src (
  n int, title text, client_name text, company text, city text,
  space_type text, style text, amount numeric, area int, stage text
) on commit drop;

insert into seed_src values
 (1,'Vermilion Heights Penthouse','Aarav Mehta',null,'Mumbai','Penthouse','Contemporary',18500000,4200,'execution'),
 (2,'Banyan House','Nandita Iyer',null,'Bengaluru','Villa','Warm Minimal',24000000,6100,'completed'),
 (3,'Foundry Lane Loft','Rehan Kapadia',null,'Mumbai','Apartment','Industrial Luxe',7600000,1850,'completed'),
 (4,'Sandstone Residence','Priya Deshpande',null,'Pune','Villa','Earthy Modern',15200000,4800,'design_development'),
 (5,'Alcove Boutique Hotel','Kabir Sethi','Alcove Hospitality','Goa','Hospitality','Coastal Editorial',41000000,12000,'execution'),
 (6,'Ashwood Family Home','Meera Nambiar',null,'Kochi','Residence','Tropical Modern',9800000,3100,'completed'),
 (7,'Quill Studio Offices','Tanvi Bhatt','Quill Ventures','Bengaluru','Office','Quiet Corporate',13400000,5200,'handover'),
 (8,'Marble Row Apartment','Siddharth Nair',null,'Mumbai','Apartment','Classic Contemporary',6900000,1600,'concept'),
 (9,'Lantern House','Anaya Ghosh',null,'Kolkata','Villa','Heritage Modern',17800000,5400,'design_development'),
 (10,'Olive Grove Farmhouse','Vikram Raje',null,'Nashik','Farmhouse','Rustic Luxe',12600000,4400,'execution'),
 (11,'Cobalt Clinic','Dr. Farah Sheikh','Cobalt Health','Hyderabad','Healthcare','Calm Clinical',8700000,2900,'completed'),
 (12,'Terrazzo Terrace Duplex','Rohan Malhotra',null,'Gurugram','Duplex','Modern Deco',14100000,3800,'design_development'),
 (13,'Wren & Fig Patisserie','Ishita Menon','Wren & Fig','Bengaluru','Retail','Soft Modern',4200000,1200,'completed'),
 (14,'Slate Court Residence','Aditya Shenoy',null,'Chennai','Residence','Monochrome Modern',11300000,3400,'execution'),
 (15,'Palm Ridge Villa','Zoya Merchant',null,'Alibaug','Villa','Resort Modern',28500000,7200,'concept'),
 (16,'The Reading Room Library','Naveen Pillai','Pillai Trust','Kochi','Institutional','Editorial Classic',6100000,2100,'completed'),
 (17,'Copper Kettle Restaurant','Devika Sood','Copper Kettle','Mumbai','Hospitality','Moody Brasserie',9400000,2600,'handover'),
 (18,'Cardamom House','Arjun Varma',null,'Coimbatore','Residence','Warm Minimal',7900000,2800,'brief'),
 (19,'Northgate Apartment','Simran Ahluwalia',null,'Delhi','Apartment','Contemporary',5800000,1500,'execution'),
 (20,'Ivory Atelier Salon','Kritika Rane','Ivory Atelier','Pune','Retail','Refined Feminine',3600000,950,'completed'),
 (21,'Fern Court Townhouse','Yash Bhandari',null,'Ahmedabad','Townhouse','Sculptural Modern',13800000,3900,'design_development'),
 (22,'Basalt Bungalow','Leela Krishnan',null,'Mysuru','Bungalow','Stone & Timber',16400000,5000,'execution'),
 (23,'Skyline Sales Lounge','Harsh Vora','Vora Realty','Mumbai','Commercial','Cinematic Luxe',7200000,2200,'completed'),
 (24,'Juniper Apartment','Ananya Roy',null,'Bengaluru','Apartment','Japandi',6300000,1700,'concept'),
 (25,'The Kiln House','Omar Fernandes',null,'Goa','Villa','Artisanal Modern',19700000,5600,'completed'),
 (26,'Amber Studio Flat','Nikita Joshi',null,'Pune','Studio','Compact Luxe',2900000,720,'completed'),
 (27,'Greystone Corporate Suite','Rahul Bakshi','Greystone Capital','Delhi','Office','Understated Modern',10800000,3300,'handover'),
 (28,'Tamarind House','Kavya Reddy',null,'Hyderabad','Residence','Earthy Modern',10200000,3200,'execution');

insert into public.clients (name, company, email, phone, city, notes)
select client_name, company,
  lower(replace(replace(client_name,'. ','.'),' ','.'))||'@example.com',
  '+91 98'||lpad(((n*13717)%100000000)::text,8,'0'), city,
  case when n%3=0 then 'Referred by a past client.' else 'Came in through the website enquiry form.' end
from seed_src;

insert into public.projects
 (code,title,slug,client_id,city,space_type,style,budget_band,budget_amount,area_sqft,stage,progress,is_active,brief,cover_image,lead_designer_name,start_date,target_date)
select
  'AV-'||lpad(s.n::text,3,'0'), s.title,
  trim(both '-' from lower(regexp_replace(s.title,'[^a-zA-Z0-9]+','-','g'))),
  c.id, s.city, s.space_type, s.style,
  case when s.amount >= 20000000 then 'Signature' when s.amount >= 10000000 then 'Premium' else 'Considered' end,
  s.amount, s.area, s.stage::public.project_stage,
  case s.stage when 'brief' then 6 when 'concept' then 20 when 'design_development' then 46
    when 'execution' then 68 + (s.n%3)*7 when 'handover' then 93 else 100 end,
  s.stage <> 'completed',
  'A '||lower(s.space_type)||' in '||s.city||' reimagined around '||lower(s.style)||' principles — daylight, tactile materials and quiet detailing across '||s.area||' sq ft.',
  '/portfolio/p'||(1+(s.n%8))||'.jpg',
  (array['Ira Kapoor','Devanshi Rao','Nikhil Menon','Sara Qureshi'])[1+(s.n%4)],
  current_date - (40 + s.n*11), current_date - (40 + s.n*11) + 165
from seed_src s
join public.clients c on c.email = lower(replace(replace(s.client_name,'. ','.'),' ','.'))||'@example.com';

-- rooms
insert into public.rooms (project_id, name, room_type, area_sqft, status, sort_order)
select p.id, r.name, r.rtype, greatest(90, (p.area_sqft/6)::int + r.ord*15),
  case when p.progress > 70 then 'execution' when p.progress > 35 then 'design' else 'brief' end, r.ord
from public.projects p
cross join (values
  ('Living Room','Living',1),('Kitchen & Dining','Kitchen',2),('Master Suite','Bedroom',3),
  ('Guest Bedroom','Bedroom',4),('Powder Room','Bathroom',5),('Study','Study',6)) as r(name,rtype,ord)
where r.ord <= 4 + (abs(hashtext(p.code)) % 3);

-- tasks
insert into public.tasks (project_id, room_id, title, description, assignee_name, status, priority, due_date)
select p.id,
  (select id from public.rooms rm where rm.project_id = p.id order by rm.sort_order limit 1 offset (t.ord%3)),
  t.title, t.descr, p.lead_designer_name,
  (case when t.ord*20 < p.progress then 'done' when t.ord*20 - 20 < p.progress then 'in_progress'
        when t.ord = 5 and p.progress < 30 then 'blocked' else 'todo' end)::public.task_status,
  (array['high','medium','low'])[1+(t.ord%3)],
  current_date + (t.ord*9 - 14)
from public.projects p
cross join (values
  (1,'Measure and site survey','Capture as-built dimensions, service points and daylight study.'),
  (2,'Concept moodboard','Material direction, palette and reference imagery for client review.'),
  (3,'Room-wise layout set','Furniture layouts and circulation for every room.'),
  (4,'Joinery detail drawings','Shop drawings for wardrobes, kitchen and TV unit.'),
  (5,'Vendor quotes & BOQ freeze','Collect three quotes per package and freeze the BOQ.'),
  (6,'Site coordination visit','Walk the site with the contractor and log snags.')) as t(ord,title,descr);

-- design files
insert into public.design_files (project_id, room_id, title, kind, file_url, version, uploaded_by_name, visible_to_client)
select p.id, rm.id, rm.name||' — '||d.label, d.kind, p.cover_image, d.ver, p.lead_designer_name, true
from public.projects p
join public.rooms rm on rm.project_id = p.id and rm.sort_order <= 3
cross join (values ('Concept render','render',1),('Revised render','render',2)) as d(label,kind,ver);

-- approvals
insert into public.approvals (project_id, room_id, design_file_id, title, notes, status, requested_at, decided_at, decided_by_name)
select p.id, rm.id,
  (select df.id from public.design_files df where df.room_id = rm.id order by df.version desc limit 1),
  rm.name||' design set', 'Please review the material palette and joinery layout for this room.',
  st.status::public.approval_status,
  now() - (rm.sort_order * interval '6 days'),
  case when st.status = 'pending' then null else now() - (rm.sort_order * interval '3 days') end,
  case when st.status = 'pending' then null else 'Client' end
from public.projects p
join public.rooms rm on rm.project_id = p.id and rm.sort_order <= 2
cross join lateral (select case
  when p.progress > 60 and rm.sort_order = 1 then 'approved'
  when p.progress > 30 and rm.sort_order = 2 then 'changes_requested'
  else 'pending' end as status) st;

insert into public.approval_comments (approval_id, author_name, body)
select a.id, 'Client',
  case a.status when 'approved' then 'Love this direction — happy to proceed.'
    when 'changes_requested' then 'Could we try a lighter stone on the island and warmer lighting?'
    else 'Looking forward to seeing the revised set.' end
from public.approvals a;

-- BOQ
insert into public.boq_items (project_id, room_id, category, description, unit, quantity, rate)
select p.id, (select id from public.rooms rm where rm.project_id=p.id order by rm.sort_order limit 1), b.cat, b.descr, b.unit,
  b.qty * (1 + (p.area_sqft/2000.0))::numeric(12,2), b.rate
from public.projects p
cross join (values
  ('Joinery','Wardrobe in oak veneer with soft-close fittings','sqft',120,2450),
  ('Joinery','Modular kitchen with quartz counter','sqft',95,3200),
  ('Flooring','Honed travertine flooring including laying','sqft',480,890),
  ('Finishes','Lime plaster wall finish, hand applied','sqft',620,340),
  ('Lighting','Architectural profile lighting with driver','rmt',85,1150),
  ('Furniture','Custom upholstered seating in linen','nos',6,48000)) as b(cat,descr,unit,qty,rate);

-- quotations
insert into public.quotations (project_id, number, status, subtotal, tax_percent, total, notes, issued_at, valid_until)
select p.id, 'QT-'||p.code, case when p.progress > 30 then 'accepted' else 'sent' end,
  round(p.budget_amount * 0.92, 2), 18, round(p.budget_amount * 0.92 * 1.18, 2),
  'Design fee and execution estimate as per frozen scope.', p.start_date + 20, p.start_date + 50
from public.projects p;

-- invoices
insert into public.invoices (project_id, number, milestone, status, amount, tax_percent, total, amount_paid, issued_at, due_at)
select p.id, 'IN-'||p.code||'-'||m.ord, m.label,
  (case when p.progress >= m.gate then 'paid'
        when p.progress >= m.gate - 20 then 'partial'
        when p.progress >= m.gate - 35 then 'sent' else 'draft' end)::public.invoice_status,
  round(p.budget_amount * m.share, 2), 18, round(p.budget_amount * m.share * 1.18, 2),
  case when p.progress >= m.gate then round(p.budget_amount * m.share * 1.18, 2)
       when p.progress >= m.gate - 20 then round(p.budget_amount * m.share * 1.18 * 0.4, 2) else 0 end,
  p.start_date + (m.ord*35), p.start_date + (m.ord*35) + 15
from public.projects p
cross join (values (1,'Design retainer',0.15,25),(2,'Design development',0.25,50),
  (3,'Execution milestone 1',0.35,75),(4,'Handover balance',0.25,100)) as m(ord,label,share,gate);

insert into public.payments (invoice_id, project_id, amount, method, reference, paid_at)
select i.id, i.project_id, i.amount_paid, 'bank_transfer', 'NEFT/'||i.number,
  coalesce(i.issued_at, current_date) + 6
from public.invoices i where i.amount_paid > 0;

-- vendors
insert into public.vendors (name, category, city, contact_name, email, phone, rating) values
 ('Deccan Joinery Works','Joinery','Bengaluru','Suresh Rao','hello@deccanjoinery.example','+91 9800011122',4.8),
 ('Terra Stone Traders','Stone','Mysuru','Imran Khan','sales@terrastone.example','+91 9800011123',4.6),
 ('Lumen Lighting Studio','Lighting','Mumbai','Neha Shah','studio@lumen.example','+91 9800011124',4.9),
 ('Weave & Warp Textiles','Textiles','Jaipur','Poonam Sethi','orders@weavewarp.example','+91 9800011125',4.4),
 ('Northline Contractors','Civil','Delhi','Gurpreet Singh','ops@northline.example','+91 9800011126',4.2),
 ('Cobble Surface Co.','Flooring','Pune','Amit Kale','info@cobble.example','+91 9800011127',4.5),
 ('Bramha Metal Craft','Metalwork','Ahmedabad','Jignesh Patel','work@bramhametal.example','+91 9800011128',4.7),
 ('Verde Plantscapes','Landscape','Goa','Maria Dias','green@verde.example','+91 9800011129',4.6);

insert into public.purchase_orders (project_id, vendor_id, number, status, total, expected_at)
select p.id, v.id, 'PO-'||p.code||'-'||v.rn,
  case when p.progress > 80 then 'delivered' when p.progress > 60 then 'in_transit' else 'issued' end,
  round(p.budget_amount * 0.08, 2), current_date + (20 + v.rn*7)::int
from public.projects p
join (select id, row_number() over (order by name) rn from public.vendors) v on v.rn <= 2
where p.progress >= 45;

insert into public.po_items (purchase_order_id, description, quantity, unit, rate)
select po.id, i.descr, i.qty, i.unit, i.rate
from public.purchase_orders po
cross join (values ('Veneered joinery panels, factory finished',180,'sqft',2450),
  ('Honed stone slabs including edge polish',240,'sqft',890)) as i(descr,qty,unit,rate);

-- site updates
insert into public.site_updates (project_id, title, body, image_url, progress, visible_to_client, created_by_name, created_at)
select p.id, u.title, u.body, p.cover_image, least(100, greatest(5, p.progress - (3-u.ord)*12)), true, p.lead_designer_name,
  now() - (u.ord * interval '9 days')
from public.projects p
cross join (values
  (1,'Civil work complete','Walls, plumbing lines and electrical conduiting signed off on site.'),
  (2,'Joinery installation underway','Wardrobes and kitchen carcasses installed; shutters arriving next week.'),
  (3,'Finishes and lighting','Lime plaster applied across living areas and profile lighting commissioned.')) as u(ord,title,body)
where p.progress >= 45;

-- documents
insert into public.documents (project_id, title, kind, file_url, visible_to_client, uploaded_by_name)
select p.id, d.title, d.kind, p.cover_image, d.vis, p.lead_designer_name
from public.projects p
cross join (values ('Design agreement','contract',true),('Working drawings set','drawing',true),
  ('Material specification','spec',true),('Internal cost sheet','internal',false)) as d(title,kind,vis);

-- media library
insert into public.media_assets (title, url, kind, tags, project_id)
select p.title||' — hero', p.cover_image, 'image',
  array[lower(p.space_type), lower(p.city)], p.id
from public.projects p;

-- case studies
insert into public.case_studies
 (project_id, slug, title, subtitle, location, year, hero_image, summary, brief, solution, materials, gallery, credits,
  space_type, style, area_sqft, featured, published, published_at, seo_title, seo_description)
select p.id, p.slug, p.title,
  p.style||' '||p.space_type||' in '||p.city, p.city, extract(year from p.target_date)::int, p.cover_image,
  'A '||lower(p.style)||' '||lower(p.space_type)||' of '||p.area_sqft||' sq ft, resolved around daylight, tactile stone and warm joinery.',
  p.brief,
  'We opened the plan toward the light, anchored the interior in honed stone and oak, and let brass detailing carry the accent. Every room was detailed as a shop drawing before a single panel was cut.',
  array['Honed travertine','Fumed oak veneer','Lime plaster','Antique brass','Belgian linen'],
  jsonb_build_array(
    jsonb_build_object('url','/portfolio/p'||(1+(abs(hashtext(p.code))%8))||'.jpg','caption','Living areas'),
    jsonb_build_object('url','/portfolio/p'||(1+(abs(hashtext(p.slug))%8))||'.jpg','caption','Kitchen and dining'),
    jsonb_build_object('url','/portfolio/p'||(1+(abs(hashtext(p.title))%8))||'.jpg','caption','Master suite')),
  jsonb_build_object('Lead designer',p.lead_designer_name,'Studio','Atelier Vermilion','Photography','Studio Anay'),
  p.space_type, p.style, p.area_sqft,
  (row_number() over (order by p.budget_amount desc)) <= 3,
  true, now() - (row_number() over (order by p.created_at) * interval '12 days'),
  p.title||' — '||p.space_type||' Interior Design, '||p.city,
  'Inside '||p.title||': a '||lower(p.style)||' '||lower(p.space_type)||' in '||p.city||' by Atelier Vermilion, detailed room by room across '||p.area_sqft||' sq ft.'
from public.projects p
where p.stage in ('completed','handover');

-- journal
insert into public.journal_posts (slug, title, excerpt, body, cover_image, category, author, read_minutes, published, published_at) values
 ('material-honesty','On Material Honesty','Why we specify fewer materials, and detail them harder.','Restraint is not austerity. When a project settles on five materials instead of fifteen, every junction has to be resolved rather than disguised.\n\nWe start every scheme with a stone, a timber and a metal. Everything else answers to them.','/portfolio/p6.jpg','Studio Notes','Ira Kapoor',5,true,now() - interval '9 days'),
 ('light-first-planning','Light-First Planning','How daylight studies reorder a floor plan before furniture ever appears.','Before a single layout, we chart the sun across the site for a full year. The plan follows the light: living areas take the long afternoon, bedrooms take the morning.','/portfolio/hero.jpg','Process','Devanshi Rao',6,true,now() - interval '24 days'),
 ('joinery-that-lasts','Joinery That Lasts a Decade','The fittings, edges and tolerances worth paying for.','Joinery fails at the edges. We specify 2mm solid lippings, soft-close European hardware and a 3mm shadow gap that forgives a settling wall.','/portfolio/p2.jpg','Craft','Nikhil Menon',7,true,now() - interval '38 days'),
 ('living-with-stone','Living With Stone','Travertine, limestone and the patina question.','Stone is a living finish. Sealed correctly, honed travertine gains a soft sheen where feet fall most — a record of the household rather than a defect.','/portfolio/p6.jpg','Materials','Sara Qureshi',4,true,now() - interval '52 days'),
 ('budget-conversation','The Budget Conversation','Where premium interiors actually spend their money.','Roughly 45% of a premium interior goes into joinery, 20% into stone and flooring, 12% into lighting. Knowing that early keeps the design honest.','/portfolio/p4.jpg','Studio Notes','Ira Kapoor',5,true,now() - interval '70 days'),
 ('handover-ritual','The Handover Ritual','Why we photograph, document and walk every project twice.','Handover is a design deliverable. Clients receive a bound care manual, a material register and two walkthroughs — one on completion, one ninety days later.','/portfolio/p3.jpg','Process','Devanshi Rao',4,true,now() - interval '95 days');

-- site settings
insert into public.site_settings (key, value) values
 ('studio', jsonb_build_object('name','Atelier Vermilion','tagline','Interiors detailed around light, stone and quiet craft','email','studio@ateliervermilion.example','phone','+91 98200 41100','city','Mumbai · Bengaluru','founded',2011)),
 ('stats', jsonb_build_object('projects',148,'cities',11,'years',15,'awards',9));

-- activity log
insert into public.activity_log (project_id, actor_label, action, entity, detail, created_at)
select p.id, p.lead_designer_name, a.action, a.entity, a.detail, now() - (a.ord * interval '5 days')
from public.projects p
cross join (values
  (1,'created','project','Project opened from a won lead.'),
  (2,'uploaded','design_file','Concept render set shared with the client.'),
  (3,'requested','approval','Design approval requested for the first two rooms.'),
  (4,'issued','invoice','Milestone invoice issued to the client.')) as a(ord,action,entity,detail);

-- notifications (role-wide)
insert into public.notifications (audience, project_id, title, body, link)
select 'project_manager'::public.app_role, p.id, 'Approval pending: '||p.title,
  'A client design approval has been waiting for more than three days.', '/studio/projects/'||p.slug
from public.projects p
join public.approvals a on a.project_id = p.id and a.status = 'pending'
group by p.id, p.title, p.slug;