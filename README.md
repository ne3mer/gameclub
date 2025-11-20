# GameClub Iran

GameClub Iran is a MERN/Next.js platform for selling legal PS5 digital accounts with automated delivery, strong guarantees, and Persian-first UX designed for gamers in Iran.

## Tech Stack
- **Frontend**: Next.js 16 (App Router) + Tailwind v4, RTL layout, design system-ready components
- **Backend**: Node.js + Express + TypeScript, MongoDB via Mongoose, Zod validation
- **Integrations (planned)**: Iranian PSP callbacks (Zarinpal/IDPay), Telegram bot + email notifications

## Project Layout
```
nextPlay/
├── frontend/   # Next.js app (marketing site, catalog, dashboards)
├── backend/    # Express API (auth, games, inventory, orders, alerts)
└── README.md   # This file
```

## Getting Started

### Frontend
```bash
cd frontend
npm install    # already run during bootstrap
npm run dev    # http://localhost:3000
```

### Backend
```bash
cd backend
cp .env.example .env
npm install    # already run during bootstrap
npm run dev    # http://localhost:5050
```

Backend env highlights:
- `ADMIN_API_KEY`: shared secret for admin-only routes (e.g., CRUD on games). Set the same value in the frontend as `NEXT_PUBLIC_ADMIN_API_KEY`.

### Frontend
- Create `.env.local` (or export env vars) with:
  ```
  NEXT_PUBLIC_API_URL=http://localhost:5050
  NEXT_PUBLIC_ADMIN_API_KEY=dev-admin-key
  ```
- These variables allow the admin dashboard to call the protected backend endpoints.

The backend currently exposes `/health` and `/api/games` endpoints (GET/POST) with MongoDB models ready for accounts, orders, alerts, and reviews. Expand controllers/services as features mature.

## Next Steps
1. Flesh out authentication (JWT + refresh), user model hooks, and role-based middleware for admin panel routes.
2. Build catalog filters + dynamic routing on the frontend using TanStack Query hooked to the `/api/games` endpoint.
3. Implement inventory + order assignment services, plus notification adapters for Telegram and email.
4. Wire payment gateway callbacks and success page data hydration from backend orders.
