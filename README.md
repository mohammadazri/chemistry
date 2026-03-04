# 🧪 HoloLab Virtual Chemistry Laboratory

Welcome to **HoloLab**—a state-of-the-art, browser-based 3D virtual chemistry laboratory. Built with performance and immersion in mind, HoloLab allows students and researchers to perform highly realistic acid-base titrations in a physically accurate 3D environment. HoloLab pushes the boundaries of educational technology, featuring real-time pH calculations, an interactive holographic UI, and fully gamified learning modules.

![HoloLab Preview](https://img.shields.io/badge/HoloLab-3D_Virtual_Lab-indigo?style=for-the-badge)

## ✨ Key Features

- **Immersive 3D Environment**: Powered by `React Three Fiber`, interact with realistic lab equipment (Burettes, Flasks, pH Meters, Wash Bottles) set within a highly detailed lab room featuring an Emergency Shower, Periodic Table Poster, Side Desk, and Analog Clock.
- **Holographic Lab Assistant**: An intelligent, draggable, and dynamic floating holographic UI that guides users through experimental procedures without obstructing their view.
- **Realistic Chemistry Engine**: Accurate real-time simulations of drop-wise volume additions, titrant concentration calculations, realistic fluid pouring and drop mechanics, indicator color changes (e.g., Phenolphthalein), and pH titration curves.
- **Advanced Data Visualization**: Real-time generation of interactive equivalence point graphs using `Chart.js` alongside a dedicated Analytics Panel.
- **Gamified Learning & Assessment**: Built-in interactive tutorials, safety quizzes, and performance-based grading systems designed to lock/unlock capabilities dynamically.
- **Theming & Design**: Full light and dark mode support with a premium Glassmorphism UI driven by a custom Zustand theme store.
- **Supabase-Powered Backend**: Secure authentication via Supabase Auth, with hosted PostgreSQL database protected by Row Level Security (RLS) policies. No separate backend server required.

---

## 🛠 Technology Stack

### Frontend (Client)
- **Framework:** React 19 + TypeScript + Vite
- **3D Rendering:** Three.js + React Three Fiber + Drei
- **State Management:** Zustand
- **Styling:** Tailwind CSS V4 + Glassmorphism UI
- **Routing:** React Router DOM
- **Charting:** Chart.js + react-chartjs-2
- **Icons:** Lucide React

### Backend (Supabase)
- **Authentication:** Supabase Auth (email/password with session management)
- **Database:** Supabase-hosted PostgreSQL with Row Level Security
- **Client SDK:** `@supabase/supabase-js`
- **Security:** RLS policies (users can only access their own data)

---

## 🚀 Getting Started

Follow these steps to set up the HoloLab environment locally for development or testing.

### Prerequisites
Before you begin, ensure you have the following installed:
- **Node.js** (v20+ recommended)
- **Git**
- A **Supabase** project ([supabase.com](https://supabase.com)) with the database migration applied

### 1. Clone the Repository
```bash
git clone https://github.com/mohammadazri/chemistry.git
cd chemistry
```

### 2. Configure Environment Variables
Create a `.env` file in the project root (or copy from the example):
```bash
cp .env.example .env
```

Then edit `.env` with your Supabase project credentials:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

> **Where to find these:** Supabase Dashboard → Project Settings → API

### 3. Set Up the Database
Run the SQL migration in your Supabase Dashboard (SQL Editor → New Query):
- File: [`supabase/migrations/001_create_experiments.sql`](supabase/migrations/001_create_experiments.sql)

This creates the `experiments` table with Row Level Security policies.

### 4. Install & Run
```bash
npm install
npm run dev
```

### 5. Access the Lab
Open your web browser and navigate to:
**[http://localhost:5173](http://localhost:5173)**

---

## 📖 Usage Guide

1. **Authentication:** Register a new student account or log in via the dashboard. Authentication is handled by Supabase Auth — no separate backend server needed.
2. **Onboarding:** First-time users must complete the interactive tutorial and pass the Lab Safety Knowledge Check to unlock the 3D environment.
3. **The Experiment:**
   - Follow the Holographic Assistant's guide on the left of the screen.
   - Use the "Controls" tab in the right sidebar to carefully add 0.1M NaOH to the flask.
   - Monitor the pH meter and the real-time equivalence curve.
   - Stop at the exact endpoint (pale pink hue) for maximum grading accuracy!
4. **Auto-Demo:** Too tired to titrate? Use the Auto-Demo feature in the toolbar to watch the experiment execute perfectly via automated cinematic controls.

---

## 📂 Project Architecture

```text
HoloLab/
├── src/                           # Frontend React App
│   ├── components/
│   │   ├── lab/                   # 3D Models (Flask, Burette), Canvas, Assistant
│   │   ├── panels/                # Right Sidebar (Data, Charts, Controls)
│   │   ├── tutorial/              # Quizzes & Overlays
│   │   └── results/               # Grading Modals
│   ├── hooks/                     # Custom hooks (e.g., useExperiment logic)
│   ├── lib/
│   │   ├── supabase.ts            # Supabase client initialization
│   │   ├── chemistry.ts           # pH calculation engine
│   │   └── grading.ts             # Scoring logic
│   ├── pages/                     # Login, Dashboard, Lab
│   ├── store/                     # Zustand state definitions
│   └── main.tsx                   # React Entry Point
├── supabase/
│   └── migrations/                # SQL migrations for Supabase
│       └── 001_create_experiments.sql
├── public/                        # Static assets (Textures, HDRIs)
├── index.html                     # Vite HTML Entry
└── .env.example                   # Environment variable template
```

---

## 🔌 Data Architecture

HoloLab connects directly to Supabase from the frontend — no custom backend server needed.

| Concern | Technology | Details |
|---------|-----------|---------|
| **Auth** | Supabase Auth | Email/password sign-up & sign-in, auto-managed sessions |
| **Database** | Supabase PostgreSQL | Hosted, with RLS for per-user data isolation |
| **Experiments** | `experiments` table | Stores titration data, scores, and calculated concentrations |
| **Security** | Row Level Security | Users can only CRUD their own experiment records |

---

## 🤝 Contributing
Contributions, issues, and feature requests are welcome! 
1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License
This project is proprietary and built for educational simulation purposes. (Include your standard license details here).
