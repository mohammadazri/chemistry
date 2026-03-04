import type { GestureEventType, GesturePayload } from './types';

type GestureHandler = (payload: GesturePayload) => void;

/**
 * GestureEventBus — A typed, synchronous pub/sub event system.
 *
 * Pure TypeScript — no React dependency. Used internally by all tracker
 * classes to communicate gesture events to subscribers above them in the stack.
 *
 * Usage:
 *   const bus = new GestureEventBus();
 *   const unsub = bus.on('PINCH_START', (payload) => { ... });
 *   bus.emit({ type: 'PINCH_START', timestamp: Date.now() });
 *   unsub(); // cleanup
 */
export class GestureEventBus {
    private handlers = new Map<GestureEventType, Set<GestureHandler>>();

    /**
     * Subscribe to a specific gesture event type.
     * @returns an unsubscribe function — call it during cleanup to prevent leaks.
     */
    on(type: GestureEventType, handler: GestureHandler): () => void {
        if (!this.handlers.has(type)) {
            this.handlers.set(type, new Set());
        }
        this.handlers.get(type)!.add(handler);

        // Return unsubscriber
        return () => {
            this.handlers.get(type)?.delete(handler);
        };
    }

    /**
     * Emit a gesture event to all registered subscribers.
     */
    emit(payload: GesturePayload): void {
        const set = this.handlers.get(payload.type);
        if (!set) return;
        set.forEach((fn) => {
            try {
                fn(payload);
            } catch (err) {
                console.error('[GestureEventBus] Handler threw:', err);
            }
        });
    }

    /**
     * Subscribe to ALL gesture event types with a single handler.
     * Useful for logging or the main integration layer.
     * @returns unsubscribe function for all subscriptions.
     */
    onAny(handler: GestureHandler): () => void {
        const allTypes: GestureEventType[] = [
            'PINCH_START', 'PINCH_END', 'OPEN_PALM',
            'THREE_FINGERS', 'FOUR_FINGERS', 'THUMB_UP',
            'SWIPE_LEFT', 'SWIPE_RIGHT', 'SWIPE_UP', 'SWIPE_DOWN',
            'ZOOM', 'HEAD_YAW', 'HEAD_PITCH', 'HEAD_NOD', 'HEAD_SHAKE',
        ];
        const unsubs = allTypes.map((type) => this.on(type, handler));
        return () => unsubs.forEach((fn) => fn());
    }

    /**
     * Remove all subscriptions. Call during controller destroy.
     */
    clear(): void {
        this.handlers.clear();
    }
}
