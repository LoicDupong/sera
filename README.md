# Sera

Event management app — create events, manage your guest list, and track RSVPs through a private link.

Built by **Loïc Dupong**.

---

## What it does

A host creates an event and gets a private invite link. Guests open the link, confirm their identity (first + last name), and submit their RSVP — no account needed. The host sees everything in a live dashboard.

**MVP scope:**
- Host auth (register / login)
- Create and manage events
- Manual guest list
- Private invite link per event
- Guest RSVP: yes / no / maybe
- Dashboard with RSVP stats and filters
- PWA installable

---

## Stack

| Layer | Tech |
|---|---|
| Frontend | Next.js App Router + SCSS Modules |
| Backend | Express |
| Database | PostgreSQL + Sequelize |
| Auth | JWT + argon2 |
| State | Zustand |
| API | REST |

---

## Project structure

```
sera/
├── frontend/          # Next.js App Router
│   ├── app/           # Pages (dashboard, invite, auth)
│   ├── components/    # Shared UI components
│   ├── styles/        # SCSS Modules per page
│   ├── store/         # Zustand auth store
│   └── lib/           # Axios instance
├── backend/           # Express API
│   └── src/
│       ├── controllers/
│       ├── models/    # Sequelize models
│       ├── routes/
│       └── middlewares/
└── docs/              # Product specs and design docs
```

---

## Getting started

### Prerequisites

- Node.js 18+
- PostgreSQL

### Backend

```bash
cd backend
cp .env.example .env   # fill DB credentials and JWT_SECRET
npm install
npm run dev
```

### Frontend

```bash
cd frontend
cp .env.local.example .env.local   # set NEXT_PUBLIC_API_URL
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Environment variables

**Backend `.env`**
```
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=sera
DB_USER=postgres
DB_PASS=yourpassword
JWT_SECRET=yoursecret
```

**Frontend `.env.local`**
```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

---

*Made by Loïc Dupong — [loic@dgco-it.be](mailto:loic@dgco-it.be)*
