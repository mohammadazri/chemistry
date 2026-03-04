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

    // Dwell Time tracking for hover-to-click
    const hoverStartMap = useRef<Map<HTMLElement, { startTime: number, isPinching: boolean }>>(new Map());

    useEffect(() => {
        let animId: number;
        const cursorLeft = document.getElementById("cursor-left");
        const cursorRight = document.getElementById("cursor-right");

        // Cursor smoothing
        let smLeft = { x: -1, y: -1 };
        let smRight = { x: -1, y: -1 };
        const CURSOR_LERP = 0.25;

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

            // 2. Cursors with Smoothing
            if (cursorLeft) {
                if (data.left.isPresent) {
                    const l = getScreenCoords(data.left.indexTip.x, data.left.indexTip.y);
                    if (smLeft.x === -1) { smLeft = l; }
                    smLeft.x += (l.x - smLeft.x) * CURSOR_LERP;
                    smLeft.y += (l.y - smLeft.y) * CURSOR_LERP;

                    cursorLeft.style.transform = `translate(${smLeft.x}px, ${smLeft.y}px)`;
                    cursorLeft.style.opacity = '1';
                } else {
                    cursorLeft.style.opacity = '0';
                    smLeft = { x: -1, y: -1 };
                }
            }
            if (cursorRight) {
                if (data.right.isPresent) {
                    const r = getScreenCoords(data.right.indexTip.x, data.right.indexTip.y);
                    if (smRight.x === -1) { smRight = r; }
                    smRight.x += (r.x - smRight.x) * CURSOR_LERP;
                    smRight.y += (r.y - smRight.y) * CURSOR_LERP;

                    cursorRight.style.transform = `translate(${smRight.x}px, ${smRight.y}px)`;
                    cursorRight.style.opacity = '1';
                } else {
                    cursorRight.style.opacity = '0';
                    smRight = { x: -1, y: -1 };
                }
            }

            // 3. Hover + Pinch interactions on .interactable-btn
            const interactables = document.querySelectorAll(".interactable-btn");
            const now = Date.now();
            const currentHoveredEls = new Set<HTMLElement>();

            interactables.forEach((item) => {
                const el = item as HTMLElement;
                const rect = item.getBoundingClientRect();

                let isLeftHover = false;
                let isRightHover = false;

                // Use the smoothed coordinates for click testing so visual matches logic
                if (data.left.isPresent && smLeft.x !== -1) {
                    if (smLeft.x >= rect.left && smLeft.x <= rect.right && smLeft.y >= rect.top && smLeft.y <= rect.bottom) {
                        isLeftHover = true;
                    }
                }

                if (data.right.isPresent && smRight.x !== -1) {
                    if (smRight.x >= rect.left && smRight.x <= rect.right && smRight.y >= rect.top && smRight.y <= rect.bottom) {
                        isRightHover = true;
                    }
                }

                const isHovered = isLeftHover || isRightHover;

                if (isHovered) {
                    currentHoveredEls.add(el);

                    // Initialize or get hover data
                    let hoverData = hoverStartMap.current.get(el);
                    if (!hoverData) {
                        hoverData = { startTime: now, isPinching: false };
                        hoverStartMap.current.set(el, hoverData);

                        // Initial hover style
                        el.style.transform = "scale(1.05)";
                        el.style.boxShadow = "0 0 15px rgba(99, 102, 241, 0.4)";
                        el.style.transition = "all 0.2s ease-out";
                    }

                    // Calculate dwell progress
                    const dwellDuration = now - hoverData.startTime;
                    const dwellThreshold = 1200; // 1.2s to auto-click

                    // Provide visual feedback mechanism for dwell (e.g. shrinking slightly or changing colour)
                    if (dwellDuration > 300 && dwellDuration < dwellThreshold) {
                        const progress = (dwellDuration - 300) / (dwellThreshold - 300);
                        // Subtly pulse or fill to indicate it's 'charging'
                        el.style.transform = `scale(${1.05 - (progress * 0.05)})`;
                    }

                    // Trigger click if:
                    // A) Pinch detected (fast click)
                    // B) Hovered for 1.2s (dwell click)
                    const isLeftPinchTrigger = isLeftHover && data.left.isPinching && (now - lastLeftClickTime.current > 500);
                    const isRightPinchTrigger = isRightHover && data.right.isPinching && (now - lastRightClickTime.current > 500);
                    const isDwellTrigger = dwellDuration >= dwellThreshold;

                    if (isLeftPinchTrigger || isRightPinchTrigger || isDwellTrigger) {
                        // Dispatch events
                        el.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, cancelable: true }));
                        el.dispatchEvent(new PointerEvent('mousedown', { bubbles: true, cancelable: true }));
                        el.dispatchEvent(new PointerEvent('click', { bubbles: true, cancelable: true }));
                        el.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, cancelable: true }));
                        el.dispatchEvent(new PointerEvent('mouseup', { bubbles: true, cancelable: true }));

                        // Update cooldowns
                        if (isLeftHover) lastLeftClickTime.current = now;
                        if (isRightHover) lastRightClickTime.current = now;

                        // Reset dwell timer so it doesn't spam click while still hovering
                        hoverData.startTime = now + 500; // 500ms post-click penalty

                        // Visual feedback of click
                        el.style.transform = "scale(0.95)";
                        el.style.boxShadow = "0 0 25px rgba(34, 197, 94, 0.6)"; // Flash green
                        setTimeout(() => {
                            if (el) el.style.boxShadow = "0 0 15px rgba(99, 102, 241, 0.4)";
                        }, 200);
                    }
                }
            });


            // Cleanup hover map for elements no longer being hovered
            hoverStartMap.current.forEach((_, key) => {
                if (!currentHoveredEls.has(key)) {
                    hoverStartMap.current.delete(key);
                    // Reset styling cleanly
                    key.style.transform = "";
                    key.style.boxShadow = "";
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
