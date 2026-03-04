import { BaseTracker } from './BaseTracker';
import { GestureEventBus } from './GestureEventBus';
import type { Landmark, TrackerOptions } from './types';

/**
 * HeadTracker — detects continuous and discrete head movements.
 *
 * Uses key facial landmarks from MediaPipe Face Mesh subset provided
 * by MediaPipe Holistic's faceLandmarks array:
 *   - Landmark 1  = Nose tip
 *   - Landmark 33 = Left eye corner
 *   - Landmark 263 = Right eye corner
 *   - Landmark 152 = Chin tip
 *
 * Emits:
 *   HEAD_YAW   — continuous, value = signed normalised angle (-1 to +1)
 *   HEAD_PITCH — continuous, value = signed normalised angle (-1 to +1)
 *   HEAD_NOD   — discrete, detected via rapid pitch delta
 *   HEAD_SHAKE — discrete, detected via rapid yaw delta
 */
export class HeadTracker extends BaseTracker {
    /** Throttle Hz for continuous events (default 30fps equivalent) */
    private readonly continuousThrottleMs = 33;
    private lastContinuousEmit = 0;

    /** Previous frame yaw/pitch for delta calculation */
    private prevYaw: number | null = null;
    private prevPitch: number | null = null;

    constructor(bus: GestureEventBus, options: TrackerOptions = {}) {
        super(bus, { cooldownMs: 1000, ...options });
    }

    /**
     * Call every frame with the face landmark array from MediaPipe Holistic.
     */
    processFrame(faceLandmarks: Landmark[] | undefined): void {
        if (!this.isActive || !faceLandmarks || faceLandmarks.length < 400) return;

        const { yaw, pitch } = this.estimateHeadPose(faceLandmarks);

        // ── Discrete gestures: Nod and Shake ────────────────────────────────
        if (this.prevYaw !== null && this.prevPitch !== null) {
            const dyaw = yaw - this.prevYaw;
            const dpitch = pitch - this.prevPitch;

            // Nod: rapid downward then upward pitch (or just detect single rapid pitch)
            if (Math.abs(dpitch) > 0.18 * this.sensitivity && this.checkCooldown('head_nod')) {
                this.bus.emit({ type: 'HEAD_NOD', timestamp: Date.now() });
            }
            // Shake: rapid sideways yaw
            if (Math.abs(dyaw) > 0.22 * this.sensitivity && this.checkCooldown('head_shake')) {
                this.bus.emit({ type: 'HEAD_SHAKE', timestamp: Date.now() });
            }
        }

        this.prevYaw = yaw;
        this.prevPitch = pitch;

        // ── Continuous events: throttled at ~30fps ───────────────────────────
        const now = Date.now();
        if (now - this.lastContinuousEmit >= this.continuousThrottleMs) {
            this.lastContinuousEmit = now;

            // Only emit when there's meaningful head movement (dead-zone)
            if (Math.abs(yaw) > 0.03) {
                this.bus.emit({ type: 'HEAD_YAW', value: yaw, timestamp: now });
            }
            if (Math.abs(pitch) > 0.03) {
                this.bus.emit({ type: 'HEAD_PITCH', value: pitch, timestamp: now });
            }
        }
    }

    override destroy(): void {
        super.destroy();
        this.prevYaw = null;
        this.prevPitch = null;
    }

    // ── Private ───────────────────────────────────────────────────────────────

    /**
     * Estimate head yaw and pitch from facial landmarks.
     * Returns values in a normalised range where ~0 = centred.
     */
    private estimateHeadPose(landmarks: Landmark[]): { yaw: number; pitch: number } {
        // Use nose tip (1), left eye (33), right eye (263), chin (152)
        const nose = landmarks[1];
        const leftEye = landmarks[33];
        const rightEye = landmarks[263];
        const chin = landmarks[152];

        if (!nose || !leftEye || !rightEye || !chin) {
            return { yaw: 0, pitch: 0 };
        }

        // Face centre X between eyes
        const faceCentreX = (leftEye.x + rightEye.x) / 2;
        const eyeSpan = Math.abs(rightEye.x - leftEye.x);

        // Yaw: how far right/left nose tip is relative to face centre
        // Positive = head turned right
        const yaw = eyeSpan > 0.01
            ? ((nose.x - faceCentreX) / eyeSpan) * this.sensitivity * 2
            : 0;

        // Pitch: ratio of (nose Y to eye centre Y) vs (chin Y to eye centre Y)
        const eyeCentreY = (leftEye.y + rightEye.y) / 2;
        const faceHeight = Math.abs(chin.y - eyeCentreY);
        // Positive = looking down
        const pitch = faceHeight > 0.01
            ? ((nose.y - eyeCentreY) / faceHeight - 0.5) * this.sensitivity * 2
            : 0;

        return { yaw, pitch };
    }
}
