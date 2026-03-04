import { type TrackingLabData } from './HandTrackerAR';

export interface GestureActions {
    onSwipeLeft: () => void;
    onSwipeRight: () => void;
    onZoom: (delta: number) => void;       // +ve = zoom in
    onPan: (dx: number) => void;           // normalised delta
    onFaceYaw: (yaw: number) => void;      // continuous
    onSwipeUp: () => void;                 // add 1.0 mL
    onSwipeDown: () => void;               // add 0.1 mL
}

class SwipeBuffer {
    history: { x: number; y: number; time: number }[] = [];

    addPoint(x: number, y: number) {
        const now = Date.now();
        this.history.push({ x, y, time: now });
        // Keep only last 400ms
        this.history = this.history.filter(p => now - p.time < 400);
    }

    detectSwipe(): 'left' | 'right' | 'up' | 'down' | null {
        if (this.history.length < 5) return null;

        const first = this.history[0];
        const last = this.history[this.history.length - 1];

        const dx = last.x - first.x;
        const dy = last.y - first.y;

        // Threshold for a fast swipe
        if (Math.abs(dx) > 0.15 && Math.abs(dx) > Math.abs(dy)) {
            this.history = []; // reset after detection
            return dx > 0 ? 'right' : 'left';
        }

        if (Math.abs(dy) > 0.15 && Math.abs(dy) > Math.abs(dx)) {
            this.history = []; // reset
            return dy > 0 ? 'down' : 'up';
        }

        return null;
    }

    clear() {
        this.history = [];
    }
}

export class GestureProcessor {
    private leftBuffer = new SwipeBuffer();
    private rightBuffer = new SwipeBuffer();
    private lastPinchDist = 0;
    private lastPanX = 0;

    // Cooldown to prevent double-firing discrete gestures
    private lastSwipeTime = 0;

    processFrame(data: TrackingLabData, actions: GestureActions) {
        const now = Date.now();

        // 1. Face Yaw (Continuous)
        // If face is detected, delta yaw maps directly to orbit
        if (Math.abs(data.faceYaw) > 0.05) {
            // Apply a small deadzone of 0.05
            actions.onFaceYaw(data.faceYaw);
        }

        const isLeft = data.left.isPresent;
        const isRight = data.right.isPresent;

        // 2. Continuous Zoom (1-Hand Pinch)
        const activeHand = isRight ? data.right : isLeft ? data.left : null;
        if (activeHand) {
            const dist = activeHand.pinchDist;
            if (this.lastPinchDist !== 0) {
                const zoomDelta = dist - this.lastPinchDist;
                // Tiny deadzone to prevent jitter
                if (Math.abs(zoomDelta) > 0.003) {
                    // Outwards pinch = larger dist = positive zoom in
                    actions.onZoom(zoomDelta * 8.0);
                }
            }
            this.lastPinchDist = dist;
        } else {
            this.lastPinchDist = 0;
        }

        // 3. Both Hands Pan
        if (isLeft && isRight) {
            // Calculate average X position of both index tips for Pan
            const panX = (data.left.indexTip.x + data.right.indexTip.x) / 2;
            if (this.lastPanX !== 0) {
                const panDelta = panX - this.lastPanX;
                if (Math.abs(panDelta) > 0.002) {
                    actions.onPan(panDelta);
                }
            }
            this.lastPanX = panX;

            // Clear swipe buffers since we are doing 2-hand panning
            this.leftBuffer.clear();
            this.rightBuffer.clear();
            return; // Don't process single-hand swipes while panning
        } else {
            this.lastPanX = 0;
        }

        // 3. One Hand Swipes
        const checkSwipe = (buffer: SwipeBuffer) => {
            if (now - this.lastSwipeTime < 800) return; // global swipe cooldown

            const swipe = buffer.detectSwipe();
            if (swipe) {
                this.lastSwipeTime = now;
                console.log(`[Gesture] Swipe ${swipe}`);

                if (swipe === 'left') actions.onSwipeLeft();
                if (swipe === 'right') actions.onSwipeRight();
                if (swipe === 'up') actions.onSwipeUp();
                if (swipe === 'down') actions.onSwipeDown();
            }
        };

        if (isLeft) {
            this.leftBuffer.addPoint(data.left.wrist.x, data.left.wrist.y);
            checkSwipe(this.leftBuffer);
        } else {
            this.leftBuffer.clear();
        }

        if (isRight) {
            this.rightBuffer.addPoint(data.right.wrist.x, data.right.wrist.y);
            checkSwipe(this.rightBuffer);
        } else {
            this.rightBuffer.clear();
        }
    }
}
