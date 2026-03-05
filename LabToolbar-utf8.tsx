import { useEffect, useState } from 'react';
import { Atom, BookOpen, RotateCcw, Play, Clock, LogOut, MessageSquare } from 'lucide-react';
import { useUiStore } from '../../store/uiStore';
import { useExperimentStore } from '../../store/experimentStore';
import { useUserStore } from '../../store/userStore';
import { useNavigate } from 'react-router-dom';
import { useExperiment } from '../../hooks/useExperiment';

export default function LabToolbar() {
    const { user, logout } = useUserStore();
    const navigate = useNavigate();

    const { showMolecular, toggleMolecular, toggleTutorial, showAssistant, toggleAssistant } = useUiStore();
    const { currentStep, isRunning, startTime, setStartTime, resetExperiment } = useExperimentStore();
    const { startDemo, stopDemo } = useExperiment();

    const [elapsedTime, setElapsedTime] = useState('00:00');

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

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <div className="h-auto md:h-14 w-full bg-card/95 backdrop-blur-md border-b border-border flex items-center justify-between px-4 sm:px-6 py-2 md:py-0 z-10 shrink-0 shadow-sm relative gap-2">

            {/* Live Lab badge — desktop only */}
            <div className="hidden md:flex pointer-events-auto items-center gap-2 px-3 py-1.5 bg-card/80 hover:bg-muted/80 backdrop-blur-md border border-border rounded-lg text-foreground shadow-sm dark:shadow-md shrink-0 transition-colors">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <span className="text-xs font-bold tracking-wider uppercase">Live Lab</span>
            </div>

            {/* Center: Action buttons — scrollable on mobile */}
            <div className="pointer-events-auto flex-1 overflow-x-auto no-scrollbar min-w-0">
                <div className="flex items-center gap-1.5 sm:gap-2 p-1.5 sm:p-2 bg-card/80 backdrop-blur-xl border border-border rounded-xl sm:rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-2xl w-max">
                    <button
                        onClick={toggleMolecular}
                        className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium transition-all duration-300 ${showMolecular ? 'bg-primary shadow-[0_0_15px_rgba(79,70,229,0.4)] text-primary-foreground border border-primary/50' : 'bg-transparent border border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/80 hover:shadow-sm'}`}
                    >
                        <Atom className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${showMolecular ? 'animate-spin-slow' : ''}`} />
                        <span className="hidden sm:inline">Molecular</span>
                    </button>
                    <button
                        onClick={toggleAssistant}
                        className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium transition-all duration-300 ${showAssistant ? 'bg-sky-600 shadow-[0_0_15px_rgba(14,165,233,0.4)] text-white border border-sky-500' : 'bg-transparent border border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/80 hover:shadow-sm'}`}
                    >
                        <MessageSquare className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        <span className="hidden sm:inline">Assistant</span>
                    </button>
                    <button
                        onClick={() => toggleTutorial()}
                        className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium bg-transparent border border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/80 hover:shadow-sm transition-all duration-200"
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
                        className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium bg-transparent border border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/80 hover:shadow-sm transition-all duration-200 group"
                    >
                        <RotateCcw className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:-rotate-180 transition-transform duration-500" />
                        <span className="hidden sm:inline">Reset</span>
                    </button>
                    <button
                        onClick={startDemo}
                        className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm font-bold bg-primary/10 border border-primary/20 text-primary hover:text-primary-foreground hover:bg-primary hover:shadow-sm dark:hover:shadow-[0_0_20px_rgba(168,85,247,0.3)] transition-all duration-200"
                    >
                        <Play className="fill-current w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        <span className="hidden sm:inline">Auto-Demo</span>
                    </button>

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
                        className="flex items-center gap-2 text-muted-foreground hover:text-destructive text-sm transition-colors group px-2 py-1.5 rounded-lg hover:bg-destructive/10"
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
