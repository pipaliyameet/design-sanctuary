# Interior Design Studio Platform

One system, three clearly distinct experiences: a cinematic public site, an internal studio workspace, and a calm client portal. Backed by Lovable Cloud (real auth, database, storage, roles). The local MongoDB connection string is not used — it cannot serve a deployed app.

## Experiences

**Public site (SSR, SEO-first)**
- Home with cinematic hero, signature projects, studio philosophy, services, press
- Portfolio index with filters (space type, style, city, budget band) and case-study detail pages (hero, brief, before/after, room-by-room gallery, materials, credits)
- Services, About/Studio, Journal (CMS articles), Contact with real enquiry form
- Editorial metadata per route, JSON-LD, sitemap/robots, responsive from 360px up

**Studio workspace (staff only)**
- Dashboard: active projects (25–30 scale), stage funnel, overdue tasks, approvals waiting, cash position
- CRM: enquiries inbox → lead pipeline (kanban) → convert to client + project
- Projects: list with saved filters, project detail with tabs — overview, rooms, tasks, design files, approvals, BOQ, invoices, procurement, site updates, activity
- Media library: uploads to Cloud storage, tagging, reuse across projects and case studies
- Finance: BOQ builder → quotation → invoices → payments recorded, outstanding view
- CMS: publish a project as a public case study, manage journal posts
- Team & roles, notifications, audit log viewer

**Client portal (calm, minimal)**
- Their project only: progress timeline, room-wise design sets, approve/request-changes with comments, documents, quotations/invoices with payment status, site update feed, messages

## Data model (normalized, Cloud/Postgres + RLS)

profiles, user_roles (`admin | designer | project_manager | accounts | client`), clients, enquiries, leads, projects, project_members, rooms, tasks, design_files, approvals, approval_comments, boq_items, quotations, quotation_items, invoices, invoice_items, payments, vendors, purchase_orders, po_items, site_updates, documents, media_assets, media_tags, case_studies, journal_posts, notifications, activity_log.

Rules: roles never live on profiles; a `has_role()` security-definer function drives policies. Staff see studio data by role; clients see only rows joined to their own project. Every public table gets explicit grants plus RLS. Storage buckets: `design-files`, `documents`, `media` (public read for published portfolio media only).

## Core flow wired end to end

Web enquiry → CRM lead → client + project created → rooms and tasks → design uploads → client approval (approve / changes requested, with comments) → BOQ → quotation → invoice → payment recorded → procurement PO and site updates → client portal reflects all of it → project published as a portfolio case study. Each step writes to the database and to the activity log; notifications fire to the relevant role.

## Design system

Architectural-editorial direction: warm stone and plaster neutrals, deep ink, a single brass accent; large display serif for headings, clean grotesque for UI; generous whitespace, wide image ratios, slow reveal-on-scroll. All colors and shadows as semantic tokens in `src/styles.css`. Public = cinematic and image-led; studio = dense, data-first, quiet chrome; portal = soft, spacious, low-anxiety. Real generated imagery for hero and case studies.

## Build phases (validated after each)

1. Cloud enable, schema + RLS + grants, rich seed migration (30 projects, clients, rooms, tasks, invoices, approvals, case studies, journal posts)
2. Design system, tokens, shared layout shells, auth + role routing
3. Public site with real published case studies and working enquiry form
4. Studio: CRM, projects, rooms/tasks, media, approvals
5. Finance, procurement, site updates, notifications, audit log
6. Client portal
7. CMS publishing, SEO polish, responsive and empty/error-state pass

## Technical notes

TanStack Start with file-based routes; server functions for all reads/writes (public reads via publishable client, staff/client reads via authenticated middleware). Protected routes live under `_authenticated`. Seed data ships inside the migration, not through page-load code. No placeholder buttons — anything visible is wired or absent.
