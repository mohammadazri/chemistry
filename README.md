# HoloLab Virtual Chemistry Lab

HoloLab is an interactive, browser-based 3D virtual chemistry laboratory. Built with React Three Fiber and modern web technologies, it allows students to perform an acid-base titration in a realistic 3D environment with real-time pH calculation, interactive equipment, data logging, gamified scoring, and a fully polished user experience.

## Prerequisites
- Node.js 20+
- Docker Desktop
- Git

## Quick Start
1. `git clone [repo]`
2. `docker-compose up -d` (starts Postgres)
3. `cd backend && cp .env.example .env && npm install && npx prisma migrate dev && npm run dev`
4. `npm install && npm run dev` (from the root or frontend directory if separated)
5. Open `http://localhost:5173`

## First Run
- Register an account at `http://localhost:5173`
- Start the experiment and click through the safety and equipment tutorial
- Pass the Knowledge Check quiz to unlock the lab
- Alternatively, use the **Demo Mode** button for an automated playback presentation of the experiment

## Project Structure
```text
├── frontend/ (or root)
│   ├── index.html                     # Vite entry HTML
│   ├── vite.config.ts                 # Vite + React config
│   ├── tailwind.config.ts             # Tailwind setup
│   ├── tsconfig.json                  # TypeScript config
│   ├── package.json                   # Frontend deps
│   └── src/
│       ├── main.tsx                   # React DOM render root
│       ├── App.tsx                    # Router + layout shell
│       ├── store/                     # Zustand state management
│       ├── lib/                       # Math, Chemistry, Grading and API logic
│       ├── pages/                     # Login, Dashboard, and Lab pages
│       ├── components/                # 3D Lab, Sidebar Panels, Modals
│       └── hooks/                     # Custom React Hooks
├── backend/
│   ├── package.json                   # Backend deps
│   ├── tsconfig.json                  # Backend TS config
│   ├── prisma/
│   │   └── schema.prisma              # DB schema definition
│   └── src/
│       ├── server.ts                  # Express app entry
│       ├── db.ts                      # Prisma client singleton
│       ├── middleware/                # Auth and error handlers
│       └── routes/                    # API routes (Auth, Experiments)
├── docker-compose.yml                 # Local Postgres container
└── README.md                          # This file
```

## API Documentation

| Method | Path | Auth Required | Description |
|---|---|---|---|
| `GET` | `/health` | No | Server health check |
| `POST` | `/api/auth/register` | No | Create a new user account |
| `POST` | `/api/auth/login` | No | Authenticate user and return JWT |
| `POST` | `/api/experiments/submit` | Yes | Save completed titration experiment + score |
| `GET` | `/api/experiments/mine` | Yes | Get current user's past experiments |

## Troubleshooting
- **Database Connection Failed:** Ensure Docker Desktop is running and the `docker-compose up -d` command completed successfully. Check your `.env` connection string.
- **Port Already in Use:** If ports `3001` (backend) or `5173` (frontend) or `5432` (database) are occupied, you can kill the offending processes or change the ports in the respective `.env` files.
- **Prisma Client Issues:** If you get typing errors, run `npx prisma generate` inside the `backend` folder to update the local types.
