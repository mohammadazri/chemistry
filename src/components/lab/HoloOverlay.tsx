import React, { useEffect, useRef } from 'react';
import { type TrackingLabData } from './HandTrackerAR';
import { useExperimentStore } from '../../store/experimentStore';

interface HoloOverlayProps {
    trackingRef: React.MutableRefObject<TrackingLabData>;
}

export const HoloOverlay: React.FC<HoloOverlayProps> = ({ trackingRef }) => {
    // To grab the zustand store directly without causing re-renders
    const setStopcockOpen = useExperimentStore.getState().setStopcockOpen;

    // Cooldown refs for discrete clicks to prevent spam firing
    const lastLeftClickTime = useRef(0);
    const lastRightClickTime = useRef(0);

    useEffect(() => {
        let animId: number;
        const cursorLeft = document.getElementById("cursor-left");
        const cursorRight = document.getElementById("cursor-right");

        const updateUI = () => {
            const data = trackingRef.current;
            const screenW = window.innerWidth;
            const screenH = window.innerHeight;

            // Assume 16:9 webcam for now
            const videoAspect = 1280 / 720;
            const screenAspect = screenW / screenH;

            // Coordinate Remapping (same math as HoloLab)
            const getScreenCoords = (nx: number, ny: number) => {
                let x, y;
                if (screenAspect > videoAspect) {
                    const videoH_pixels = (1 / videoAspect) * screenW;
                    const offsetY = (videoH_pixels - screenH) / 2;
                    x = nx * screenW;
                    y = ny * videoH_pixels - offsetY;
                } else {
                    const videoW_pixels = videoAspect * screenH;
                    const offsetX = (videoW_pixels - screenW) / 2;
                    x = nx * videoW_pixels - offsetX;
                    y = ny * screenH;
                }
                return { x, y };
            };

            // 1. Both Hands = Open Stopcock
            // The lab stage must be 'titrate' for this to actually pour, but we'll always fire the state
            if (data.left.isPresent && data.right.isPresent) {
                // To avoid thrashing state in rAF, we check current state first via getState
                if (!useExperimentStore.getState().isStopcockOpen) {
                    setStopcockOpen(true);
                }
            } else {
                if (useExperimentStore.getState().isStopcockOpen) {
                    setStopcockOpen(false);
                }
            }

            // 2. Cursors
            if (cursorLeft) {
                if (data.left.isPresent) {
                    const l = getScreenCoords(data.left.indexTip.x, data.left.indexTip.y);
                    cursorLeft.style.transform = `translate(${l.x}px, ${l.y}px)`;
                    cursorLeft.style.opacity = '1';
                } else {
                    cursorLeft.style.opacity = '0';
                }
            }
            if (cursorRight) {
                if (data.right.isPresent) {
                    const r = getScreenCoords(data.right.indexTip.x, data.right.indexTip.y);
                    cursorRight.style.transform = `translate(${r.x}px, ${r.y}px)`;
                    cursorRight.style.opacity = '1';
                } else {
                    cursorRight.style.opacity = '0';
                }
            }

            // 3. Hover + Pinch interactions on .interactable-btn
            const interactables = document.querySelectorAll(".interactable-btn");
            const now = Date.now();

            interactables.forEach((item) => {
                const el = item as HTMLElement;
                const rect = item.getBoundingClientRect();

                let isLeftHover = false;
                let isRightHover = false;

                if (data.left.isPresent) {
                    const l = getScreenCoords(data.left.indexTip.x, data.left.indexTip.y);
                    if (l.x >= rect.left && l.x <= rect.right && l.y >= rect.top && l.y <= rect.bottom) {
                        isLeftHover = true;
                    }
                }

                if (data.right.isPresent) {
                    const r = getScreenCoords(data.right.indexTip.x, data.right.indexTip.y);
                    if (r.x >= rect.left && r.x <= rect.right && r.y >= rect.top && r.y <= rect.bottom) {
                        isRightHover = true;
                    }
                }

                const isHovered = isLeftHover || isRightHover;

                // Visual Highlight
                if (isHovered) {
                    el.style.transform = "scale(1.05)";
                    // Check pinch distance: thumb to index.
                    // Instead of full landmark tracking for thumb, we rely on a simplified 'pinch' calculation 
                    // from HoloLab: we check if the bounding box of wrist->index is small, or we simulate it.
                    // Wait, the new MediaPipe Tasks-Vision `HandLandmarker` doesn't give us `isPinching` directly by default.
                    // I will calculate it in HandTrackerAR and pass it in TrackingLabData.
                } else {
                    // Remove inline transform scale to let CSS handle it
                    el.style.transform = "";
                }

                // If pinching, fire click (with 500ms cooldown)
                if (isLeftHover && data.left.isPinching && (now - lastLeftClickTime.current > 500)) {
                    // Dispatch pointer events for React 18+ synthetic event system
                    el.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, cancelable: true }));
                    el.dispatchEvent(new PointerEvent('mousedown', { bubbles: true, cancelable: true }));
                    el.dispatchEvent(new PointerEvent('click', { bubbles: true, cancelable: true }));
                    el.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, cancelable: true }));
                    el.dispatchEvent(new PointerEvent('mouseup', { bubbles: true, cancelable: true }));
                    lastLeftClickTime.current = now;
                    // Provide tiny visual feedback
                    el.style.transform = "scale(0.90)";
                }
                if (isRightHover && data.right.isPinching && (now - lastRightClickTime.current > 500)) {
                    el.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, cancelable: true }));
                    el.dispatchEvent(new PointerEvent('mousedown', { bubbles: true, cancelable: true }));
                    el.dispatchEvent(new PointerEvent('click', { bubbles: true, cancelable: true }));
                    el.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, cancelable: true }));
                    el.dispatchEvent(new PointerEvent('mouseup', { bubbles: true, cancelable: true }));
                    lastRightClickTime.current = now;
                    el.style.transform = "scale(0.90)";
                }
            });

            animId = requestAnimationFrame(updateUI);
        };

        animId = requestAnimationFrame(updateUI);
        return () => {
            cancelAnimationFrame(animId);
            // Cleanup visually if unmounted
            if (cursorLeft) cursorLeft.style.opacity = '0';
            if (cursorRight) cursorRight.style.opacity = '0';
        };
    }, [trackingRef, setStopcockOpen]);

    return (
        <div className="absolute inset-0 pointer-events-none z-50">
            {/* Left Cursor */}
            <div
                id="cursor-left"
                className="fixed top-0 left-0 w-8 h-8 rounded-full border-2 -translate-x-1/2 -translate-y-1/2 pointer-events-none transition-opacity duration-150 ease-out flex items-center justify-center"
                style={{ borderColor: '#6366f1', backgroundColor: 'rgba(99,102,241,0.2)', opacity: 0 }}
            >
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div>
            </div>

            {/* Right Cursor */}
            <div
                id="cursor-right"
                className="fixed top-0 left-0 w-8 h-8 rounded-full border-2 -translate-x-1/2 -translate-y-1/2 pointer-events-none transition-opacity duration-150 ease-out flex items-center justify-center"
                style={{ borderColor: '#8b5cf6', backgroundColor: 'rgba(139,92,246,0.2)', opacity: 0 }}
            >
                <div className="w-1.5 h-1.5 rounded-full bg-purple-500"></div>
            </div>
        </div>
    );
};
