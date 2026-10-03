# Right-Angle-Design-Studio Backend API

Decoupled, enterprise-grade backend server for **Right-Angle-Design-Studio**. Built with Node.js, Express, TypeScript, Supabase PostgreSQL / MongoDB, and Google Drive API.

---

## 🏗️ Architecture & Features

- **MongoDB Atlas**: Fully pooled business database managing 26 collections (Projects, Clients, Leads, Enquiries, Media Metadata, Quotations, Invoices, Approvals, Site Updates, BOQ, Tasks, Team, Activity Logs).
- **Google Drive Media Engine**: Uploads directly to Google Drive (Root Folder: `1ix9RDbXHK0JVqsxPyfxYL8M1bCdHdBze`), with automated folder hierarchy (`Projects/Project-<ID>`, `Portfolio/`, `General/`), public CDN thumbnail formatting, and file lifecycle management.
- **Real JWT Authentication**: Bcrypt password hashing, secure HTTP-only cookies (`studio_auth_token`), and RBAC (`admin`, `designer`, `project_manager`, `accounts`, `client`).
- **Client Isolation**: Enforces tenant authorization so clients can only access their linked commissions.

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Configure Environment
Create `.env` inside `backend/` (or root):
```env
PORT=5000
MONGODB_URI=mongodb+srv://...
MONGODB_DB_NAME=interior_studio
JWT_SECRET=super-secret-jwt-key
GOOGLE_DRIVE_ROOT_FOLDER_ID=1ix9RDbXHK0JVqsxPyfxYL8M1bCdHdBze
GOOGLE_CLIENT_EMAIL=service-account@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

### 3. Seed Database
```bash
npm run seed
```

Default credentials seeded:
- **Studio Admin**: `ira@ateliervermilion.com` / `password123`
- **Client**: `ketan.patel@patelchem.com` / `password123`

### 4. Start Server
```bash
# Development (with hot-reloading)
npm run dev

# Build & Production
npm run build
npm run start
```

---

## 📡 API Endpoint Reference

### Health & Auth
- `GET /api/health` - Server health check
- `POST /api/auth/login` - Authenticate user, return JWT & set HTTP-only cookie
- `POST /api/auth/signup` - Register client / studio account
- `POST /api/auth/logout` - Clear auth session cookie
- `GET /api/auth/me` - Get current session info

### Public Website
- `GET /api/public/home` - Hero data, featured case studies, journal articles
- `GET /api/public/settings` - Public studio details & contact info
- `GET /api/public/projects` - Public portfolio case studies
- `GET /api/public/projects/:slug` - Full case study breakdown with related studies
- `GET /api/public/journal` - Journal articles
- `GET /api/public/journal/:slug` - Journal article content
- `POST /api/public/enquiries` - Submit consultation enquiry

### Studio & Projects
- `GET /api/projects` - List projects with filters
- `POST /api/projects` - Create new project
- `GET /api/projects/:id` - Full project workspace with rooms, tasks, design files, approvals, site updates
- `PATCH /api/projects/:id` - Update project details
- `DELETE /api/projects/:id` - Delete project and dependent records
- `POST /api/projects/:id/rooms` - Add room
- `POST /api/projects/:id/tasks` - Add task
- `POST /api/projects/:id/design-files` - Add design file
- `POST /api/projects/:id/approvals` - Create approval request
- `POST /api/projects/:id/site-updates` - Create site update
- `POST /api/projects/:id/documents` - Add document

### Media Engine
- `POST /api/media/upload` - Upload file to Google Drive & save metadata in MongoDB
- `GET /api/media` - List media with project/category/visibility filters
- `PATCH /api/media/:id` - Update media metadata
- `DELETE /api/media/:id` - Delete from Google Drive & MongoDB

### CRM & Leads
- `GET /api/clients` - List clients
- `POST /api/clients` - Create client
- `GET /api/leads` - List leads pipeline
- `POST /api/leads` - Create sales lead
- `POST /api/leads/:id/convert` - Convert lead to active project

### Finance
- `GET /api/finance/overview` - Invoiced, collected, receivables, expenses
- `GET /api/finance/quotations` - List quotations
- `POST /api/finance/quotations` - Create quotation
- `GET /api/finance/invoices` - List invoices
- `POST /api/finance/invoices` - Create invoice
- `GET /api/finance/payments` - List payments
- `POST /api/finance/payments` - Record payment
- `GET /api/finance/expenses` - List expenses
- `POST /api/finance/expenses` - Record expense
- `GET /api/finance/boq` - List BOQ items

### Client Portal
- `GET /api/portal/me` - Client commissions, approvals, invoices, site logs
- `GET /api/portal/projects/:id` - Client view for authorized project
- `POST /api/portal/approvals/:id/decide` - Client approval decision
- `POST /api/portal/approvals/:id/comments` - Post comment on approval
