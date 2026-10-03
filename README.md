# 🏛️ Right-Angle-Design-Studio — Interior Architecture Platform

A full-stack, enterprise-grade interior architecture and studio management platform featuring an editorial client-facing website, rich interactive studio portal, project pipelines, media galleries, quotation generators, financial tracking, and Google Drive / MongoDB backend sync.

---

## 📂 Project Structure (Separated Frontend & Backend)

```text
├── package.json              # Monorepo orchestration scripts
├── .gitignore                # Root Git ignore configuration
├── README.md                 # Project documentation
│
├── 🎨 frontend/              # FRONTEND APPLICATION (TanStack Start + React + Tailwind)
│   ├── .env                  # Frontend environment variables
│   ├── .env.example          # Frontend environment template
│   ├── .gitignore            # Frontend git ignore rules
│   ├── package.json          # Frontend dependencies & scripts
│   ├── tsconfig.json         # Frontend TypeScript config
│   ├── vite.config.ts        # Vite configuration
│   ├── components.json       # shadcn component configuration
│   ├── public/               # Static assets (favicons, videos, materials)
│   └── src/                  # React source code
│       ├── components/       # UI & layout components (app, site, studio, ui)
│       ├── config/           # Route & navigation configurations
│       ├── hooks/            # Custom React hooks
│       ├── integrations/     # Supabase client
│       ├── lib/              # Utility functions & data helpers
│       ├── routes/           # File-based routes (public site + studio portal)
│       ├── services/         # API services connecting to backend
│       ├── types/            # TypeScript interfaces
│       └── styles.css        # Tailwind CSS & design tokens
│
└── ⚙️ backend/               # BACKEND APPLICATION (Node.js + Express + TypeScript)
    ├── .env                  # Backend environment variables
    ├── .env.example          # Backend environment template
    ├── .gitignore            # Backend git ignore rules
    ├── package.json          # Backend dependencies & scripts
    ├── tsconfig.json         # Backend TypeScript config
    ├── vercel.json           # Vercel serverless deployment config
    ├── api/                  # Serverless entry point
    └── src/
        ├── config/           # MongoDB connection, Google Drive API, environment
        ├── controllers/      # Route controllers (auth, projects, leads, media, etc.)
        ├── middleware/       # Auth guards, JWT validation, error handlers
        ├── models/           # MongoDB data models & schemas
        ├── routes/           # Express REST API routes (`/api/*`)
        ├── seed/             # Initial database seeder script
        ├── server.ts         # Express server bootstrap
        └── utils/            # Helpers & token generators
```

---

## 🚀 Running the Project

### From Root Directory (Single Command):
```bash
# Run both Frontend and Backend concurrently:
npm run dev
```

### Individual Service Commands:
```bash
# Frontend only (http://localhost:8080)
npm run dev:frontend

# Backend only (http://localhost:5001)
npm run dev:backend

# Seed MongoDB with initial data
npm run seed
```

---

## 🔒 Environment Files

- **Frontend**: `frontend/.env` (based on `frontend/.env.example`)
- **Backend**: `backend/.env` (based on `backend/.env.example`)
