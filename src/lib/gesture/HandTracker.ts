import { BaseTracker } from './BaseTracker';
import { GestureEventBus } from './GestureEventBus';
import type { Landmark, TrackerOptions } from './types';

/**
 * HandTracker — detects 9 discrete hand gestures from MediaPipe hand landmarks.
 *
 * Landmark indices (MediaPipe convention):
 *   0  = Wrist
 *   4  = Thumb tip
 *   5,9,13,17 = Index/Middle/Ring/Pinky MCP (base knuckle)
 *   8,12,16,20 = Fingertip (index/middle/ring/pinky)
 */
export class HandTracker extends BaseTracker {
    /** Track wrist position from previous frame for swipe detection */
    private prevWristX: number | null = null;
    private prevWristY: number | null = null;

    /** Track Z distance between two index fingertips for zoom detection */
    private prevZoomDist: number | null = null;

    constructor(bus: GestureEventBus, options: TrackerOptions = {}) {
        super(bus, { cooldownMs: 600, ...options });
    }

    /**
     * Call this every frame with hand landmark arrays from MediaPipe.
     * The caller (GestureController) routes left/right hand data here.
     */
    processFrame(
        leftHand: Landmark[] | undefined,
        rightHand: Landmark[] | undefined
    ): void {
        if (!this.isActive) return;

        // Use the dominant / more visible hand — prefer right, fallback to left
        const hand = rightHand ?? leftHand;
        const handKey = rightHand ? 'right' : 'left';

        if (!hand || hand.length < 21) {
            this.prevWristX = null;
            this.prevWristY = null;
            return;
        }

        this.detectPinch(hand, handKey);
        this.detectOpenPalm(hand, handKey);
        this.detectFingerCount(hand, handKey);
        this.detectThumbUp(hand, handKey);
        this.detectSwipe(hand);
        this.detectZoom(leftHand, rightHand);
    }

    // ── Gesture Detectors ─────────────────────────────────────────────────────

    private detectPinch(hand: Landmark[], handKey: string): void {
        const thumbTip = hand[4];
        const indexTip = hand[8];
        const dist = Math.hypot(thumbTip.x - indexTip.x, thumbTip.y - indexTip.y);
        const isPinching = dist < 0.06 * this.sensitivity;

        // State machine via Map
        const wasPinching = (this as any)._wasPinching ?? false;
        if (isPinching && !wasPinching) {
            if (this.checkCooldown('pinch')) {
                this.bus.emit({ type: 'PINCH_START', timestamp: Date.now(), hand: handKey as 'left' | 'right' });
            }
        } else if (!isPinching && wasPinching) {
            this.bus.emit({ type: 'PINCH_END', timestamp: Date.now(), hand: handKey as 'left' | 'right' });
        }
        (this as any)._wasPinching = isPinching;
    }

    private detectOpenPalm(hand: Landmark[], handKey: string): void {
        // All 4 fingertips must be ABOVE their MCP joints (lower y = higher in image)
        const fingers = [
            [hand[8], hand[5]],   // index tip vs MCP
            [hand[12], hand[9]],  // middle
            [hand[16], hand[13]], // ring
            [hand[20], hand[17]], // pinky
        ];
        const allExtended = fingers.every(([tip, base]) => tip.y < base.y - 0.04);
        if (allExtended && this.checkCooldown('open_palm', 1200)) {
            this.bus.emit({ type: 'OPEN_PALM', timestamp: Date.now(), hand: handKey as 'left' | 'right' });
        }
    }

    private detectFingerCount(hand: Landmark[], handKey: string): void {
        const fingerPairs = [
            [hand[8], hand[5]],
            [hand[12], hand[9]],
            [hand[16], hand[13]],
            [hand[20], hand[17]],
        ];
        const extendedCount = fingerPairs.filter(([tip, base]) => tip.y < base.y - 0.04).length;

        if (extendedCount === 3 && this.checkCooldown('three_fingers', 1000)) {
            this.bus.emit({ type: 'THREE_FINGERS', timestamp: Date.now(), hand: handKey as 'left' | 'right' });
        } else if (extendedCount === 4 && this.checkCooldown('four_fingers', 1000)) {
            this.bus.emit({ type: 'FOUR_FINGERS', timestamp: Date.now(), hand: handKey as 'left' | 'right' });
        }
    }

    private detectThumbUp(hand: Landmark[], handKey: string): void {
        // Thumb tip is above wrist, all other fingers are folded (tips below MCPs)
        const thumbUp = hand[4].y < hand[0].y - 0.10;
        const fingersFolded = [
            hand[8].y > hand[5].y,
            hand[12].y > hand[9].y,
            hand[16].y > hand[13].y,
            hand[20].y > hand[17].y,
        ].every(Boolean);

        if (thumbUp && fingersFolded && this.checkCooldown('thumb_up', 1200)) {
            this.bus.emit({ type: 'THUMB_UP', timestamp: Date.now(), hand: handKey as 'left' | 'right' });
        }
    }

    private detectSwipe(hand: Landmark[]): void {
        const wrist = hand[0];
        const threshold = 0.08 * this.sensitivity;

        if (this.prevWristX !== null && this.prevWristY !== null) {
            const dx = wrist.x - this.prevWristX;
            const dy = wrist.y - this.prevWristY;

            if (Math.abs(dx) > Math.abs(dy)) {
                // Horizontal swipe
                if (dx > threshold && this.checkCooldown('swipe_lr', 600)) {
                    this.bus.emit({ type: 'SWIPE_RIGHT', timestamp: Date.now() });
                } else if (dx < -threshold && this.checkCooldown('swipe_lr', 600)) {
                    this.bus.emit({ type: 'SWIPE_LEFT', timestamp: Date.now() });
                }
            } else {
                // Vertical swipe
                if (dy > threshold && this.checkCooldown('swipe_ud', 600)) {
                    this.bus.emit({ type: 'SWIPE_DOWN', timestamp: Date.now() });
                } else if (dy < -threshold && this.checkCooldown('swipe_ud', 600)) {
                    this.bus.emit({ type: 'SWIPE_UP', timestamp: Date.now() });
                }
            }
        }

        this.prevWristX = wrist.x;
        this.prevWristY = wrist.y;
    }

    private detectZoom(leftHand?: Landmark[], rightHand?: Landmark[]): void {
        if (!leftHand || !rightHand) {
            this.prevZoomDist = null;
            return;
        }

        const leftIndex = leftHand[8];
        const rightIndex = rightHand[8];
        const dist = Math.hypot(leftIndex.x - rightIndex.x, leftIndex.y - rightIndex.y);

        if (this.prevZoomDist !== null) {
            const delta = dist - this.prevZoomDist;
            if (Math.abs(delta) > 0.02) {
                this.bus.emit({ type: 'ZOOM', value: delta * this.sensitivity, timestamp: Date.now() });
            }
        }
        this.prevZoomDist = dist;
    }

    override destroy(): void {
        super.destroy();
        this.prevWristX = null;
        this.prevWristY = null;
        this.prevZoomDist = null;
        (this as any)._wasPinching = false;
    }
}
