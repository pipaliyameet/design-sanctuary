# Atelier Vermilion — Interior Design Studio Management Platform

A high-performance, full-stack enterprise platform built for luxury interior architecture studios.

---

## 🏗️ Architecture Overview

The system is decoupled into a high-performance **Frontend** and a robust **Backend REST API**:

```
interior-studio/
│
├── frontend/                 # UI Only (React 19 + TanStack Router + Tailwind CSS)
│   ├── src/
│   │   ├── components/       # Reusable UI components & modals
│   │   ├── routes/           # File-based routes (Public website, Studio Admin, Client Portal)
│   │   ├── services/         # Centralized HTTP API client (No DB / No Secrets)
│   │   ├── types/            # Frontend API response interfaces
│   │   └── lib/              # Client-safe state & formatting helpers
│   ├── package.json
│   └── vite.config.ts
│
├── backend/                  # API, Database, Drive, Business Logic
│   ├── src/
│   │   ├── config/           # MongoDB Atlas & Google Drive configuration
│   │   ├── controllers/      # REST API route handlers
│   │   ├── middleware/       # JWT Auth, Role-Based Access Control, Multer Upload
│   │   ├── models/           # TypeScript Document schemas for MongoDB Atlas
│   │   ├── routes/           # Express API route declarations
│   │   ├── seed/             # Database initialization & seed scripts
│   │   ├── utils/            # JWT tokens, bcrypt hashing, JSON response envelope
│   │   ├── app.ts            # Express application middleware & routes
│   │   └── server.ts         # Server entrypoint & DB connection pooling
│   ├── package.json
│   └── tsconfig.json
│
├── .env.example              # Centralized environment template
├── package.json              # Monorepo orchestration scripts
└── README.md
```

---

## ⚡ Media & Data Storage Strategy

- **Application Data (MongoDB Atlas):**
  - Users, Clients, Projects, Rooms, Tasks, Design Files metadata, Approvals, Documents metadata, Invoices, Payments, Quotations, BOQ Items, Site Updates, Materials, Vendors, Activity Logs, Notifications.
  - *MongoDB stores only media metadata (URLs, Drive file IDs, captions, dimensions, category, visibility).*
- **Binary Assets (Google Drive):**
  - High-resolution renders, before/after photos, progress updates, floorplans, CAD/3D files, contract PDFs, and receipts are stored directly in **Google Drive** under Root Folder ID `1ix9RDbXHK0JVqsxPyfxYL8M1bCdHdBze`.

---

## 🚀 Quick Start & Local Development

### 1. Prerequisites
- **Node.js**: v20.x or later
- **MongoDB Atlas** database connection string
- **Google Drive** Service Account or OAuth credentials

### 2. Setup Environment Variables

Copy `.env.example` in `backend/`:
```bash
cp backend/.env.example backend/.env
```

Fill in your configuration:
```env
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/?retryWrites=true&w=majority
MONGODB_DB_NAME=interior_studio
JWT_SECRET=your-super-secret-jwt-signing-key-min-32-chars-long
GOOGLE_DRIVE_ROOT_FOLDER_ID=1ix9RDbXHK0JVqsxPyfxYL8M1bCdHdBze
GOOGLE_CLIENT_EMAIL=service-account@your-project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

Configure `frontend/.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Seed Database (Optional for Development)
Populate MongoDB Atlas with realistic studio records and seed accounts:
```bash
npm run seed
```

**Default Test Credentials:**
- **Studio Admin:** `ira@ateliervermilion.com` / `password123`
- **Client Portal:** `ketan.patel@patelchem.com` / `password123`

### 5. Start Full-Stack Dev Servers
```bash
npm run dev
```

- **Frontend Application:** [http://localhost:5173](http://localhost:5173)
- **Backend API Server:** [http://localhost:5000](http://localhost:5000)
- **API Health Check:** [http://localhost:5000/api/health](http://localhost:5000/api/health)

---

## 🔒 Security & Access Control

1. **Authentication:**
   - Password hashing with `bcryptjs`.
   - Signed JWT stored in secure HTTP-only cookies (`studio_auth_token`).
   - Automated authentication state recovery via `GET /api/auth/me`.
2. **Role-Based Access Control (RBAC):**
   - `admin`: Full studio control, financials, settings, team management.
   - `designer`: Project workspace, rooms, tasks, design files, media uploads.
   - `project_manager`: Projects, clients, site updates, approvals, tasks.
   - `accounts`: Quotations, invoices, payments, BOQ, expenses.
   - `client`: Strictly restricted to their own linked projects, approvals, documents, and invoices.

---

## 📡 API Reference Overview

| Endpoint | Method | Role | Description |
| :--- | :--- | :--- | :--- |
| `/api/auth/login` | POST | Public | Authenticate user & issue cookie |
| `/api/auth/me` | GET | Authenticated | Retrieve current session & profile |
| `/api/auth/logout` | POST | Authenticated | Clear authentication cookie |
| `/api/public/projects` | GET | Public | Published portfolio projects |
| `/api/public/enquiries` | POST | Public | Submit prospective client lead |
| `/api/dashboard/overview` | GET | Staff | Studio KPIs, workload, and finances |
| `/api/projects` | GET, POST | Staff | Projects list & creation |
| `/api/projects/:id` | GET, PATCH, DELETE | Project Access | Project workspace & sub-resources |
| `/api/media/upload` | POST | Staff | Upload file to Drive & store metadata |
| `/api/portal/overview` | GET | Client | Client portal dashboard & projects |
| `/api/portal/approvals/:id` | PATCH | Client | Client approval/rejection submission |
