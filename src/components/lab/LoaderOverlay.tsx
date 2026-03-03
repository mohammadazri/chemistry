import { useProgress } from '@react-three/drei';
import { Atom } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function LoaderOverlay({ isWebGLReady }: { isWebGLReady?: boolean }) {
    const { progress, item, loaded, total, active } = useProgress();
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        // True dynamic loading: The network has completed downloading assets (progress=100)
        // AND the Three.js WebGL compiler has finished blocking the main thread and painted a real frame
        if (!active && progress === 100 && isWebGLReady) {
            setIsVisible(false);
        } else {
            setIsVisible(true);
        }
    }, [active, progress, isWebGLReady]);

    if (!isVisible) return null;

    return (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-background pointer-events-auto select-none">
            <div className="flex flex-col items-center justify-center w-[300px] h-[300px] bg-card/50 backdrop-blur-3xl border border-indigo-500/30 rounded-3xl shadow-[0_0_50px_rgba(79,70,229,0.3)] relative overflow-hidden">
                {/* Glowing Background Rings */}
                <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/10 to-transparent opacity-50"></div>

                {/* Spinner & Icon */}
                <div className="relative flex items-center justify-center mb-6">
                    <div className="absolute w-24 h-24 rounded-full border-t-2 border-indigo-400 border-r-2 border-transparent animate-spin"></div>
                    <div className="absolute w-20 h-20 rounded-full border-b-2 border-cyan-400 border-l-2 border-transparent animate-spin-slow" style={{ animationDirection: 'reverse' }}></div>
                    <div className="w-16 h-16 rounded-full bg-indigo-500/20 flex items-center justify-center shadow-[0_0_20px_rgba(99,102,241,0.5)]">
                        <Atom className="w-8 h-8 text-indigo-400 animate-pulse" />
                    </div>
                </div>

                {/* Progress Text */}
                <div className="text-center z-10 w-full px-8">
                    <h2 className="text-lg font-bold text-foreground tracking-wider mb-2">HoloLab OS</h2>
                    <p className="text-xs text-indigo-600 dark:text-indigo-300 font-medium uppercase tracking-[0.2em] mb-4 h-4 overflow-hidden truncate">
                        {item ? `Loading: ${item.split('/').pop()}` : 'Initializing Environment...'}
                    </p>

                    {/* Progress Bar */}
                    <div className="w-full bg-muted rounded-full h-1.5 mb-2 overflow-hidden border border-border">
                        <div
                            className="bg-indigo-500 h-1.5 rounded-full transition-all duration-300 relative"
                            style={{ width: `${progress}%` }}
                        >
                            <div className="absolute inset-0 bg-current/30 animate-pulse"></div>
                        </div>
                    </div>

                    {/* Metrics */}
                    <div className="flex justify-between items-center text-[10px] text-muted-foreground font-mono">
                        <span>{Math.round(progress)}%</span>
                        <span>{loaded} / {total} Assets</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
