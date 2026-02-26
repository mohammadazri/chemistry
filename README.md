# 🧪 HoloLab Virtual Chemistry Laboratory

Welcome to **HoloLab**—a state-of-the-art, browser-based 3D virtual chemistry laboratory. Built with performance and immersion in mind, HoloLab allows students and researchers to perform highly realistic acid-base titrations in a physically accurate 3D environment. HoloLab pushes the boundaries of educational technology, featuring real-time pH calculations, an interactive holographic UI, and fully gamified learning modules.

![HoloLab Preview](https://img.shields.io/badge/HoloLab-3D_Virtual_Lab-indigo?style=for-the-badge)

## ✨ Key Features

- **Immersive 3D Environment**: Powered by `React Three Fiber`, interact with realistic lab equipment (Burettes, Flasks, pH Meters) with precision-based mouse and touch controls.
- **Holographic Lab Assistant**: An intelligent, draggable, and dynamic floating holographic UI that guides users through experimental procedures without obstructing their view.
- **Realistic Chemistry Engine**: Accurate real-time simulations of drop-wise volume additions, titrant concentration calculations, indicator color changes (e.g., Phenolphthalein), and pH titration curves.
- **Advanced Data Visualization**: Real-time generation of interactive equivalence point graphs using `Chart.js`.
- **Gamified Learning & Assessment**: Built-in interactive tutorials, safety quizzes, and performance-based grading systems designed to lock/unlock capabilities dynamically.
- **Robust Full-Stack Architecture**: A scalable `Node.js`/`Express` backend equipped with `PostgreSQL` and `Prisma ORM` for secure user authentication, score tracking, and persistent lab data storage.

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

### Backend (Server)
- **Runtime:** Node.js (Express.js)
- **Database:** PostgreSQL 15 (Dockerized)
- **ORM:** Prisma
- **Security:** JWT (JSON Web Tokens) & bcrypt
- **Language:** TypeScript

---

## 🚀 Getting Started

Follow these steps to set up the HoloLab environment locally for development or testing.

### Prerequisites
Before you begin, ensure you have the following installed:
- **Node.js** (v20+ recommended)
- **Docker** & **Docker Compose**
- **Git**

### 1. Clone the Repository
```bash
git clone https://github.com/mohammadazri/chemistry.git
cd chemistry
```

### 2. Start the Database Environment
HoloLab uses a PostgreSQL database. Start it effortlessly using the provided Docker Compose file:
```bash
docker-compose up -d
```
*Note: This will expose Postgres on port `5432`.*

### 3. Configure the Backend
Navigate to the backend directory, set up your environment variables, install dependencies, and run the database migrations:
```bash
cd backend
cp .env.example .env
npm install
npx prisma migrate dev
npm run build
npm run dev
```

### 4. Run the Client Application
Open a new terminal window, navigate to the root (or frontend) directory, install dependencies, and start the Vite development server:
```bash
# From the project root
npm install
npm run dev
```

### 5. Access the Lab
Open your web browser and navigate to:
**[http://localhost:5173](http://localhost:5173)**

---

## 📖 Usage Guide

1. **Authentication:** Register a new student account or log in via the dashboard.
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
├── backend/                       # RESTful API Service
│   ├── prisma/                    # Schema models (User, Experiment, Score)
│   └── src/
│       ├── controllers/           # Route logic handlers
│       ├── middleware/            # JWT Auth & Validation
│       ├── routes/                # API Endpoints
│       └── server.ts              # Express App Bootstrapper
├── src/                           # Frontend React App
│   ├── components/
│   │   ├── lab/                   # 3D Models (Flask, Burette), Canvas, Assistant
│   │   ├── panels/                # Right Sidebar (Data, Charts, Controls)
│   │   ├── tutorial/              # Quizzes & Overlays
│   │   └── results/               # Grading Modals
│   ├── hooks/                     # Custom hooks (e.g., useExperiment logic)
│   ├── pages/                     # Login, Registration, Dashboard, Lab
│   ├── store/                     # Zustand state definitions
│   └── main.tsx                   # React Entry Point
├── public/                        # Static assets (Textures, HDRIs)
├── docker-compose.yml             # Local Postgres initialization
├── index.html                     # Vite HTML Entry
└── tailwind.config.ts             # Tailwind design system specifications
```

---

## 🔌 API Reference

The backend exposes several REST endpoints protected by JWT authentication (where applicable). Base URL: `/api`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET`  | `/health` | ❌ | Returns server health status |
| `POST` | `/auth/register` | ❌ | Registers a new student account |
| `POST` | `/auth/login` | ❌ | Authenticates user and returns JWT |
| `POST` | `/experiments/submit` | 🔐 | Submits titration results for grading |
| `GET`  | `/experiments/mine` | 🔐 | Retrieves logged-in user's past data |

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
