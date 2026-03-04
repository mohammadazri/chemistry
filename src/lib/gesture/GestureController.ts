import { GestureEventBus } from './GestureEventBus';
import { MediaPipeLoader } from './MediaPipeLoader';
import { HandTracker } from './HandTracker';
import { HeadTracker } from './HeadTracker';
import type {
    ControllerStatus,
    GestureEventType,
    GesturePayload,
    TrackerOptions,
} from './types';

export interface GestureControllerOptions {
    hand?: TrackerOptions;
    head?: TrackerOptions;
}

/**
 * GestureController — the main entry point for the AR gesture system.
 *
 * Composes MediaPipeLoader + HandTracker + HeadTracker and provides a clean API:
 *   controller.start()
 *   controller.pause() / controller.resume()
 *   controller.stop()
 *   controller.on('PINCH_START', handler)  → returns unsubscribe fn
 *   controller.onAny(handler)
 *   controller.getStatus()
 *   controller.getVideoElement()
 */
export class GestureController {
    private bus = new GestureEventBus();
    private loader = new MediaPipeLoader();
    private handTracker: HandTracker;
    private headTracker: HeadTracker;
    private status: ControllerStatus = 'idle';

    constructor(options: GestureControllerOptions = {}) {
        this.handTracker = new HandTracker(this.bus, options.hand);
        this.headTracker = new HeadTracker(this.bus, options.head);
    }

    /** Start the gesture system — loads MediaPipe and acquires webcam. */
    async start(): Promise<void> {
        if (this.status === 'active') return;
        this.status = 'loading';

        try {
            await this.loader.startTracking((results) => {
                if (this.status !== 'active') return;

                this.handTracker.processFrame(
                    results.leftHandLandmarks,
                    results.rightHandLandmarks
                );
                this.headTracker.processFrame(results.faceLandmarks);
            });
            this.status = 'active';
        } catch (err) {
            this.status = 'error';
            console.error('[GestureController] Failed to start:', err);
            throw err;
        }
    }

    /** Pause gesture emission without stopping the webcam. */
    pause(): void {
        if (this.status !== 'active') return;
        this.handTracker.pause();
        this.headTracker.pause();
        this.loader.stop();
        this.status = 'paused';
    }

    /** Resume after pause. */
    resume(): void {
        if (this.status !== 'paused') return;
        this.handTracker.resume();
        this.headTracker.resume();
        this.loader.restart();
        this.status = 'active';
    }

    /** Fully stop and release all resources. */
    stop(): void {
        this.loader.destroy();
        this.handTracker.destroy();
        this.headTracker.destroy();
        this.bus.clear();
        this.status = 'idle';
    }

    /** Subscribe to a specific gesture event. Returns unsubscribe function. */
    on(type: GestureEventType, handler: (payload: GesturePayload) => void): () => void {
        return this.bus.on(type, handler);
    }

    /** Subscribe to all gesture events. Returns unsubscribe function. */
    onAny(handler: (payload: GesturePayload) => void): () => void {
        return this.bus.onAny(handler);
    }

    /** Current controller status. */
    getStatus(): ControllerStatus {
        return this.status;
    }

    /** Returns the HTMLVideoElement used for the webcam PiP feed. */
    getVideoElement(): HTMLVideoElement | null {
        return this.loader.getVideoElement();
    }
}
