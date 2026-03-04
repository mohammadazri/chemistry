import { useRef, useEffect, useState, useCallback } from 'react';
import { useUiStore } from '../../store/uiStore';
import { useExperimentStore } from '../../store/experimentStore';
import { useGestureController } from '../../hooks/useGestureController';
import type { GesturePayload } from '../../lib/gesture';

// Gesture emoji + label pairs for the toast and cheatsheet
const GESTURE_LABELS: Record<string, { emoji: string; label: string }> = {
    PINCH_START: { emoji: '🤌', label: 'Pinch → Open stopcock' },
    PINCH_END: { emoji: '✋', label: 'Release → Close stopcock' },
    OPEN_PALM: { emoji: '🖐', label: 'Open Palm → Finish & Analyze' },
    THREE_FINGERS: { emoji: '3️⃣', label: '3 Fingers → Reset Experiment' },
    FOUR_FINGERS: { emoji: '4️⃣', label: '4 Fingers → Toggle Molecular View' },
    THUMB_UP: { emoji: '👍', label: 'Thumb Up → Toggle Assistant' },
    SWIPE_LEFT: { emoji: '👈', label: 'Swipe Left → Prev Sidebar Tab' },
    SWIPE_RIGHT: { emoji: '👉', label: 'Swipe Right → Next Sidebar Tab' },
    SWIPE_UP: { emoji: '👆', label: 'Swipe Up → Add 1.0 mL' },
    SWIPE_DOWN: { emoji: '👇', label: 'Swipe Down → Add 0.1 mL' },
    HEAD_NOD: { emoji: '🙂', label: 'Head Nod → Advance Tutorial' },
    HEAD_SHAKE: { emoji: '🙅', label: 'Head Shake → Close Modal' },
};

const SIDEBAR_TABS = ['controls', 'data', 'chart'] as const;

interface GestureHUDProps {
    /** Called when GestureHUD wants to route head pose events to GestureCamera */
    onCameraGesture?: (payload: GesturePayload) => void;
}

export default function GestureHUD({ onCameraGesture }: GestureHUDProps) {
    const arEnabled = useUiStore((s) => s.arEnabled);
    const toggleAr = useUiStore((s) => s.toggleAr);
    const [showCheatsheet, setShowCheatsheet] = useState(false);

    // Toast state
    const [toast, setToast] = useState<{ emoji: string; label: string } | null>(null);
    const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Lab store actions
    const setStopcockOpen = useExperimentStore((s) => s.setStopcockOpen);
    const addVolume = useExperimentStore((s) => s.addVolume);
    const resetExperiment = useExperimentStore((s) => s.resetExperiment);
    const setLabStage = useExperimentStore((s) => s.setLabStage);
    const toggleMolecular = useUiStore((s) => s.toggleMolecular);
    const toggleAssistant = useUiStore((s) => s.toggleAssistant);
    const toggleResults = useUiStore((s) => s.toggleResults);
    const toggleTutorial = useUiStore((s) => s.toggleTutorial);
    const setSidebarTab = useUiStore((s) => s.setSidebarTab);
    const sidebarTab = useUiStore((s) => s.sidebarTab);

    const showToast = useCallback((type: string) => {
        const info = GESTURE_LABELS[type];
        if (!info) return;
        setToast(info);
        if (toastTimer.current) clearTimeout(toastTimer.current);
        toastTimer.current = setTimeout(() => setToast(null), 900);
    }, []);

    const handleGesture = useCallback((payload: GesturePayload) => {
        showToast(payload.type);

        // Route camera events to GestureCamera
        if (payload.type === 'HEAD_YAW' || payload.type === 'HEAD_PITCH' || payload.type === 'ZOOM') {
            onCameraGesture?.(payload);
            return;
        }

        // Lab actions
        switch (payload.type) {
            case 'PINCH_START':
                setStopcockOpen(true);
                break;
            case 'PINCH_END':
                setStopcockOpen(false);
                break;
            case 'OPEN_PALM':
                setLabStage('done');
                toggleResults();
                break;
            case 'THREE_FINGERS':
                resetExperiment();
                break;
            case 'FOUR_FINGERS':
                toggleMolecular();
                break;
            case 'THUMB_UP':
                toggleAssistant();
                break;
            case 'SWIPE_UP':
                addVolume(1.0);
                break;
            case 'SWIPE_DOWN':
                addVolume(0.1);
                break;
            case 'SWIPE_RIGHT': {
                const idx = SIDEBAR_TABS.indexOf(sidebarTab);
                setSidebarTab(SIDEBAR_TABS[(idx + 1) % SIDEBAR_TABS.length]);
                break;
            }
            case 'SWIPE_LEFT': {
                const idx = SIDEBAR_TABS.indexOf(sidebarTab);
                setSidebarTab(SIDEBAR_TABS[(idx + SIDEBAR_TABS.length - 1) % SIDEBAR_TABS.length]);
                break;
            }
            case 'HEAD_NOD':
                toggleTutorial();
                break;
            case 'HEAD_SHAKE':
                toggleResults();
                break;
        }
    }, [setStopcockOpen, addVolume, resetExperiment, setLabStage, toggleMolecular,
        toggleAssistant, toggleResults, toggleTutorial, setSidebarTab, sidebarTab,
        onCameraGesture, showToast]);

    const { status, videoEl } = useGestureController({
        enabled: arEnabled,
        onGesture: handleGesture,
    });

    // Attach the video element to our canvas-like container
    const videoContainerRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        if (!videoContainerRef.current || !videoEl) return;
        videoEl.style.display = 'block';
        videoEl.style.width = '100%';
        videoEl.style.height = '100%';
        videoEl.style.objectFit = 'cover';
        videoEl.style.transform = 'scaleX(-1)';
        videoEl.style.borderRadius = '8px';
        videoContainerRef.current.appendChild(videoEl);
        return () => {
            videoEl.style.display = 'none';
            if (videoContainerRef.current?.contains(videoEl)) {
                videoContainerRef.current.removeChild(videoEl);
            }
        };
    }, [videoEl]);

    const statusColor = {
        idle: '#64748b',
        loading: '#f59e0b',
        'requesting-camera': '#f59e0b',
        active: '#22c55e',
        paused: '#f59e0b',
        error: '#ef4444',
    }[status] ?? '#64748b';

    const statusLabel = {
        idle: 'Off',
        loading: 'Loading…',
        'requesting-camera': 'Camera…',
        active: 'Active',
        paused: 'Paused',
        error: 'Error',
    }[status] ?? status;

    return (
        <div
            style={{
                position: 'fixed',
                bottom: '1.5rem',
                right: '1.5rem',
                zIndex: 50,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-end',
                gap: '0.5rem',
                fontFamily: 'Inter, system-ui, sans-serif',
            }}
        >
            {/* ── Gesture Toast ── */}
            {toast && (
                <div style={{
                    background: 'rgba(15,15,26,0.92)',
                    border: '1px solid #6366f1',
                    borderRadius: '12px',
                    padding: '0.5rem 1rem',
                    color: '#e2e8f0',
                    fontSize: '0.85rem',
                    backdropFilter: 'blur(12px)',
                    animation: 'fadeInUp 0.15s ease',
                    pointerEvents: 'none',
                }}>
                    {toast.emoji} {toast.label}
                </div>
            )}

            {/* ── Cheatsheet ── */}
            {showCheatsheet && (
                <div style={{
                    background: 'rgba(15,15,26,0.95)',
                    border: '1px solid rgba(99,102,241,0.4)',
                    borderRadius: '16px',
                    padding: '1rem',
                    width: '280px',
                    backdropFilter: 'blur(20px)',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                }}>
                    <div style={{ color: '#a5b4fc', fontSize: '0.7rem', fontWeight: 700, marginBottom: '0.6rem', letterSpacing: '0.08em' }}>
                        GESTURE CONTROLS
                    </div>
                    {Object.entries(GESTURE_LABELS).map(([type, { emoji, label }]) => (
                        <div key={type} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.2rem 0', color: '#cbd5e1', fontSize: '0.78rem' }}>
                            <span style={{ fontSize: '1.1rem' }}>{emoji}</span>
                            <span>{label}</span>
                        </div>
                    ))}
                </div>
            )}

            {/* ── Main HUD Panel ── */}
            <div style={{
                background: 'rgba(15,15,26,0.88)',
                border: '1px solid rgba(99,102,241,0.5)',
                borderRadius: '20px',
                padding: '0.75rem',
                backdropFilter: 'blur(20px)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
                minWidth: '176px',
            }}>
                {/* Header row */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <span style={{ fontSize: '1rem' }}>🤚</span>
                        <span style={{ color: '#e2e8f0', fontSize: '0.78rem', fontWeight: 600 }}>AR Control</span>
                    </div>
                    {/* Status dot */}
                    <div style={{
                        width: 8, height: 8, borderRadius: '50%',
                        background: statusColor,
                        boxShadow: `0 0 6px ${statusColor}`,
                    }} title={statusLabel} />
                </div>

                {/* Webcam PiP */}
                {arEnabled && (
                    <div
                        ref={videoContainerRef}
                        style={{
                            width: '160px',
                            height: '120px',
                            borderRadius: '8px',
                            overflow: 'hidden',
                            background: '#000',
                            border: '1px solid rgba(99,102,241,0.4)',
                            position: 'relative',
                        }}
                    >
                        {/* Scanning line overlay */}
                        <div style={{
                            position: 'absolute',
                            inset: 0,
                            background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(99,102,241,0.04) 2px, rgba(99,102,241,0.04) 4px)',
                            pointerEvents: 'none',
                            zIndex: 1,
                        }} />
                        {status !== 'active' && (
                            <div style={{
                                position: 'absolute',
                                inset: 0,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#64748b',
                                fontSize: '0.7rem',
                                zIndex: 2,
                            }}>
                                {statusLabel}
                            </div>
                        )}
                    </div>
                )}

                {/* Controls row */}
                <div style={{ display: 'flex', gap: '0.4rem' }}>
                    {/* AR Toggle */}
                    <button
                        onClick={toggleAr}
                        style={{
                            flex: 1,
                            background: arEnabled
                                ? 'linear-gradient(135deg, #6366f1, #8b5cf6)'
                                : 'rgba(255,255,255,0.05)',
                            border: `1px solid ${arEnabled ? '#818cf8' : 'rgba(255,255,255,0.1)'}`,
                            borderRadius: '10px',
                            color: arEnabled ? '#fff' : '#94a3b8',
                            fontSize: '0.72rem',
                            fontWeight: 600,
                            padding: '0.35rem 0.5rem',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                        }}
                    >
                        {arEnabled ? '🟢 ON' : '⭕ OFF'}
                    </button>

                    {/* Cheatsheet toggle */}
                    <button
                        onClick={() => setShowCheatsheet((p) => !p)}
                        style={{
                            background: showCheatsheet
                                ? 'rgba(99,102,241,0.2)'
                                : 'rgba(255,255,255,0.05)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '10px',
                            color: '#94a3b8',
                            fontSize: '0.78rem',
                            padding: '0.35rem 0.55rem',
                            cursor: 'pointer',
                        }}
                        title="Gesture Cheatsheet"
                    >
                        📋
                    </button>
                </div>
            </div>
        </div>
    );
}
