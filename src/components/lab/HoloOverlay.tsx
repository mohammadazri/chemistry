import React, { useEffect, useRef } from 'react';
import { type TrackingLabData } from './HandTrackerAR';
import { useExperimentStore } from '../../store/experimentStore';

interface HoloOverlayProps {
    trackingRef: React.MutableRefObject<TrackingLabData>;
    zoomDeltaRef: React.MutableRefObject<number>;
}

export const HoloOverlay: React.FC<HoloOverlayProps> = ({ trackingRef, zoomDeltaRef }) => {
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
            const currentHoveredEls = new Set<HTMLElement>();

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

            // 4. AR Zoom Slider Interaction
            const zoomSlider = document.getElementById("ar-zoom-slider");
            const zoomHandle = document.getElementById("ar-zoom-handle");
            if (zoomSlider && zoomHandle) {
                const rect = zoomSlider.getBoundingClientRect();

                let activeY = -1;
                let isGrabbing = false;

                // Check left hand grab
                if (data.left.isPresent && data.left.isPinching) {
                    const l = getScreenCoords(data.left.indexTip.x, data.left.indexTip.y);
                    if (l.x >= rect.left - 40 && l.x <= rect.right + 40 && l.y >= rect.top && l.y <= rect.bottom) {
                        activeY = l.y;
                        isGrabbing = true;
                    }
                }
                // Check right hand grab (prioritized if both)
                if (data.right.isPresent && data.right.isPinching) {
                    const r = getScreenCoords(data.right.indexTip.x, data.right.indexTip.y);
                    if (r.x >= rect.left - 40 && r.x <= rect.right + 40 && r.y >= rect.top && r.y <= rect.bottom) {
                        activeY = r.y;
                        isGrabbing = true;
                    }
                }

                if (isGrabbing) {
                    // Calculate normalized position -1 (bottom) to 1 (top)
                    const centerY = rect.top + rect.height / 2;
                    let normY = (centerY - activeY) / (rect.height / 2);
                    normY = Math.max(-1, Math.min(1, normY)); // clamp

                    // Visual feedback
                    zoomHandle.style.transform = `translateY(${-normY * (rect.height / 2)}px) scale(1.2)`;
                    zoomHandle.style.backgroundColor = '#10b981'; // emerald-500
                    zoomSlider.style.borderColor = '#10b981';
                    zoomSlider.style.boxShadow = '0 0 20px rgba(16, 185, 129, 0.4)';

                    // Apply zoom (deadzone in middle)
                    if (Math.abs(normY) > 0.1) {
                        // Positive normY (top half) = zoom in
                        zoomDeltaRef.current += normY * 0.15;
                    }
                } else {
                    // Reset visuals
                    zoomHandle.style.transform = `translateY(0px) scale(1)`;
                    zoomHandle.style.backgroundColor = '#6366f1'; // indigo-500
                    zoomSlider.style.borderColor = 'rgba(99, 102, 241, 0.3)';
                    zoomSlider.style.boxShadow = 'none';
                }
            }


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

            {/* AR Zoom Slider */}
            <div className="fixed right-8 top-1/2 -translate-y-1/2 flex flex-col items-center gap-3 z-40 pointer-events-none opacity-80 backdrop-blur-sm">
                <span className="text-xs font-bold text-indigo-400 tracking-widest uppercase">Zoom In</span>
                <div
                    id="ar-zoom-slider"
                    className="w-2 h-48 bg-indigo-500/10 rounded-full border border-indigo-500/30 relative flex justify-center items-center transition-all duration-200"
                >
                    <div
                        id="ar-zoom-handle"
                        className="w-6 h-6 rounded-full bg-indigo-500 absolute shadow-[0_0_15px_rgba(99,102,241,0.6)] flex items-center justify-center transition-transform duration-75"
                    >
                        <div className="w-2 h-2 rounded-full bg-white"></div>
                    </div>
                </div>
                <span className="text-xs font-bold text-indigo-400 tracking-widest uppercase">Zoom Out</span>
            </div>
        </div>
    );
};
