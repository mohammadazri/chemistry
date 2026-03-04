import { GestureEventBus } from './GestureEventBus';
import type { TrackerOptions } from './types';

/**
 * BaseTracker — Abstract base class for HandTracker and HeadTracker.
 *
 * Provides:
 * - Shared event bus reference
 * - Pause / resume lifecycle
 * - Sensitivity + cooldown configuration
 * - Cooldown helper method for discrete gesture events
 */
export abstract class BaseTracker {
    protected bus: GestureEventBus;
    protected isActive = true;
    protected sensitivity: number;
    protected cooldownMs: number;

    /** Map of gesture type → last emit timestamp for cooldown enforcement */
    protected lastEmit = new Map<string, number>();

    constructor(bus: GestureEventBus, options: TrackerOptions = {}) {
        this.bus = bus;
        this.sensitivity = options.sensitivity ?? 1.0;
        this.cooldownMs = options.cooldownMs ?? 600;
    }

    /** Pause event emission without stopping landmark processing. */
    pause(): void {
        this.isActive = false;
    }

    /** Resume event emission. */
    resume(): void {
        this.isActive = true;
    }

    /** Full teardown — override in subclass if cleanup needed. */
    destroy(): void {
        this.isActive = false;
    }

    /**
     * Cooldown gate: returns true only if enough time has passed since the
     * last emit of the given key, then records the current time.
     */
    protected checkCooldown(key: string, cooldownOverride?: number): boolean {
        const now = Date.now();
        const cd = cooldownOverride ?? this.cooldownMs;
        const last = this.lastEmit.get(key) ?? 0;
        if (now - last < cd) return false;
        this.lastEmit.set(key, now);
        return true;
    }
}
