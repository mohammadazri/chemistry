


HOLOLAB
Virtual Chemistry Laboratory

AGENT DEVELOPMENT PLAN

Acid-Base Titration Simulator

Version 1.0  |  February 26, 2026


Prepared for Agent-Driven Development  |  Investor Demo Build



 
How to Use This Document
This document is your agent's complete build guide. Each task is self-contained with a specific file to create, its role in the system, the exact logic to implement, and a testable outcome you can verify visually or via browser. Work through tasks in order within each phase — later tasks depend on earlier ones.

Symbol	Meaning
FILE:	Exact file path the agent must create or edit
ROLE:	What this file does in the overall system
INPUTS:	Data or files this task consumes
OUTPUTS:	What you can see/test when done
LOGIC:	Step-by-step implementation instructions
ACCEPT:	How to verify the task is complete

 
1. Project Architecture & File Structure
1.1 Technology Stack
The stack is designed for a fast investor demo: React 18 + Vite for instant hot-reload, Three.js via React Three Fiber for 3D, Tailwind for styling, Zustand for state, and Chart.js for the live pH curve. Backend is Node/Express with PostgreSQL. No native mobile — browser only.

Layer	Technology	Why
Frontend Framework	React 18 + Vite	Fast dev server, hot module reload
3D Rendering	Three.js + React Three Fiber	Declarative 3D, huge ecosystem
Styling	Tailwind CSS	Zero-config utility classes
State Management	Zustand	Tiny, no boilerplate
Charts	Chart.js + react-chartjs-2	Real-time pH curve
Backend	Node.js + Express	Simple REST API
Database	PostgreSQL + Prisma ORM	Type-safe DB queries
Auth	JWT + bcrypt	Stateless, secure
3D Models	GLTF/GLB files	Standard, Three.js native

1.2 Complete File Tree
Every file listed below will be built as an individual task. The tree is the north star — agents should not create files outside this structure without approval.

├── hololab/
├── frontend/
│   ├── index.html                     # Vite entry HTML
│   ├── vite.config.ts                 # Vite + React config
│   ├── tailwind.config.ts             # Tailwind setup
│   ├── tsconfig.json                  # TypeScript config
│   ├── package.json                   # Frontend deps
│   │
│   ├── public/
│   │   ├── models/
│   │   │   ├── burette.glb            # 3D burette model
│   │   │   ├── flask.glb              # 3D Erlenmeyer flask
│   │   │   ├── lab_bench.glb          # 3D lab bench/room
│   │   │   └── ph_meter.glb           # 3D pH meter
│   │   │
│   │   └── textures/
│   │       ├── wood_grain.jpg         # Bench texture
│   │       └── tile_floor.jpg         # Floor texture
│   │
│   └── src/
│       ├── main.tsx                   # React DOM render root
│       ├── App.tsx                    # Router + layout shell
│       │
│       ├── store/
│       │   ├── experimentStore.ts     # Core experiment state (Zustand)
│       │   ├── uiStore.ts             # UI state (panels, modals)
│       │   └── userStore.ts           # Auth + user profile state
│       │
│       ├── lib/
│       │   ├── chemistry.ts           # pH calculation engine
│       │   ├── grading.ts             # Scoring logic
│       │   └── api.ts                 # Axios API client
│       │
│       ├── pages/
│       │   ├── LoginPage.tsx          # Login / register screen
│       │   ├── DashboardPage.tsx      # Student home + history
│       │   └── LabPage.tsx            # Main experiment page
│       │
│       ├── components/
│       │   ├── ui/
│       │   │   ├── Button.tsx         # Reusable button
│       │   │   ├── Modal.tsx          # Reusable modal overlay
│       │   │   └── Badge.tsx          # Achievement badge
│       │   │
│       │   ├── lab/
│       │   │   ├── LabScene.tsx       # R3F Canvas + scene root
│       │   │   ├── LabEnvironment.tsx # Lighting + floor + walls
│       │   │   ├── BuretteModel.tsx   # Interactive burette 3D
│       │   │   ├── FlaskModel.tsx     # Interactive flask 3D
│       │   │   ├── PhMeterModel.tsx   # pH meter 3D
│       │   │   ├── LiquidShader.tsx   # Liquid color material
│       │   │   └── MolecularView.tsx  # Particle ion visualization
│       │   │
│       │   ├── panels/
│       │   │   ├── RightSidebar.tsx     # Sidebar container
│       │   │   ├── StepInstructions.tsx # Current step guide
│       │   │   ├── DataTable.tsx        # Live readings table
│       │   │   ├── PhCurveChart.tsx     # Real-time pH chart
│       │   │   └── BuretteControls.tsx  # +0.01/+0.1/+1 buttons
│       │   │
│       │   ├── tutorial/
│       │   │   ├── TutorialOverlay.tsx  # Pre-lab tutorial modal
│       │   │   └── QuizModal.tsx        # Pre-lab quiz
│       │   │
│       │   └── results/
│       │       ├── ResultsModal.tsx     # Final score display
│       │       └── FeedbackPanel.tsx    # Error + suggestion list
│       │
│       └── hooks/
│           ├── useExperiment.ts        # Experiment action hooks
│           ├── useAuth.ts              # Login/logout hooks
│           └── useThree.ts             # Three.js camera helpers
│
├── backend/
│   ├── package.json                   # Backend deps
│   ├── tsconfig.json                  # Backend TS config
│   │
│   ├── prisma/
│   │   └── schema.prisma              # DB schema definition
│   │
│   └── src/
│       ├── server.ts                  # Express app entry
│       ├── db.ts                      # Prisma client singleton
│       │
│       ├── middleware/
│       │   ├── auth.ts                # JWT verify middleware
│       │   └── errorHandler.ts        # Global error handler
│       │
│       └── routes/
│           ├── auth.ts                # POST /register, /login
│           ├── experiments.ts         # CRUD experiment endpoints
│           └── analytics.ts           # GET progress endpoint
│
├── .env.example                       # Env var template
├── docker-compose.yml                 # Local Postgres + Redis
└── README.md                          # Setup instructions

 
2. Phase 1 — Project Setup (Week 1)
Goal: Running dev server with routing, empty pages, and connected state stores. You should see the app in the browser with navigation working before any 3D or chemistry logic.

TASK-001 — Frontend Scaffold
Task #	TASK-001	File	frontend/package.json, vite.config.ts, tsconfig.json, tailwind.config.ts
Title	Create Vite + React + TypeScript Frontend	Role	Project foundation — nothing else runs without this
Inputs	None (start from scratch)	Outputs	npm run dev launches on localhost:5173 with blank React page
Logic / Steps	1. Run: npm create vite@latest frontend -- --template react-ts 2. cd frontend && npm install 3. npm install -D tailwindcss postcss autoprefixer 4. npx tailwindcss init -p 5. In tailwind.config.ts set content: ['./src/**/*.{ts,tsx}'] 6. In src/index.css add: @tailwind base; @tailwind components; @tailwind utilities; 7. Install deps: npm install three @react-three/fiber @react-three/drei zustand chart.js react-chartjs-2 axios react-router-dom @types/three	Acceptance Criteria	Browser shows 'Vite + React' on localhost:5173. No TypeScript errors on npm run build.

TASK-002 — App Router & Pages Shell
Task #	TASK-002	File	src/main.tsx, src/App.tsx, src/pages/LoginPage.tsx, src/pages/DashboardPage.tsx, src/pages/LabPage.tsx
Title	Create React Router with 3 empty page shells	Role	Defines URL structure. / = Login, /dashboard = Dashboard, /lab = Lab
Inputs	TASK-001 complete	Outputs	3 pages render at correct URLs with visible page name text
Logic / Steps	1. In main.tsx: wrap App in <BrowserRouter> 2. In App.tsx: use <Routes>. Route '/' renders LoginPage. Route '/dashboard' renders DashboardPage. Route '/lab' renders LabPage. 3. Each page file: export default function and return <div className='p-8 text-2xl'>PageName Page</div> 4. Add nav links in App.tsx to test routing	Acceptance Criteria	Visit localhost:5173 — shows Login text. Visit /dashboard — shows Dashboard text. Visit /lab — shows Lab text.

TASK-003 — Zustand State Stores
Task #	TASK-003	File	src/store/experimentStore.ts, src/store/uiStore.ts, src/store/userStore.ts
Title	Create 3 Zustand stores	Role	Single source of truth for all app state. Other components read/write here.
Inputs	TASK-001 complete	Outputs	Stores importable with correct TypeScript types
Logic / Steps	experimentStore.ts state shape:   - currentStep: number (0-4)   - hclConcentration: number (default 0.1 mol/L)   - naohConcentration: number (default 0.1 mol/L)   - volumeAdded: number (mL, starts 0)   - currentPH: number (starts 13.0)   - titrationData: Array<{volume: number, ph: number}>   - isRunning: boolean   - score: number | null   actions: addVolume(mL), resetExperiment(), setScore(n)  uiStore.ts state:   - showTutorial: boolean (default true)   - showMolecular: boolean (default false)   - showResults: boolean (default false)   - sidebarTab: 'steps' | 'data' | 'chart'   actions: toggle each boolean, setSidebarTab  userStore.ts state:   - user: {id, email, name} | null   - token: string | null   actions: setUser, logout	Acceptance Criteria	Import stores in App.tsx and console.log initial state — all fields show correct defaults. No TypeScript errors.

TASK-004 — Backend Scaffold
Task #	TASK-004	File	backend/package.json, backend/tsconfig.json, backend/src/server.ts, backend/src/db.ts, backend/prisma/schema.prisma
Title	Create Express + TypeScript backend with Prisma	Role	REST API server. Handles auth, experiment saves, analytics.
Inputs	Node.js installed	Outputs	Server running on localhost:3001 returning {ok: true} at GET /health
Logic / Steps	1. mkdir backend && cd backend && npm init -y 2. npm install express prisma @prisma/client bcrypt jsonwebtoken cors dotenv 3. npm install -D typescript ts-node @types/express @types/bcrypt @types/jsonwebtoken nodemon 4. Create tsconfig.json: {compilerOptions:{target:'ES2020',module:'commonjs',outDir:'dist',strict:true}} 5. server.ts: create Express app, add cors(), express.json(), add GET /health returning {ok:true}, listen on PORT=3001 6. db.ts: export const prisma = new PrismaClient() 7. schema.prisma: define User, Experiment, Analytics models (see Section 5 of original spec) 8. npx prisma generate 9. In package.json scripts: dev: 'nodemon src/server.ts'	Acceptance Criteria	curl localhost:3001/health returns {"ok":true}. npx prisma validate passes with no errors.

TASK-005 — Docker Compose for Local DB
Task #	TASK-005	File	docker-compose.yml, .env.example
Title	Create docker-compose.yml for local Postgres	Role	Gives every developer a one-command local database. No manual Postgres install needed.
Inputs	Docker installed	Outputs	Postgres accessible at localhost:5432
Logic / Steps	docker-compose.yml:   version: '3.8'   services:     db:       image: postgres:15       environment:         POSTGRES_USER: hololab         POSTGRES_PASSWORD: hololab123         POSTGRES_DB: hololab_dev       ports: ['5432:5432']       volumes: [postgres_data:/var/lib/postgresql/data]   volumes:     postgres_data:  .env.example:   DATABASE_URL=postgresql://hololab:hololab123@localhost:5432/hololab_dev   JWT_SECRET=your-secret-here   PORT=3001   CLIENT_URL=http://localhost:5173	Acceptance Criteria	docker-compose up -d runs without errors. psql -h localhost -U hololab -d hololab_dev connects successfully.

 
3. Phase 2 — Chemistry Engine & 3D Scene (Weeks 2–4)
Goal: The lab scene renders in 3D with interactive equipment, and the chemistry calculations are accurate. This is the technical heart of the demo. Complete chemistry.ts first — the 3D components depend on it for pH values.

TASK-006 — Chemistry Calculation Engine
Task #	TASK-006	File	src/lib/chemistry.ts
Title	Build the pH calculation library	Role	Pure functions that calculate pH at any point during titration. No UI. No side effects. Testable in isolation.
Inputs	None	Outputs	Import functions into browser console and verify pH values match expected titration curve
Logic / Steps	Export these functions:  1. calculatePH(volHCL_added: number, concHCL: number, volNaOH: number, concNaOH: number): number   Algorithm:   - molesHCL = volHCL_added/1000 * concHCL   - molesNaOH = volNaOH/1000 * concNaOH   - molesExcess = molesHCL - molesNaOH   - totalVol = (volHCL_added + volNaOH) / 1000 (in liters)   - if molesExcess > 0: pH = -Math.log10(molesExcess / totalVol)   - if molesExcess < 0: pOH = -Math.log10(-molesExcess / totalVol); pH = 14 - pOH   - if molesExcess === 0: pH = 7.0 (equivalence point)   - Clamp result: Math.max(0, Math.min(14, pH))  2. getEquivalenceVolume(concHCL: number, volNaOH: number, concNaOH: number): number   Returns: (concNaOH * volNaOH) / concHCL (mL of HCL needed)  3. getIndicatorColor(indicator: string, ph: number): string   indicator='phenolphthalein': ph<8.2 -> '#FFF5EE' (near clear), ph>10 -> '#FF69B4' (pink), between -> interpolate   indicator='methylOrange': ph<3.1 -> '#FF4500', ph>4.4 -> '#FFD700', between -> interpolate   Returns CSS hex color string  4. getPhaseLabel(ph: number): string   ph<7 -> 'Acidic', ph===7 -> 'Neutral', ph>7 -> 'Basic'	Acceptance Criteria	In browser console:   calculatePH(0, 0.1, 25, 0.1) returns ~13 (pure NaOH)   calculatePH(25, 0.1, 25, 0.1) returns 7.0 (equivalence)   calculatePH(50, 0.1, 25, 0.1) returns ~1 (excess HCL)

TASK-007 — Experiment Store Integration
Task #	TASK-007	File	src/store/experimentStore.ts (edit)
Title	Wire chemistry.ts into experimentStore addVolume action	Role	Every time user adds volume, store recalculates pH and appends to titration data array
Inputs	TASK-003, TASK-006	Outputs	Call addVolume in console — currentPH updates, titrationData array grows
Logic / Steps	Update addVolume(ml: number) action in experimentStore:   1. Read current state: volumeAdded, hclConcentration, naohConcentration (default volNaOH=25mL)   2. newVolume = volumeAdded + ml   3. newPH = calculatePH(newVolume, hclConcentration, 25, naohConcentration)   4. Set state: volumeAdded = newVolume, currentPH = newPH   5. Append {volume: newVolume, ph: newPH} to titrationData array   6. If newVolume >= getEquivalenceVolume() + 5: set isRunning = false	Acceptance Criteria	Open browser, import store, call addVolume(1) ten times. Log state after each call. Volume increases by 1 each time, pH drops from ~13 toward 7.

TASK-008 — 3D Lab Scene Base
Task #	TASK-008	File	src/components/lab/LabScene.tsx, src/components/lab/LabEnvironment.tsx
Title	Create the R3F Canvas with lighting and environment	Role	The 3D viewport. Renders in left 70% of LabPage. All 3D objects are children of this canvas.
Inputs	TASK-002	Outputs	LabPage shows a lit 3D scene with a grey floor plane visible
Logic / Steps	LabScene.tsx:   - Import Canvas from @react-three/fiber   - Import OrbitControls, Environment from @react-three/drei   - Canvas style: width 70%, height 100vh, background #1a1a2e   - Inside Canvas: <LabEnvironment /> + <OrbitControls enablePan={false} maxPolarAngle={Math.PI/2} />   - Add <Suspense fallback={null}> wrapper  LabEnvironment.tsx:   - Ambient light intensity 0.4   - DirectionalLight position={[5, 10, 5]} intensity={1.2} castShadow   - PointLight position={[-3, 3, -3]} intensity={0.5} color='#4fc3f7'   - Floor: <mesh rotation={[-Math.PI/2, 0, 0]}><planeGeometry args={[20, 20]}/><meshStandardMaterial color='#ecf0f1'/></mesh>   - Lab bench box: position={[0, -0.5, 0]}, args={[4, 0.2, 2]}, color='#8B6914'	Acceptance Criteria	Visit /lab. Right half is dark placeholder. Left 70% shows a lit grey floor and brown lab bench box. Mouse drag rotates view. No console errors.

TASK-009 — Burette 3D Component
Task #	TASK-009	File	src/components/lab/BuretteModel.tsx
Title	Build interactive burette using Three.js primitives	Role	The main titration tool. Renders as a glass cylinder. Liquid level drops as volume is added. Clicking opens the stopcock.
Inputs	TASK-008, TASK-007	Outputs	Burette visible in scene, liquid level drops when addVolume called
Logic / Steps	Use Three.js primitives (no GLB needed for demo):   1. Outer tube: CylinderGeometry(0.08, 0.08, 3, 16) transparent MeshPhysicalMaterial opacity=0.3   2. Liquid inside: CylinderGeometry(0.07, 0.07, liquidHeight, 16)      liquidHeight = 2.8 * (1 - volumeAdded/50) — shrinks from top as volume added      Color from getIndicatorColor('phenolphthalein', 13) (starts faint pink)   3. Stopcock sphere at bottom: SphereGeometry(0.1) red MeshStandardMaterial   4. Tick marks: use 10 white LineSegments at even intervals on the tube   5. Position whole group at {[0.5, 1.5, 0]}   6. Read volumeAdded from experimentStore   7. On stopcock click: call addVolume(0.1) from store	Acceptance Criteria	Burette appears as glass cylinder in scene. Top liquid level visibly drops each time stopcock is clicked. No console errors.

TASK-010 — Flask 3D Component
Task #	TASK-010	File	src/components/lab/FlaskModel.tsx, src/components/lab/LiquidShader.tsx
Title	Build Erlenmeyer flask with dynamic liquid color	Role	The container for NaOH. Color changes from pink to colorless as HCL neutralizes it — the key visual moment of the experiment.
Inputs	TASK-008, TASK-006	Outputs	Flask shows colored liquid that changes color when near equivalence point
Logic / Steps	FlaskModel.tsx:   1. Flask body approximation: CylinderGeometry(0.3, 0.2, 0.6, 20) for body + CylinderGeometry(0.08, 0.08, 0.3, 12) for neck — combine as Group   2. Glass material: MeshPhysicalMaterial {transparent:true, opacity:0.25, roughness:0, metalness:0}   3. Liquid mesh fills bottom 60% of flask body   4. Liquid color: read currentPH from store, call getIndicatorColor('phenolphthalein', currentPH)   5. Add slow rotation animation useFrame: flask.current.rotation.y += 0.003 (mimics swirling)   6. Position at {[-0.5, -0.2, 0]}  LiquidShader.tsx:   - Export function getLiquidColor(ph: number): THREE.Color   - ph > 8.2: return pink #FF69B4 interpolated by (ph-8.2)/1.8   - ph < 8.2: return near-clear #FFF8F0	Acceptance Criteria	Flask visible on bench. Initially pink/faint color. Click stopcock 30 times — liquid transitions from pink to colorless. Clear color change visible at equivalence point.

TASK-011 — pH Meter 3D Component
Task #	TASK-011	File	src/components/lab/PhMeterModel.tsx
Title	Build pH meter box with live digital display	Role	Displays current pH in the 3D scene as a glowing number. Reinforces that pH is changing in real-time.
Inputs	TASK-008, TASK-007	Outputs	pH number visible in 3D scene, updates when addVolume called
Logic / Steps	1. Device body: BoxGeometry(0.6, 0.4, 0.15) dark grey MeshStandardMaterial 2. Screen face: BoxGeometry(0.45, 0.25, 0.02) positioned on front face, emissive '#001a00' 3. pH number: use <Text> from @react-three/drei    - text={currentPH.toFixed(2)}    - color based on pH: <7='#ff4444', 7='#44ff44', >7='#4444ff'    - fontSize=0.12, position on screen face 4. Label text: 'pH' above number, white, fontSize=0.06 5. Electrode: thin cylinder extending from bottom of device into flask region 6. Position device at {[1.2, 0, 0]} 7. Read currentPH from experimentStore	Acceptance Criteria	pH meter box visible in scene. Shows number like '13.00' at experiment start. Decreases visibly as volume added. Color of number changes from blue (basic) to green (neutral) to red (acidic).

 
4. Phase 3 — UI Panels & Workflow (Weeks 4–5)
Goal: The right sidebar is functional with step instructions, data table, and live pH chart. Students can follow the workflow from Step 1 through Step 5. All interactions reflect in the 3D scene.

TASK-012 — Right Sidebar Layout
Task #	TASK-012	File	src/components/panels/RightSidebar.tsx
Title	Build the right panel container with tab navigation	Role	Hosts all experiment controls and data. Takes 30% screen width alongside the 3D canvas.
Inputs	TASK-002	Outputs	Lab page shows sidebar with 3 tabs: Steps, Data, Chart
Logic / Steps	1. LabPage.tsx layout: flex row, left div w-[70%] for LabScene, right div w-[30%] h-screen overflow-y-auto bg-gray-900 2. RightSidebar.tsx:    - 3 tab buttons at top: Steps / Data / Chart    - Active tab highlighted blue    - Tab content area below renders based on sidebarTab from uiStore    - Steps tab: renders <StepInstructions />    - Data tab: renders <DataTable />    - Chart tab: renders <PhCurveChart />    - Bottom strip: always shows current pH as large number and volume added	Acceptance Criteria	Visit /lab. Right panel visible with dark background. Click each tab — content area changes. Bottom strip always shows '13.00 pH | 0.00 mL' type display.

TASK-013 — Step Instructions Panel
Task #	TASK-013	File	src/components/panels/StepInstructions.tsx
Title	Build guided step-by-step instructions panel	Role	Shows the current experiment step with instructions text and a Next Step button. Drives student through the workflow.
Inputs	TASK-012, TASK-003	Outputs	Steps panel shows instructions text and Next button that advances the step counter
Logic / Steps	Steps array (define in this file):   Step 0: Title='Preparation', instructions='Set up your NaOH solution. The flask contains 25.00 mL of 0.100 mol/L NaOH with phenolphthalein indicator added. The solution appears pink.'   Step 1: Title='Fill Burette', instructions='Your burette is filled with 0.100 mol/L HCl. Check for air bubbles. Record initial reading: 0.00 mL.'   Step 2: Title='Rough Titration', instructions='Add HCl rapidly using the +1.00 mL button. Watch for the pink color to start fading. Stop near 25 mL.'   Step 3: Title='Precise Titration', instructions='Add HCl dropwise using +0.10 mL or +0.01 mL buttons. Stop at the FIRST moment the pink color permanently disappears.'   Step 4: Title='Record Results', instructions='Titration complete! Switch to the Data tab to review your results and click Submit.'  Render:   - Step number badge (e.g. '2/4')   - Title in large white text   - Instructions in grey text   - Progress bar showing completion   - 'Next Step' button (disabled on step 4)   - Read currentStep from experimentStore	Acceptance Criteria	Visit /lab, open Steps tab. Instructions visible. Click Next Step — step number increments, text changes. Progress bar advances. On step 4, Next Step button is disabled.

TASK-014 — Burette Controls Panel
Task #	TASK-014	File	src/components/panels/BuretteControls.tsx
Title	Build clickable volume control buttons	Role	Lets students add precise volumes without needing to interact with the 3D model. Critical for the demo UX.
Inputs	TASK-007, TASK-012	Outputs	Clicking volume buttons updates state and 3D scene in real-time
Logic / Steps	Render 4 buttons in a 2x2 grid:   +0.01 mL (dropwise — blue, small)   +0.10 mL (dropwise — blue, medium)   +1.00 mL (fast — green, medium)   +5.00 mL (rapid — green, large)  Each button: onClick calls addVolume(amount) from experimentStore Below buttons:   - 'Reset' button: calls resetExperiment()   - Stopcock toggle: isOpen boolean in local state, shows Open/Close label   - Current volume display: 'Added: 24.55 mL'  Disable all buttons when isRunning=false (experiment ended)	Acceptance Criteria	Visit /lab. Click +1.00 mL — volume counter increases by 1.00. 3D burette liquid level drops. pH meter number decreases. Click rapidly to 25 mL — flask liquid turns colorless.

TASK-015 — Data Table Panel
Task #	TASK-015	File	src/components/panels/DataTable.tsx
Title	Build live data recording table	Role	Shows a scrollable log of every volume+pH measurement. This is the student's lab notebook.
Inputs	TASK-007, TASK-012	Outputs	Data tab shows growing table with volume and pH entries as titration proceeds
Logic / Steps	1. Read titrationData array from experimentStore 2. Show most recent 20 entries (scroll to see older) 3. Table columns: #, Volume Added (mL), pH, Phase 4. Phase column uses getPhaseLabel(ph) with color: red=Acidic, green=Neutral, blue=Basic 5. Highlight row where pH is closest to 7.0 with yellow background 6. At top: show equivalence point volume from getEquivalenceVolume() as 'Target: ~25.00 mL' 7. Export CSV button: downloads titrationData as CSV file 8. Auto-scroll to bottom when new row added	Acceptance Criteria	Click +0.10 mL repeatedly. Data tab shows new row added each click. At 25 mL the row highlights yellow. Export CSV downloads a valid file.

TASK-016 — Live pH Curve Chart
Task #	TASK-016	File	src/components/panels/PhCurveChart.tsx
Title	Build real-time Chart.js pH titration curve	Role	The signature visual of a titration experiment — the S-curve. This is the most impressive element for the investor demo.
Inputs	TASK-007, TASK-012	Outputs	Chart tab shows S-shaped pH curve that draws itself in real-time as volume is added
Logic / Steps	1. Import Line from react-chartjs-2, register all Chart.js components 2. Read titrationData from experimentStore 3. Chart config:    - x-axis: volume values (0 to 50 mL), label 'Volume HCl Added (mL)'    - y-axis: pH values (0 to 14), label 'pH'    - Dataset: blue line with tension=0.4, pointRadius=2    - Animation duration: 0 (disable for real-time)    - Grid: dark theme (#333), white labels 4. Add a dashed red vertical line at equivalence point volume 5. Add horizontal dashed line at pH=7 6. Chart title: 'Titration Curve: HCl vs NaOH' 7. Show derivative toggle button (dashed orange line showing dpH/dV)	Acceptance Criteria	Visit /lab, open Chart tab. Initially empty. Click volume buttons — blue line draws from top-left toward center. At 25 mL the line drops sharply through 7. Classic S-curve visible.

 
5. Phase 4 — Auth, Backend & Grading (Weeks 5–6)
Goal: Users can register, log in, run experiments, and save results. Scores are calculated and stored. The dashboard shows history. This phase makes the demo feel like a real product.

TASK-017 — Auth Backend Routes
Task #	TASK-017	File	backend/src/routes/auth.ts, backend/src/middleware/auth.ts
Title	Build /register and /login API endpoints	Role	Handles user creation and JWT issuance. Protects all other routes.
Inputs	TASK-004, TASK-005 (DB running)	Outputs	curl POST /api/auth/register creates user. POST /api/auth/login returns JWT.
Logic / Steps	auth.ts routes:   POST /api/auth/register:     - Validate: email, password (min 8 chars), first_name, last_name, role     - Check email not already in DB (Prisma findUnique)     - Hash password: bcrypt.hash(password, 12)     - Create user: prisma.user.create({data:...})     - Return: {user_id, message:'Account created'} status 201     - Errors: 400 if validation fails, 409 if email exists    POST /api/auth/login:     - Find user by email     - bcrypt.compare(password, hash)     - If match: sign JWT {userId, email, role} with JWT_SECRET, expiresIn:'24h'     - Return: {token, user:{id,email,name,role}}     - Errors: 401 if not found or wrong password  auth.ts middleware (exported):   - Extract Bearer token from Authorization header   - jwt.verify(token, JWT_SECRET)   - Attach decoded payload to req.user   - Call next() or return 401	Acceptance Criteria	POST /api/auth/register with valid body returns 201 with user_id. POST /api/auth/login with same creds returns JWT. POST /api/auth/login with wrong password returns 401.

TASK-018 — Experiment Backend Routes
Task #	TASK-018	File	backend/src/routes/experiments.ts
Title	Build experiment save and retrieve API endpoints	Role	Persists experiment data and returns scores. Enables history on dashboard.
Inputs	TASK-017	Outputs	Authenticated POST /api/experiments creates record in DB. GET /api/experiments/mine returns array.
Logic / Steps	POST /api/experiments/submit (auth required):   - Body: {titrationData, calculatedConcentration, techniqueErrors}   - Calculate percentage error: Math.abs((calculated - 0.1) / 0.1) * 100   - Calculate score (see grading.ts TASK-019)   - Save to DB: prisma.experiment.create({data: {..., userId: req.user.userId}})   - Return: {id, score, percentageError, feedback}  GET /api/experiments/mine (auth required):   - prisma.experiment.findMany({where:{userId:req.user.userId}, orderBy:{createdAt:'desc'}})   - Return: array of experiment summaries	Acceptance Criteria	Register a user, get token, POST experiment data with Bearer token in header — returns score object and experiment ID. GET /experiments/mine returns array with 1 entry.

TASK-019 — Grading Logic
Task #	TASK-019	File	src/lib/grading.ts (frontend) + inline in experiments.ts (backend)
Title	Build scoring algorithm	Role	Converts raw titration data into a 0-100 score with detailed breakdown. Shows investors the assessment system.
Inputs	TASK-006	Outputs	gradeExperiment() returns score object with breakdown when called with test data
Logic / Steps	Export function gradeExperiment(data: ExperimentData): GradeResult:    ExperimentData type:     titrationData: {volume: number, ph: number}[]     calculatedConcentration: number     techniqueErrors: string[]     completionTimeSeconds: number    Scoring (total 100):   1. concentrationAccuracy (40 pts):      - percentError = |calculated - 0.1| / 0.1 * 100      - 0-1% error: 40pts, 1-2%: 35pts, 2-5%: 25pts, >5%: 10pts   2. dataQuality (30 pts):      - Count data points (should be >20 for good curve)      - >30 pts: 30pts, 20-30: 20pts, 10-20: 10pts, <10: 5pts   3. techniqueScore (20 pts):      - Start at 20, deduct 2 per technique error   4. timeBonus (10 pts):      - <30min: 10pts, 30-45min: 7pts, >45min: 4pts    Return: {totalScore, breakdown:{concentrationAccuracy, dataQuality, techniqueScore, timeBonus}, grade:'A'/'B'/'C'/'F', feedback:string[]}	Acceptance Criteria	Call gradeExperiment with mock data where calculatedConcentration=0.099 — should return ~90+ score. With 0.15 concentration — should return ~50 score.

TASK-020 — Login Page UI
Task #	TASK-020	File	src/pages/LoginPage.tsx, src/hooks/useAuth.ts
Title	Build functional login and register form	Role	Entry point for all users. Handles form state, API call, token storage, and redirect to dashboard on success.
Inputs	TASK-017, TASK-002	Outputs	Fill in form, click Login — token saved to localStorage, redirect to /dashboard
Logic / Steps	LoginPage.tsx:   - Centered card, HoloLab logo/title, dark background   - Toggle between Login and Register modes (button link)   - Login form: email input, password input, Submit button   - Register form adds: first_name, last_name, role select (student/teacher)   - Loading spinner while awaiting API   - Error message display (red text, e.g. 'Invalid credentials')  useAuth.ts hook:   - login(email, password): POST /api/auth/login, on success call userStore.setUser + store token, navigate('/dashboard')   - register(data): POST /api/auth/register, on success auto-login   - logout(): clear store + localStorage, navigate('/')   - Store token in localStorage key 'hololab_token'   - On app init (App.tsx useEffect): check localStorage token, if present call GET /api/auth/me to restore session	Acceptance Criteria	Visit /. Fill email+password of registered user. Click Login. Redirected to /dashboard. Refresh page — still logged in (token persisted). Click Logout — back to login page.

TASK-021 — Dashboard Page
Task #	TASK-021	File	src/pages/DashboardPage.tsx
Title	Build student dashboard with experiment history	Role	Home page after login. Shows welcome message, past experiment scores, and Start New Experiment button.
Inputs	TASK-020, TASK-018	Outputs	Dashboard shows user name, table of past experiments, and a working Start button
Logic / Steps	1. On mount: fetch GET /api/experiments/mine with auth header 2. Show loading skeleton while fetching 3. Header: 'Welcome back, [name]!' with logout button 4. Stats row: Total Experiments, Average Score, Best Score (calculated from history) 5. Experiments table columns: Date, Score, Grade, Concentration Calculated, % Error, Duration 6. Empty state: 'No experiments yet. Start your first titration!' with illustration 7. CTA button: 'Start New Experiment' — navigates to /lab and calls resetExperiment() 8. Protected route: if no token in userStore, redirect to /	Acceptance Criteria	Log in. Dashboard shows user's name. Table is empty initially. Do an experiment. Return to dashboard — new row appears with score. Start New Experiment navigates to /lab.

 
6. Phase 5 — Tutorial, Results & Polish (Week 6–7)
Goal: The pre-lab tutorial, quiz gate, and results modal are complete. The experience has a beginning, middle, and end. This is the final polish phase before the investor demo.

TASK-022 — Pre-Lab Tutorial Modal
Task #	TASK-022	File	src/components/tutorial/TutorialOverlay.tsx
Title	Build the tutorial overlay that shows before experiment starts	Role	Onboards new students. Shows as full-screen overlay over the lab when showTutorial=true in uiStore.
Inputs	TASK-003	Outputs	Tutorial overlay appears on first visit to /lab with step-through slides
Logic / Steps	TutorialOverlay.tsx:   5-slide tutorial, each with illustration placeholder (colored box + icon), title, and text:   Slide 1: 'Safety First' — Virtual PPE, lab coat, safety goggles required   Slide 2: 'Equipment Overview' — Burette, flask, pH meter overview with labels   Slide 3: 'Titration Technique' — Add HCl slowly, watch for color change   Slide 4: 'Reading the Burette' — Parallax error warning, read at meniscus   Slide 5: 'Ready?' — Summary of procedure, button to start quiz    Navigation: Previous / Next buttons, dot indicators   Skip button top-right (goes directly to quiz)   Dark overlay behind modal prevents interacting with lab   Read/write showTutorial from uiStore	Acceptance Criteria	Visit /lab — tutorial overlay appears immediately. Click through all 5 slides. Dot indicators update. Reach slide 5 — 'Start Quiz' button appears. Skip button also works.

TASK-023 — Pre-Lab Quiz
Task #	TASK-023	File	src/components/tutorial/QuizModal.tsx
Title	Build the 5-question quiz gate	Role	Students must score 80%+ to proceed. Prevents students skipping content without reading it. Shows investors the gamification system.
Inputs	TASK-022	Outputs	Quiz shows questions, scores answers, shows pass/fail, gates lab access
Logic / Steps	5 questions (hardcode in this file):   Q1: 'What does phenolphthalein indicator look like in a basic solution?'      A) Yellow B) Pink C) Blue D) Clear — Answer: B   Q2: 'At the equivalence point, the pH of a strong acid-strong base titration is:'      A) 4 B) 7 C) 10 D) 14 — Answer: B   Q3: 'To avoid parallax error when reading the burette, you should:'      A) Look from above B) Look at eye level C) Look from below D) Use a calculator — Answer: B   Q4: 'How many moles of HCl are needed to neutralize 0.025L of 0.1 mol/L NaOH?'      A) 0.001 B) 0.0025 C) 0.01 D) 0.025 — Answer: B   Q5: 'Why do we perform the titration in triplicate?'      A) To use more chemicals B) To get concordant results C) It is a rule D) To pass the time — Answer: B    Show one question at a time. Selected answer highlights. Next question on selection.   Final screen: score/5. If >=4 correct: green checkmark, 'Proceed to Lab' button (sets showTutorial=false)   If <4 correct: red X, 'Retake Quiz' button (resets to Q1)	Acceptance Criteria	Complete tutorial, reach quiz. Answer all 5. With 4+ correct: green pass screen and lab unlocks. With 3 or fewer correct: retake screen shown. Lab remains blocked until passed.

TASK-024 — Results Modal
Task #	TASK-024	File	src/components/results/ResultsModal.tsx, src/components/results/FeedbackPanel.tsx
Title	Build end-of-experiment results modal	Role	The payoff moment. Shows score, grade, breakdown, and feedback when experiment completes. Critical for demo impact.
Inputs	TASK-019, TASK-003	Outputs	Completing titration triggers results modal with score, grade, and breakdown chart
Logic / Steps	ResultsModal.tsx:   Trigger: when experimentStore.isRunning becomes false AND score is not null   Layout:   - Large circular score display (e.g. '87' in a donut chart, color coded: >80=green, 60-80=yellow, <60=red)   - Grade letter (A/B/C/F) with animated pop-in   - Score breakdown table: Concentration Accuracy, Data Quality, Technique, Time Bonus   - Calculated HCl Concentration: 0.XXX mol/L (student's result)   - Percentage error: X.XX%   - Time taken: X minutes   3 action buttons:     'View Curve' — closes modal, opens chart tab in sidebar     'Try Again' — calls resetExperiment(), closes modal     'Save & Exit' — calls POST /api/experiments/submit, navigates to /dashboard  FeedbackPanel.tsx (inside modal below scores):   - List of technique errors if any (e.g. 'Added too much HCl past endpoint')   - If no errors: 'Perfect technique!' green banner   - 1-2 personalized tips based on score	Acceptance Criteria	Add 25 mL of HCl (equivalence). Experiment ends. Results modal pops up with animated score. All breakdown rows show points. 'Try Again' resets experiment. 'Save & Exit' navigates to dashboard.

TASK-025 — Molecular View Mode
Task #	TASK-025	File	src/components/lab/MolecularView.tsx
Title	Build toggle-able particle visualization	Role	Shows H3O+, OH-, Na+, Cl- ions as colored spheres. Density reflects concentration. The wow factor for science-minded investors.
Inputs	TASK-008, TASK-007	Outputs	Toggle Molecular button shows colored spheres in flask that change as volume added
Logic / Steps	MolecularView.tsx (rendered inside LabScene when showMolecular=true):   1. Calculate ion counts from experimentStore:      - H3O+ count: if pH<7 then 10^(-(ph)) * 1000 * scale else 0      - OH- count: if pH>7 then 10^(-(14-ph)) * 1000 * scale else 0      - Na+ count: constant 50 (always present)      - Cl- count: proportional to volumeAdded   2. Render spheres using InstancedMesh for performance:      - H3O+: red spheres, radius 0.03      - OH-: blue spheres, radius 0.03      - Na+: purple spheres, radius 0.025      - Cl-: yellow spheres, radius 0.025   3. Random positions within flask cylinder bounds      - Re-randomize positions every 500ms (mimics Brownian motion)   4. Confine all spheres to flask area: x:[-0.4,0.4], y:[-0.3,0.3], z:[-0.4,0.4] relative to flask   5. Toggle button in TopNav: reads/writes showMolecular from uiStore	Acceptance Criteria	Click 'Molecular View' toggle button. Colored spheres appear in flask area. Initially many blue spheres (OH-) few red (H3O+). Add 25mL HCl — blue and red spheres equalize then invert. Spheres gently move around.

 
7. Phase 6 — Integration & Demo Polish (Week 7)
Goal: Everything connects. The experience runs start-to-finish without bugs. Visual polish applied. Demo mode added for investors. README complete for handoff.

TASK-026 — Top Navigation Bar
Task #	TASK-026	File	src/pages/LabPage.tsx (edit to add nav)
Title	Build the lab page top nav bar	Role	Persistent controls bar above the lab scene. Access to key features without leaving 3D view.
Inputs	TASK-002, TASK-025	Outputs	Top bar visible with all buttons functional
Logic / Steps	Top bar (full width, above 3D+sidebar split, height ~48px, dark background):   Left: HoloLab logo + 'Acid-Base Titration' label   Center buttons:     - 'Molecular View' toggle (icon: atom) — writes to uiStore.showMolecular     - 'Tutorial' button — sets uiStore.showTutorial=true     - 'Reset' — calls experimentStore.resetExperiment()   Right:     - Current step badge: 'Step 2/4'     - Timer: counts up from 0 in MM:SS format     - User name + logout button   Timer: local useEffect setInterval, reads startTime from experimentStore, updates every second	Acceptance Criteria	Top nav visible. Molecular toggle button changes 3D scene. Timer counts up from 00:00 when experiment starts. Reset stops timer and resets to 00:00. Logout redirects to /.

TASK-027 — Demo Mode
Task #	TASK-027	File	src/hooks/useExperiment.ts (add demo function)
Title	Add auto-demo playback mode for investor presentations	Role	Runs the full titration automatically with visual callouts. Lets investors watch without needing to drive it themselves.
Inputs	TASK-007	Outputs	Click 'Demo Mode' button — titration runs automatically, pausing at key moments
Logic / Steps	Add startDemo() to useExperiment hook:   1. Call resetExperiment()   2. setInterval sequence (use recursive setTimeout for variable delays):      - 0-20mL: add 1.0mL every 400ms (fast phase)      - 20-24mL: add 0.1mL every 300ms with console annotation 'Approaching endpoint'      - 24-24.9mL: add 0.1mL every 600ms (dramatic slowdown)      - 25.0mL: add final 0.1mL, pause 2000ms — flash equivalence message      - 25.1-26mL: add 0.1mL to show overshoot   3. At each 'milestone': show a toast notification overlay in the corner      Milestones: 'pH dropping rapidly!', 'Near equivalence point!', 'Color change detected!', 'Equivalence reached at 25.00 mL!'   4. Stop demo after equivalence + 5 steps   5. 'Demo Mode' button in top nav (star icon), disabled if isRunning=false already	Acceptance Criteria	Click Demo Mode. Burette liquid drops automatically. Flask changes color. pH curve draws itself. Toast notifications pop up at milestone moments. Full demo completes in ~30 seconds.

TASK-028 — README & Setup Guide
Task #	TASK-028	File	README.md
Title	Write complete setup README	Role	Enables any developer to clone and run the project in under 10 minutes. Critical for handoff.
Inputs	All previous tasks complete	Outputs	New developer can follow README to get running without asking questions
Logic / Steps	README.md sections:    # HoloLab Virtual Chemistry Lab   One-paragraph project description    ## Prerequisites   Node.js 20+, Docker Desktop, Git    ## Quick Start (5 commands)   1. git clone [repo]   2. docker-compose up -d (starts Postgres)   3. cd backend && cp .env.example .env && npm install && npx prisma migrate dev && npm run dev   4. cd frontend && npm install && npm run dev   5. Open http://localhost:5173    ## First Run   - Register account at http://localhost:5173   - Start experiment and click through tutorial   - Use Demo Mode button for automated playback    ## Project Structure   [paste the file tree from Section 1.2]    ## API Documentation   Table of all endpoints with method, path, auth required, description    ## Troubleshooting   Common errors: DB connection failed, port already in use, npm install errors	Acceptance Criteria	A fresh developer with no context clones repo, follows README step by step, and sees the app running in browser within 10 minutes with no additional help.

 
8. Task Summary & Build Order
Complete tasks strictly in the order shown. Each task has testable outputs — verify each before moving to the next. Estimated times are for an AI agent with context.

#	Task Name	Phase	File(s)	Est. Time	Depends On
001	Frontend Scaffold	1	package.json, vite.config, tsconfig	15 min	—
002	Router & Page Shells	1	App.tsx, 3x page files	15 min	001
003	Zustand Stores	1	3x store files	20 min	001
004	Backend Scaffold	1	server.ts, db.ts, schema.prisma	25 min	—
005	Docker Compose	1	docker-compose.yml, .env.example	10 min	—
006	Chemistry Engine	2	chemistry.ts	30 min	—
007	Store + Chemistry	2	experimentStore.ts (edit)	15 min	003, 006
008	3D Lab Scene Base	2	LabScene.tsx, LabEnvironment.tsx	30 min	002
009	Burette 3D	2	BuretteModel.tsx	45 min	008, 007
010	Flask 3D	2	FlaskModel.tsx, LiquidShader.tsx	40 min	008, 006
011	pH Meter 3D	2	PhMeterModel.tsx	30 min	008, 007
012	Right Sidebar Layout	3	RightSidebar.tsx, LabPage.tsx	20 min	002
013	Step Instructions	3	StepInstructions.tsx	25 min	012, 003
014	Burette Controls	3	BuretteControls.tsx	20 min	007, 012
015	Data Table	3	DataTable.tsx	25 min	007, 012
016	pH Curve Chart	3	PhCurveChart.tsx	30 min	007, 012
017	Auth Backend	4	routes/auth.ts, middleware/auth.ts	40 min	004, 005
018	Experiment Backend	4	routes/experiments.ts	30 min	017
019	Grading Logic	4	grading.ts	25 min	006
020	Login Page UI	4	LoginPage.tsx, useAuth.ts	35 min	017, 002
021	Dashboard Page	4	DashboardPage.tsx	35 min	020, 018
022	Tutorial Modal	5	TutorialOverlay.tsx	30 min	003
023	Quiz Gate	5	QuizModal.tsx	25 min	022
024	Results Modal	5	ResultsModal.tsx, FeedbackPanel.tsx	35 min	019, 003
025	Molecular View	5	MolecularView.tsx	40 min	008, 007
026	Top Nav Bar	6	LabPage.tsx (edit)	20 min	002, 025
027	Demo Mode	6	useExperiment.ts (edit)	25 min	007
028	README	6	README.md	20 min	all tasks

Total estimated build time: ~13 hours of focused agent work across 28 discrete tasks.

 
9. Investor Demo Script
Use this script when presenting HoloLab to investors. The demo takes 8-10 minutes.

Time	Action	What to Say
0:00	Open /lab, tutorial shows	'This is a chemistry student's first time in our lab...'
0:30	Click through tutorial slides	'We teach proper technique before they touch anything.'
1:00	Pass quiz, lab unlocks	'They must prove they understood the content to proceed.'
1:30	Toggle Molecular View on	'At any point they can zoom into the molecular level.'
2:00	Toggle back, click Demo Mode	'Let me show you a full titration in 30 seconds.'
2:30	Demo runs automatically	'Watch the pH curve draw itself — classic S-curve.'
2:50	Flask color changes	'That moment of color change is the equivalence point.'
3:00	Results modal appears	'Instant automated grading. No teacher needed.'
3:30	Navigate to Dashboard	'Every result is saved. Teachers see this in real time.'
4:00	Show data table + CSV export	'Data exports to CSV for lab reports. GDPR compliant.'
4:30	Open fresh tab as teacher	'Teacher sees all students' progress on their dashboard.'


Build. Demo. Raise.
HoloLab — Revolutionizing Chemistry Education
