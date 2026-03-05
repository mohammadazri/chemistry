# HoloLab AR Gesture Control System — Development Plan

> **Version:** 1.0  
> **Project:** HoloLab Virtual Chemistry Laboratory  
> **Module:** Webcam-Based AR Interaction Layer  
> **Architecture:** Object-Oriented (Class-based TypeScript)  
> **AI Handoff Ready:** ✅ Each phase is self-contained with full context

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [OOP Architecture Design](#2-oop-architecture-design)
3. [Class Hierarchy & Responsibilities](#3-class-hierarchy--responsibilities)
4. [Phase Breakdown](#4-phase-breakdown)
5. [File Structure](#5-file-structure)
6. [Gesture Dictionary](#6-gesture-dictionary)
7. [Integration Points](#7-integration-points)
8. [AI Prompt Templates Per Phase](#8-ai-prompt-templates-per-phase)
9. [Testing Checklist](#9-testing-checklist)
10. [Known Risks & Mitigations](#10-known-risks--mitigations)

---

## 1. Project Overview

### What We Are Building

A **webcam-only AR interaction layer** for HoloLab that lets students control the 3D virtual chemistry lab using:

- **Hand gestures** — pour, zoom, rotate, reset
- **Head movement** — look around the 3D lab scene (yaw/pitch camera orbit)
- **Head nod** — confirm/advance actions

### Technology Stack (No New Hardware)

| Concern | Library | Why |
|---|---|---|
| Hand + Face detection | MediaPipe Holistic (CDN) | Single pipeline for both — most efficient |
| 3D camera control | React Three Fiber `useFrame` | Already in HoloLab stack |
| State | Zustand (existing) | Extend existing lab store |
| UI overlay | React + Tailwind (existing) | Glassmorphism HUD |

### Core Design Principle

> **Everything is a class.** The gesture system is built OOP so any AI agent can be handed a single class and know exactly what it does, what it needs, and how to extend it — with zero guesswork.

---

## 2. OOP Architecture Design

### Why OOP for This Module?

The gesture system has distinct responsibilities that map cleanly to classes:

- It has **lifecycle** (start, stop, pause) → class with constructor/destroy
- It has **state** (is pinching? current head angle?) → encapsulated instance fields
- It has **multiple input sources** (hands, face) → inheritance / composition
- It needs to be **testable in isolation** → no tangled hooks
- It will be **extended** (eye tracking later) → open/closed principle

### Design Pattern: Strategy + Observer

```
GestureController (Orchestrator)
    │
    ├── HandTracker    (Strategy: detects hand landmarks → fires events)
    ├── HeadTracker    (Strategy: detects face landmarks → fires events)
    │
    └── GestureEventBus  (Observer: distributes typed events to subscribers)
            │
            ├── LabControls.handleGesture()   (Lab chemistry actions)
            └── SceneCamera.handleGesture()   (Three.js camera movement)
```

Every class:
- Has a single responsibility
- Communicates only via the `GestureEventBus`
- Can be instantiated, started, paused, and destroyed independently

---

## 3. Class Hierarchy & Responsibilities

### 3.1 `GestureEventBus`

**File:** `src/lib/gesture/GestureEventBus.ts`

**Responsibility:** Typed publish/subscribe event system. The central nervous system — no class talks to another class directly.

```typescript
class GestureEventBus {
  // Subscribe to a gesture event type
  on(event: GestureEventType, handler: GestureHandler): () => void

  // Publish a gesture event
  emit(event: GesturePayload): void

  // Remove all listeners (for cleanup)
  destroy(): void
}
```

**Events emitted:**

| Event Type | Payload | Source |
|---|---|---|
| `PINCH_START` | `{}` | HandTracker |
| `PINCH_END` | `{}` | HandTracker |
| `OPEN_PALM` | `{}` | HandTracker |
| `ZOOM` | `{ value: number }` | HandTracker |
| `SWIPE_LEFT` | `{}` | HandTracker |
| `SWIPE_RIGHT` | `{}` | HandTracker |
| `THREE_FINGERS` | `{}` | HandTracker |
| `HEAD_YAW` | `{ value: -1 to 1 }` | HeadTracker |
| `HEAD_PITCH` | `{ value: -1 to 1 }` | HeadTracker |
| `HEAD_NOD` | `{}` | HeadTracker |
| `TRACKER_READY` | `{}` | GestureController |
| `TRACKER_ERROR` | `{ message: string }` | GestureController |

---

### 3.2 `BaseTracker` (Abstract)

**File:** `src/lib/gesture/BaseTracker.ts`

**Responsibility:** Shared lifecycle and config for all trackers. Never instantiated directly.

```typescript
abstract class BaseTracker {
  protected bus: GestureEventBus
  protected isActive: boolean
  protected sensitivity: number

  constructor(bus: GestureEventBus, options: TrackerOptions)

  abstract processLandmarks(landmarks: Landmark[]): void

  pause(): void
  resume(): void
  destroy(): void
}
```

---

### 3.3 `HandTracker extends BaseTracker`

**File:** `src/lib/gesture/HandTracker.ts`

**Responsibility:** Receives raw hand landmark arrays from MediaPipe and converts them to gesture events. Stateful (tracks previous frame for swipe/zoom delta detection).

```typescript
class HandTracker extends BaseTracker {
  private prevPinching: boolean
  private prevFingerCount: number
  private prevWristX: number | null
  private prevTwoFingerY: number | null

  processLandmarks(landmarks: Landmark[]): void

  // Internal helpers (private)
  private detectPinch(lm: Landmark[]): boolean
  private detectOpenPalm(lm: Landmark[]): boolean
  private countExtendedFingers(lm: Landmark[]): number
  private detectSwipe(lm: Landmark[]): void
  private detectZoom(lm: Landmark[]): void
}
```

---

### 3.4 `HeadTracker extends BaseTracker`

**File:** `src/lib/gesture/HeadTracker.ts`

**Responsibility:** Receives raw face mesh landmarks from MediaPipe and converts head pose into continuous yaw/pitch events plus discrete nod events.

```typescript
class HeadTracker extends BaseTracker {
  private prevPose: HeadPose | null
  private nodCooldown: boolean
  private nodCooldownMs: number

  processLandmarks(landmarks: Landmark[]): void

  // Internal helpers (private)
  private estimatePose(lm: Landmark[]): HeadPose
  private detectNod(current: HeadPose, previous: HeadPose): void
}
```

---

### 3.5 `MediaPipeLoader`

**File:** `src/lib/gesture/MediaPipeLoader.ts`

**Responsibility:** Handles the async loading of MediaPipe Holistic from CDN, webcam stream acquisition, and routing of results to the correct tracker.

```typescript
class MediaPipeLoader {
  private holistic: any
  private camera: any
  private stream: MediaStream | null
  private videoEl: HTMLVideoElement | null

  async load(): Promise<void>          // Load CDN scripts
  async startCamera(): Promise<void>   // Request webcam access
  async startTracking(
    onHand: (lm: Landmark[]) => void,
    onFace: (lm: Landmark[]) => void
  ): Promise<void>
  stop(): void                          // Clean up camera + holistic
  destroy(): void                       // Remove video element + stop stream
}
```

---

### 3.6 `GestureController` (Main Entry Point)

**File:** `src/lib/gesture/GestureController.ts`

**Responsibility:** The single class you instantiate to get the full gesture system running. Composes all other classes. This is what your React hook or component will use.

```typescript
class GestureController {
  private bus: GestureEventBus
  private handTracker: HandTracker
  private headTracker: HeadTracker
  private loader: MediaPipeLoader
  private enabled: boolean

  constructor(options: GestureControllerOptions)

  // Lifecycle
  async start(): Promise<void>    // Load MediaPipe, start webcam, begin tracking
  pause(): void                   // Freeze gesture detection (keeps camera on)
  resume(): void                  // Resume gesture detection
  stop(): void                    // Full teardown

  // Subscription (delegates to GestureEventBus)
  on(event: GestureEventType, handler: GestureHandler): () => void

  // Status
  getStatus(): 'idle' | 'loading' | 'active' | 'paused' | 'error'
  getVideoElement(): HTMLVideoElement | null   // For PiP display

  // Config (can be changed at runtime)
  setHeadSensitivity(value: number): void      // 0 to 1
  setHandSensitivity(value: number): void      // 0 to 1
}
```

**Usage (the whole system in 5 lines):**

```typescript
const controller = new GestureController({ headSensitivity: 0.6 });

controller.on('PINCH_START', () => labStore.startPour());
controller.on('HEAD_YAW',    ({ value }) => camera.rotateY(value));
controller.on('THREE_FINGERS', () => labStore.resetExperiment());

await controller.start();
```

---

### 3.7 `useGestureController` (React Hook Wrapper)

**File:** `src/hooks/useGestureController.ts`

**Responsibility:** Thin React wrapper around `GestureController`. Manages the controller lifecycle with `useEffect`, exposes status, and returns the video element ref for PiP display.

```typescript
function useGestureController(options: {
  enabled: boolean;
  onGesture: (payload: GesturePayload) => void;
  headSensitivity?: number;
}): {
  status: ControllerStatus;
  videoEl: HTMLVideoElement | null;
  pause: () => void;
  resume: () => void;
}
```

---

### 3.8 `GestureHUD` (React Component)

**File:** `src/components/lab/GestureHUD.tsx`

**Responsibility:** The floating UI overlay. Uses `useGestureController` internally. Shows webcam PiP, active gesture toast, enable/disable toggle, gesture cheatsheet. Wires all gesture events to lab actions.

```typescript
interface GestureHUDProps {
  onGesture?: (payload: GesturePayload) => void;  // Optional override
  showFeed?: boolean;                              // Show webcam PiP
  position?: 'bottom-right' | 'bottom-left';      // HUD position
}
```

---

## 4. Phase Breakdown

### Phase 1 — Core Infrastructure (Week 1)

**Goal:** The OOP skeleton is in place and MediaPipe is loading correctly.

**Tasks:**
- [ ] Create `GestureEventBus` with typed events
- [ ] Create `BaseTracker` abstract class
- [ ] Create `MediaPipeLoader` — CDN script injection + webcam acquisition
- [ ] Unit test: MediaPipe loads, camera opens, raw landmarks are received

**Deliverable:** `console.log` of raw landmark arrays from webcam. No gestures yet.

**Files created this phase:**
```
src/lib/gesture/GestureEventBus.ts
src/lib/gesture/BaseTracker.ts
src/lib/gesture/MediaPipeLoader.ts
src/lib/gesture/types.ts
```

---

### Phase 2 — Hand Gesture Detection (Week 1–2)

**Goal:** All 6 hand gestures are detected and emitted as typed events.

**Tasks:**
- [ ] Implement `HandTracker` with pinch detection
- [ ] Implement open palm detection
- [ ] Implement two-finger zoom (Y-delta tracking)
- [ ] Implement wrist swipe detection (X-delta with threshold)
- [ ] Implement three-finger count
- [ ] Add debounce to prevent event flooding
- [ ] Test all gestures with `GestureEventBus` subscriber

**Deliverable:** All hand gestures fire correctly to console. Threshold values tuned.

**Files created this phase:**
```
src/lib/gesture/HandTracker.ts
```

---

### Phase 3 — Head Tracking (Week 2)

**Goal:** Head turn/tilt maps to continuous camera movement, nod fires discrete event.

**Tasks:**
- [ ] Implement `HeadTracker` with pose estimation (eyes + nose landmarks)
- [ ] Emit continuous `HEAD_YAW` and `HEAD_PITCH` events (throttled to 30fps)
- [ ] Implement nod detection with cooldown timer
- [ ] Test sensitivity range (0.2 = subtle, 1.0 = full range)

**Deliverable:** Head movement logs yaw/pitch values to console smoothly.

**Files created this phase:**
```
src/lib/gesture/HeadTracker.ts
```

---

### Phase 4 — Controller Assembly (Week 2)

**Goal:** `GestureController` class wraps everything into single usable unit.

**Tasks:**
- [ ] Implement `GestureController` composing all sub-classes
- [ ] Implement start/pause/resume/stop lifecycle
- [ ] Implement `getStatus()` state machine
- [ ] Expose `setHeadSensitivity` and `setHandSensitivity` at runtime
- [ ] Implement `useGestureController` React hook
- [ ] Test: full start-to-stop cycle with no memory leaks

**Deliverable:** `const controller = new GestureController(); await controller.start();` works.

**Files created this phase:**
```
src/lib/gesture/GestureController.ts
src/hooks/useGestureController.ts
```

---

### Phase 5 — Lab Integration (Week 3)

**Goal:** Gestures control the actual HoloLab experiment.

**Tasks:**
- [ ] Wire `PINCH_START` / `PINCH_END` → burette pour start/stop
- [ ] Wire `OPEN_PALM` → pause experiment
- [ ] Wire `ZOOM` value → Three.js camera distance (`camera.position.z`)
- [ ] Wire `SWIPE_LEFT` / `SWIPE_RIGHT` → OrbitControls rotation delta
- [ ] Wire `THREE_FINGERS` → call existing `resetExperiment()` in Zustand store
- [ ] Wire `HEAD_YAW` / `HEAD_PITCH` → `GestureCamera` R3F component (smooth lerp)
- [ ] Wire `HEAD_NOD` → advance tutorial step / confirm action
- [ ] Add visual feedback in lab (e.g. burette glows during pour)

**Deliverable:** Full end-to-end: student uses gestures to complete a titration.

**Files modified this phase:**
```
src/pages/Lab.tsx               (add GestureHUD + GestureCamera)
src/components/lab/LabCanvas.tsx (add GestureCamera inside Canvas)
src/store/labStore.ts           (no changes needed — gestures call existing actions)
```

---

### Phase 6 — HUD Polish (Week 3)

**Goal:** The GestureHUD component is complete, polished, and student-friendly.

**Tasks:**
- [ ] Implement `GestureHUD` component with webcam PiP
- [ ] Add active gesture toast with emoji + color per gesture type
- [ ] Add toggle switch (enable/disable without page reload)
- [ ] Add collapsible gesture cheatsheet
- [ ] Add loading state ("Starting camera…")
- [ ] Add error state ("Camera access denied — check browser permissions")
- [ ] Test on Chrome, Firefox, Safari (MediaPipe CDN support)

**Files created this phase:**
```
src/components/lab/GestureHUD.tsx
```

---

### Phase 7 — Performance & Edge Cases (Week 4)

**Goal:** System is robust for real classroom use.

**Tasks:**
- [ ] Throttle `HEAD_YAW` / `HEAD_PITCH` events to 30fps max
- [ ] Add gesture confidence threshold (ignore low-confidence detections)
- [ ] Handle camera permission denial gracefully
- [ ] Handle MediaPipe CDN load failure (fallback message)
- [ ] Test in low-light conditions — adjust `minDetectionConfidence`
- [ ] Test with glasses, headwear
- [ ] Memory leak audit — verify `destroy()` fully cleans up
- [ ] Performance test: confirm <5% CPU overhead on mid-range laptop

---

## 5. File Structure

```
src/
├── lib/
│   └── gesture/
│       ├── types.ts                 ← All shared TypeScript types
│       ├── GestureEventBus.ts       ← Pub/sub system (Phase 1)
│       ├── BaseTracker.ts           ← Abstract base class (Phase 1)
│       ├── MediaPipeLoader.ts       ← CDN loader + webcam (Phase 1)
│       ├── HandTracker.ts           ← Hand gesture detection (Phase 2)
│       ├── HeadTracker.ts           ← Head pose detection (Phase 3)
│       ├── GestureController.ts     ← Main entry point class (Phase 4)
│       └── index.ts                 ← Barrel export
│
├── hooks/
│   └── useGestureController.ts      ← React hook wrapper (Phase 4)
│
└── components/
    └── lab/
        ├── GestureHUD.tsx           ← Floating UI overlay (Phase 6)
        └── GestureCamera.tsx        ← R3F camera component (Phase 5)
```

---

## 6. Gesture Dictionary

Full reference for all supported gestures. Use this as the source of truth.

| ID | Name | Hand Shape | Detection Method | Fires Event | Cooldown |
|---|---|---|---|---|---|
| G01 | Pinch | Thumb tip + index tip distance < 0.06 | Euclidean distance | `PINCH_START` / `PINCH_END` | None (continuous) |
| G02 | Open Palm | All 4 finger tips above their knuckles | Per-finger Y comparison | `OPEN_PALM` | 500ms |
| G03 | Two-Finger Zoom | Index + middle extended, move up/down | Y-delta of finger average | `ZOOM { value }` | None (continuous) |
| G04 | Swipe Left | Wrist moves left > 0.08 in one frame | X-delta of wrist landmark | `SWIPE_LEFT` | 600ms |
| G05 | Swipe Right | Wrist moves right > 0.08 in one frame | X-delta of wrist landmark | `SWIPE_RIGHT` | 600ms |
| G06 | Three Fingers | Exactly 3 fingers extended | Finger count | `THREE_FINGERS` | 1000ms |
| G07 | Head Turn | Face yaw from eye midpoint vs nose X | Landmark geometry | `HEAD_YAW { value }` | None (30fps throttle) |
| G08 | Head Tilt | Face pitch from eye midpoint vs nose Y | Landmark geometry | `HEAD_PITCH { value }` | None (30fps throttle) |
| G09 | Head Nod | Rapid downward pitch delta > 0.25 | Delta between frames | `HEAD_NOD` | 1000ms |

---

## 7. Integration Points

### With Existing HoloLab Zustand Store

The gesture system calls existing store actions — **no store changes needed**.

| Gesture Event | Store Action to Call |
|---|---|
| `PINCH_START` | `useLabStore.getState().startPour()` |
| `PINCH_END` | `useLabStore.getState().stopPour()` |
| `OPEN_PALM` | `useLabStore.getState().pauseExperiment()` |
| `THREE_FINGERS` | `useLabStore.getState().resetExperiment()` |
| `HEAD_NOD` | `useLabStore.getState().advanceTutorialStep()` |

### With React Three Fiber Camera

`HEAD_YAW` and `HEAD_PITCH` drive the camera via a dedicated `<GestureCamera />` component placed inside `<Canvas>`. It uses `useFrame` to smoothly lerp the camera's spherical orbit position every frame.

### With Existing Tutorial System

`HEAD_NOD` replaces or supplements the existing "Next Step" button during the onboarding flow. The tutorial system does not need changes — just subscribe `HEAD_NOD` to the same handler the button calls.

---

## 8. AI Prompt Templates Per Phase

> Copy these prompts directly to any AI agent to implement each phase. Each prompt is fully self-contained.

---

### Prompt — Phase 1: Core Infrastructure

```
You are implementing Phase 1 of the HoloLab gesture control system.

Project context: HoloLab is a React 19 + TypeScript + Vite app using 
React Three Fiber for 3D rendering and Zustand for state.

Create these 3 files:

1. src/lib/gesture/types.ts
   - GestureEventType union type (all event names as string literals)
   - GesturePayload interface { type, value?, yaw?, pitch? }
   - Landmark interface { x, y, z: number }
   - TrackerOptions interface { sensitivity: number }
   - ControllerStatus type: 'idle' | 'loading' | 'active' | 'paused' | 'error'

2. src/lib/gesture/GestureEventBus.ts
   - Class with Map<GestureEventType, Set<Function>> as internal store
   - on(event, handler): returns unsubscribe function
   - emit(payload): calls all handlers for that event type
   - destroy(): clears all listeners

3. src/lib/gesture/MediaPipeLoader.ts
   - Class that injects MediaPipe Holistic + Camera scripts from CDN via 
     dynamic <script> tags (deduplicates if already loaded)
   - Opens webcam (640x480, facingMode: user)
   - Exposes startTracking(onResults) which feeds the Holistic model
   - Exposes stop() and destroy() for cleanup

Use TypeScript strict mode. No default exports — named exports only.
```

---

### Prompt — Phase 2: Hand Tracker

```
You are implementing Phase 2 of the HoloLab gesture control system.

Existing files:
- src/lib/gesture/types.ts (Landmark, GestureEventBus, TrackerOptions defined)
- src/lib/gesture/GestureEventBus.ts (on, emit, destroy)

Create:
src/lib/gesture/HandTracker.ts

Requirements:
- Class HandTracker extends BaseTracker (also create BaseTracker.ts)
- BaseTracker has: bus, isActive, sensitivity fields + pause/resume/destroy
- HandTracker.processLandmarks(landmarks: Landmark[]) is called each frame
- Detects and emits via bus:
  - PINCH_START / PINCH_END: thumb tip (4) + index tip (8) dist < 0.06
  - OPEN_PALM: all of fingers 8,12,16,20 above their knuckles 6,10,14,18
  - ZOOM: two fingers extended, track average Y delta, emit { value: delta*10 }
  - SWIPE_LEFT / SWIPE_RIGHT: wrist X delta > 0.08 threshold, 600ms cooldown
  - THREE_FINGERS: exactly 3 extended fingers, 1000ms cooldown
- Store previous frame state as instance fields (not module-level vars)
- Include JSDoc on every public method
```

---

### Prompt — Phase 3: Head Tracker

```
You are implementing Phase 3 of the HoloLab gesture control system.

Existing: types.ts, GestureEventBus.ts, BaseTracker.ts are all complete.

Create:
src/lib/gesture/HeadTracker.ts

Requirements:
- Class HeadTracker extends BaseTracker
- processLandmarks(landmarks: Landmark[]) processes MediaPipe face mesh
- Use landmarks: left eye = 33, right eye = 263, nose tip = 1
- Yaw = (nose.x - eyeMidX) * 6, clamped -1 to 1
- Pitch = (nose.y - eyeMidY) * 8, clamped -1 to 1
- Emit HEAD_YAW { value } and HEAD_PITCH { value } throttled to 30fps
- Emit HEAD_NOD when pitch delta between frames > 0.25, with 1000ms cooldown
- nodCooldownMs configurable via constructor options
- Store prevPose as instance field
```

---

### Prompt — Phase 4: Controller + Hook

```
You are implementing Phase 4 of the HoloLab gesture control system.

All tracker classes are complete. Now create the main entry point.

Create:
1. src/lib/gesture/GestureController.ts
   - Composes GestureEventBus + MediaPipeLoader + HandTracker + HeadTracker
   - Constructor takes GestureControllerOptions { headSensitivity?, handSensitivity? }
   - async start(): loads MediaPipe, starts camera, wires results to trackers
   - pause() / resume() / stop() / destroy()
   - getStatus(): ControllerStatus
   - on(event, handler): delegates to bus, returns unsubscribe fn
   - getVideoElement(): returns the hidden video element (for PiP display)
   - setHeadSensitivity(n) / setHandSensitivity(n): updates trackers at runtime

2. src/hooks/useGestureController.ts
   - React hook wrapping GestureController
   - Takes { enabled, onGesture, headSensitivity? }
   - Creates controller in useRef, starts/stops with useEffect based on enabled
   - Subscribes onGesture to all event types
   - Returns { status, videoEl, pause, resume }
   - Clean up all subscriptions and call controller.destroy() on unmount
```

---

### Prompt — Phase 5: Lab Integration

```
You are implementing Phase 5 of the HoloLab gesture control system.

The GestureController and useGestureController hook are complete.
HoloLab uses React Three Fiber with a <Canvas> in src/pages/Lab.tsx.
The Zustand store is at src/store/labStore.ts with actions:
  startPour(), stopPour(), pauseExperiment(), resetExperiment(), advanceTutorialStep()

Create:
1. src/components/lab/GestureCamera.tsx
   - React Three Fiber component (place inside <Canvas>)
   - Reads from a shared headPoseRef { yaw, pitch }
   - On useFrame: spherical lerp of camera.position toward head pose target
   - Camera always looks at (0, 0.5, 0) — the lab centre point
   - Lerp speed: 0.05 (smooth follow, not instant)

2. Update src/pages/Lab.tsx
   - Import GestureHUD and GestureCamera
   - Add <GestureCamera /> inside <Canvas>
   - Add <GestureHUD /> outside <Canvas>
   - In handleGesture callback: route each event type to the correct store action
   - HEAD_YAW and HEAD_PITCH update headPoseRef directly (not store)
```

---

### Prompt — Phase 6: GestureHUD Component

```
You are implementing Phase 6 of the HoloLab gesture control system.

Create: src/components/lab/GestureHUD.tsx

This is a floating glassmorphism UI overlay component with these features:
1. Bottom-right fixed position
2. Small webcam PiP (160x120px, mirrored, with scanning line animation)
3. Active gesture toast — shows emoji + label when gesture fires, fades out after 900ms
4. Enable/disable toggle switch (pill style)
5. Collapsible cheatsheet panel listing all 9 gestures (see gesture dictionary)
6. Status indicator: loading / active / error states

Design: dark glassmorphism — rgba(10,12,30,0.9) background, 
indigo/violet accent colors (#6366f1), backdrop-filter blur.

Uses the useGestureController hook internally.
Accepts onGesture prop to pass gesture events up to parent.
showFeed prop (boolean) controls PiP visibility.

Include CSS keyframe animations inline via <style> tag (no CSS modules needed).
Use only Tailwind utility classes or inline styles — no external CSS files.
```

---

## 9. Testing Checklist

### Per-Phase Acceptance Criteria

**Phase 1**
- [ ] No console errors on page load
- [ ] Browser asks for camera permission
- [ ] Raw landmark arrays appear in console once per frame

**Phase 2**
- [ ] Pinch fires `PINCH_START` within 1 frame of gesture
- [ ] Open palm fires with ≥4 fingers extended
- [ ] Two-finger Y movement fires `ZOOM` with correct sign (up = positive)
- [ ] Swipe has 600ms cooldown (no double-fires)
- [ ] Three-finger gesture is distinct from open palm

**Phase 3**
- [ ] Head turn left → `HEAD_YAW` with negative value
- [ ] Head turn right → `HEAD_YAW` with positive value
- [ ] Slow head movement does NOT trigger nod
- [ ] Fast downward nod fires `HEAD_NOD` with 1s cooldown

**Phase 4**
- [ ] `controller.start()` → status becomes `'active'`
- [ ] `controller.stop()` → webcam light turns off
- [ ] No memory leaks (webcam stream fully stopped)
- [ ] `on()` returns working unsubscribe function

**Phase 5**
- [ ] Pinch in lab → burette begins pouring
- [ ] Release pinch → burette stops
- [ ] Swipe left/right → scene rotates in correct direction
- [ ] Three fingers → experiment resets (shows confirmation)
- [ ] Head turn → camera orbits smoothly (no jitter)

**Phase 6**
- [ ] HUD renders without blocking lab UI
- [ ] Toggle works without page reload
- [ ] Camera permission denied → error state shown (not crash)
- [ ] Cheatsheet opens and closes correctly

---

## 10. Known Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| MediaPipe CDN unavailable | Low | High | Host MediaPipe files in `/public/mediapipe/` as fallback |
| Camera permission denied by browser | Medium | High | Show clear permission guide modal with browser-specific instructions |
| Poor detection in low light | High | Medium | Add `minDetectionConfidence: 0.4` option + warn user with HUD indicator |
| Gesture false-positives during typing | Medium | Medium | Add "AR mode" that must be explicitly activated (not always-on) |
| High CPU on low-end devices | Medium | Medium | Expose `modelComplexity: 0` option in constructor for lite mode |
| MediaPipe not supported on Firefox | Medium | Low | Test + show warning banner on unsupported browsers |
| Head tracking drift over time | Low | Low | Add "recenter" gesture (e.g. hold three fingers 2s) |

---

## Appendix: Quick Reference — GestureController API

```typescript
// Instantiate
const gc = new GestureController({ headSensitivity: 0.6 });

// Subscribe before start
const unsub = gc.on('PINCH_START', () => console.log('pinch!'));

// Start (async — waits for MediaPipe + camera)
await gc.start();

// Runtime config
gc.setHeadSensitivity(0.8);

// Pause/resume (e.g. when tutorial modal is open)
gc.pause();
gc.resume();

// Full teardown
gc.stop();
unsub();  // optional — stop() cleans up all listeners

// Get video element for PiP display
const video = gc.getVideoElement();
pipElement.srcObject = video?.srcObject ?? null;
```

---

*Document generated for HoloLab AR Development — hand off any phase prompt directly to an AI agent.*