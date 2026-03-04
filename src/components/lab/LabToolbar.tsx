import { useEffect, useState, useRef } from 'react';
import { Atom, BookOpen, RotateCcw, Play, Clock, LogOut, MessageSquare, Video, ChevronDown, Monitor, Beaker, Hand } from 'lucide-react';
import { useUiStore } from '../../store/uiStore';
import { useExperimentStore } from '../../store/experimentStore';
import { useUserStore } from '../../store/userStore';
import { useNavigate } from 'react-router-dom';
import { useExperiment } from '../../hooks/useExperiment';

export default function LabToolbar() {
    const { user, logout } = useUserStore();
    const navigate = useNavigate();

    const { showMolecular, toggleMolecular, toggleTutorial, showAssistant, toggleAssistant, resetCamera, activeCameraView, setActiveCameraView, arEnabled, setArEnabled } = useUiStore();
    const { currentStep, isRunning, startTime, setStartTime, resetExperiment } = useExperimentStore();
    const { startDemo, stopDemo } = useExperiment();

    const [elapsedTime, setElapsedTime] = useState('00:00');
    const [isCameraMenuOpen, setIsCameraMenuOpen] = useState(false);
    const cameraMenuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!startTime && isRunning) {
            setStartTime(Date.now());
        }

        const interval = setInterval(() => {
            if (startTime && isRunning) {
                const now = Date.now();
                const diff = Math.floor((now - startTime) / 1000);
                const minutes = Math.floor(diff / 60).toString().padStart(2, '0');
                const seconds = (diff % 60).toString().padStart(2, '0');
                setElapsedTime(`${minutes}:${seconds}`);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [startTime, isRunning, setStartTime]);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (cameraMenuRef.current && !cameraMenuRef.current.contains(event.target as Node)) {
                setIsCameraMenuOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <div className="h-auto md:h-14 w-full bg-card/95 backdrop-blur-md border-b border-border flex items-center justify-between px-4 sm:px-6 py-2 md:py-0 z-50 shrink-0 shadow-sm relative gap-2">

            {/* Live Lab badge — desktop only */}
            <div className="hidden md:flex pointer-events-auto items-center gap-2 px-3 py-1.5 bg-card/80 hover:bg-muted/80 backdrop-blur-md border border-border rounded-lg text-foreground shadow-sm dark:shadow-md shrink-0 transition-colors">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <span className="text-xs font-bold tracking-wider uppercase">Live Lab</span>
            </div>

            {/* Center: Action buttons */}
            <div className="pointer-events-auto flex-1 flex items-center gap-2 min-w-0 overflow-visible">
                <div className="overflow-x-auto no-scrollbar shrink min-w-0">
                    <div className="flex items-center gap-1.5 sm:gap-2 p-1.5 sm:p-2 bg-card/80 backdrop-blur-xl border border-border rounded-xl sm:rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-2xl w-max">
                        <button
                            onClick={toggleMolecular}
                            className={`interactable-btn flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium transition-all duration-300 ${showMolecular ? 'bg-primary shadow-[0_0_15px_rgba(79,70,229,0.4)] text-primary-foreground border border-primary/50' : 'bg-transparent border border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/80 hover:shadow-sm'}`}
                        >
                            <Atom className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${showMolecular ? 'animate-spin-slow' : ''}`} />
                            <span className="hidden sm:inline">Molecular</span>
                        </button>
                        <button
                            onClick={toggleAssistant}
                            className={`interactable-btn flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium transition-all duration-300 ${showAssistant ? 'bg-sky-600 shadow-[0_0_15px_rgba(14,165,233,0.4)] text-white border border-sky-500' : 'bg-transparent border border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/80 hover:shadow-sm'}`}
                        >
                            <MessageSquare className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            <span className="hidden sm:inline">Assistant</span>
                        </button>
                        <button
                            onClick={() => toggleTutorial()}
                            className="interactable-btn flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium bg-transparent border border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/80 hover:shadow-sm transition-all duration-200"
                        >
                            <BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            <span className="hidden sm:inline">Tutorial</span>
                        </button>
                        <button
                            onClick={() => {
                                stopDemo();
                                resetExperiment();
                                setElapsedTime('00:00');
                            }}
                            className="interactable-btn flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium bg-transparent border border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/80 hover:shadow-sm transition-all duration-200 group"
                        >
                            <RotateCcw className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:-rotate-180 transition-transform duration-500" />
                            <span className="hidden sm:inline">Reset</span>
                        </button>
                        <button
                            onClick={startDemo}
                            className="interactable-btn flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm font-bold bg-primary/10 border border-primary/20 text-primary hover:text-primary-foreground hover:bg-primary hover:shadow-sm dark:hover:shadow-[0_0_20px_rgba(168,85,247,0.3)] transition-all duration-200"
                        >
                            <Play className="fill-current w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            <span className="hidden sm:inline">Auto-Demo</span>
                        </button>
                        <button
                            onClick={() => setArEnabled(!arEnabled)}
                            className={`interactable-btn flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm font-bold border transition-all duration-200 ${arEnabled ? 'bg-indigo-600/20 text-indigo-500 border-indigo-500/50 shadow-[0_0_15px_rgba(99,102,241,0.2)]' : 'bg-transparent text-muted-foreground border-transparent hover:text-foreground hover:bg-muted/80 hover:shadow-sm'}`}
                        >
                            <Hand className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            <span className="hidden sm:inline">AR Control</span>
                        </button>
                    </div>
                </div>

                {/* Camera Dropdown */}
                <div className="relative shrink-0 flex items-center p-1.5 sm:p-2 bg-card/80 backdrop-blur-xl border border-border rounded-xl sm:rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-2xl" ref={cameraMenuRef}>
                    <button
                        onClick={() => setIsCameraMenuOpen(!isCameraMenuOpen)}
                        className={`interactable-btn flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 ${isCameraMenuOpen ? 'bg-muted/80 text-foreground shadow-sm' : 'bg-transparent border border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/80 hover:shadow-sm'}`}
                        title="Camera Views"
                    >
                        <Video className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        <span className="hidden sm:inline">Camera</span>
                        <ChevronDown className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform ${isCameraMenuOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {isCameraMenuOpen && (
                        <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 sm:left-auto sm:-translate-x-0 sm:right-0 w-48 bg-card/95 backdrop-blur-xl border border-border shadow-lg rounded-xl overflow-hidden flex flex-col z-[100] animate-in fade-in zoom-in duration-200">
                            <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border/50">
                                Camera Views
                            </div>
                            <button
                                onClick={() => { resetCamera(); setIsCameraMenuOpen(false); }}
                                className={`interactable-btn flex items-center gap-2 px-3 py-2.5 text-sm hover:bg-muted/80 transition-colors ${activeCameraView === 'auto' ? 'text-primary bg-primary/5' : 'text-foreground'}`}
                            >
                                <RotateCcw className="w-4 h-4" />
                                <span>Reset View</span>
                            </button>
                            <button
                                onClick={() => { setActiveCameraView('periodic_table'); setIsCameraMenuOpen(false); }}
                                className={`interactable-btn flex items-center gap-2 px-3 py-2.5 text-sm hover:bg-muted/80 transition-colors border-t border-border/50 ${activeCameraView === 'periodic_table' ? 'text-primary bg-primary/5' : 'text-foreground'}`}
                            >
                                <Monitor className="w-4 h-4" />
                                <span>Periodic Table</span>
                            </button>
                            <button
                                onClick={() => { setActiveCameraView('emergency_shower'); setIsCameraMenuOpen(false); }}
                                className={`interactable-btn flex items-center gap-2 px-3 py-2.5 text-sm hover:bg-muted/80 transition-colors ${activeCameraView === 'emergency_shower' ? 'text-primary bg-primary/5' : 'text-foreground'}`}
                            >
                                <Video className="w-4 h-4" />
                                <span>Emergency Shower</span>
                            </button>
                            <button
                                onClick={() => { setActiveCameraView('safety_first'); setIsCameraMenuOpen(false); }}
                                className={`interactable-btn flex items-center gap-2 px-3 py-2.5 text-sm hover:bg-muted/80 transition-colors ${activeCameraView === 'safety_first' ? 'text-primary bg-primary/5' : 'text-foreground'}`}
                            >
                                <Beaker className="w-4 h-4" />
                                <span>Safety First</span>
                            </button>
                            <button
                                onClick={() => { setActiveCameraView('side_desk'); setIsCameraMenuOpen(false); }}
                                className={`interactable-btn flex items-center gap-2 px-3 py-2.5 text-sm hover:bg-muted/80 transition-colors ${activeCameraView === 'side_desk' ? 'text-primary bg-primary/5' : 'text-foreground'}`}
                            >
                                <Beaker className="w-4 h-4" />
                                <span>Side Table</span>
                            </button>
                            <button
                                onClick={() => { setActiveCameraView('wall_clock'); setIsCameraMenuOpen(false); }}
                                className={`interactable-btn flex items-center gap-2 px-3 py-2.5 text-sm hover:bg-muted/80 transition-colors ${activeCameraView === 'wall_clock' ? 'text-primary bg-primary/5' : 'text-foreground'}`}
                            >
                                <Clock className="w-4 h-4" />
                                <span>Wall Clock</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Step counter — pinned right on mobile */}
            <div className="md:hidden pointer-events-auto bg-muted border border-border text-foreground px-2.5 py-1.5 rounded-lg text-[10px] font-bold shrink-0">
                STEP {currentStep + 1}/5
            </div>

            {/* Desktop User & Stats (Hidden on mobile) */}
            <div className="hidden md:flex pointer-events-auto flex-col items-end gap-2 shrink-0">
                <div className="flex items-center gap-4 bg-card/80 backdrop-blur-xl p-2 rounded-2xl border border-border shadow-sm dark:shadow-2xl">
                    <div className="flex items-center gap-2 bg-muted px-3 py-1.5 rounded-xl border border-border hover:bg-muted/80 transition-colors">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <div className="font-mono text-foreground text-sm w-12 text-center font-bold">
                            {elapsedTime}
                        </div>
                    </div>
                    <div className="bg-muted hover:bg-muted/80 border border-border text-foreground px-3 py-1.5 rounded-xl text-xs font-bold shadow-sm dark:shadow-lg transition-colors">
                        STEP {currentStep + 1}/5
                    </div>
                    <div className="w-[1px] h-6 bg-border mx-1" />
                    <button
                        onClick={handleLogout}
                        className="interactable-btn flex items-center gap-2 text-muted-foreground hover:text-destructive text-sm transition-colors group px-2 py-1.5 rounded-lg hover:bg-destructive/10"
                    >
                        <span className="font-medium hidden xl:inline-block truncate max-w-[100px] group-hover:text-destructive">
                            {user?.name || 'Student'}
                        </span>
                        <LogOut className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}
