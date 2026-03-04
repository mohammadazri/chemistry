/**
 * types.ts — Shared TypeScript types for the AR Gesture Control System.
 * All classes and components import from here to stay in sync.
 */

// ─────────────────────────────────────────────────────────────
// MediaPipe Types (minimal subset we care about)
// ─────────────────────────────────────────────────────────────

export interface Landmark {
    x: number; // Normalised 0-1 (left→right)
    y: number; // Normalised 0-1 (top→bottom)
    z: number; // Relative depth
    visibility?: number; // 0-1 confidence
}

export interface MediaPipeResults {
    leftHandLandmarks?: Landmark[];
    rightHandLandmarks?: Landmark[];
    poseLandmarks?: Landmark[];
    faceLandmarks?: Landmark[];
    image?: HTMLVideoElement | HTMLCanvasElement;
}

// ─────────────────────────────────────────────────────────────
// Gesture Event Types
// ─────────────────────────────────────────────────────────────

export type GestureEventType =
    // Hand gestures
    | 'PINCH_START'
    | 'PINCH_END'
    | 'OPEN_PALM'
    | 'THREE_FINGERS'
    | 'FOUR_FINGERS'
    | 'THUMB_UP'
    | 'SWIPE_LEFT'
    | 'SWIPE_RIGHT'
    | 'SWIPE_UP'
    | 'SWIPE_DOWN'
    | 'ZOOM'
    // Head gestures
    | 'HEAD_YAW'    // continuous — value = signed angle
    | 'HEAD_PITCH'  // continuous — value = signed angle
    | 'HEAD_NOD'
    | 'HEAD_SHAKE';

export interface GesturePayload {
    type: GestureEventType;
    /** Optional numeric value (e.g. yaw/pitch angle, zoom delta) */
    value?: number;
    /** Timestamp in ms */
    timestamp: number;
    /** Which hand triggered this event (if applicable) */
    hand?: 'left' | 'right';
}

// ─────────────────────────────────────────────────────────────
// Controller Status
// ─────────────────────────────────────────────────────────────

export type ControllerStatus =
    | 'idle'
    | 'loading'
    | 'requesting-camera'
    | 'active'
    | 'paused'
    | 'error';

// ─────────────────────────────────────────────────────────────
// Tracker Options
// ─────────────────────────────────────────────────────────────

export interface TrackerOptions {
    /** Sensitivity multiplier (0.5 = less sensitive, 2.0 = very sensitive) */
    sensitivity?: number;
    /** Cooldown between discrete events in ms */
    cooldownMs?: number;
}
