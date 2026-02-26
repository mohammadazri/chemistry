import { useEffect, useState } from 'react';
import { Atom, BookOpen, RotateCcw, Play, Clock, LogOut } from 'lucide-react';
import { useUiStore } from '../../store/uiStore';
import { useExperimentStore } from '../../store/experimentStore';
import { useUserStore } from '../../store/userStore';
import { useNavigate } from 'react-router-dom';
import { useExperiment } from '../../hooks/useExperiment';

export default function LabToolbar() {
    const { user, logout } = useUserStore();
    const navigate = useNavigate();

    const { showMolecular, toggleMolecular, toggleTutorial } = useUiStore();
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
        <div className="absolute top-2 left-2 right-2 sm:top-4 sm:left-4 sm:right-4 flex flex-col md:flex-row items-start md:items-center justify-between z-10 pointer-events-none gap-2">

            {/* Top row for mobile (Status + User Stats) */}
            <div className="w-full md:w-auto flex justify-between items-center gap-2">
                {/* Status badge */}
                <div className="pointer-events-auto flex items-center gap-2 px-2 py-1.5 sm:px-3 sm:py-1.5 bg-indigo-500/10 backdrop-blur-md border border-indigo-500/20 rounded-lg text-indigo-300 shadow-lg shrink-0">
                    <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
                    <span className="text-[10px] sm:text-xs font-bold tracking-wider uppercase">Live Lab</span>
                </div>

                {/* Mobile User & Stats (Visible only on mobile) */}
                <div className="md:hidden pointer-events-auto flex flex-col items-end gap-2 shrink-0">
                    <div className="flex items-center gap-2 bg-[#0a0f1a]/80 backdrop-blur-lg p-1.5 rounded-lg border border-indigo-500/20 shadow-2xl">
                        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-2 py-1 rounded text-[10px] font-bold shadow-lg">
                            STEP {currentStep + 1}/5
                        </div>
                    </div>
                </div>
            </div>

            {/* Center: Main Controls (Scrollable on small screens) */}
            <div className="pointer-events-auto w-full md:w-auto overflow-x-auto no-scrollbar pb-1 md:pb-0">
                <div className="flex items-center gap-1.5 sm:gap-2 p-1.5 sm:p-2 bg-[#0a0f1a]/80 backdrop-blur-lg border border-indigo-500/20 rounded-xl sm:rounded-2xl shadow-2xl w-max md:w-auto">
                    <button
                        onClick={toggleMolecular}
                        className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium transition-all duration-300 ${showMolecular ? 'bg-indigo-600 shadow-[0_0_15px_rgba(79,70,229,0.4)] text-white border border-indigo-500' : 'bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10'}`}
                    >
                        <Atom className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${showMolecular ? 'animate-spin-slow' : ''}`} />
                        <span className="hidden sm:inline">Molecular</span>
                    </button>
                    <button
                        onClick={() => toggleTutorial()}
                        className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-all duration-200"
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
                        className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-all duration-200 group"
                    >
                        <RotateCcw className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:-rotate-180 transition-transform duration-500" />
                        <span className="hidden sm:inline">Reset</span>
                    </button>
                    <button
                        onClick={startDemo}
                        className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm font-bold bg-purple-500/20 border border-purple-500/30 text-purple-300 hover:text-purple-200 hover:bg-purple-500/30 transition-all duration-200 hover:shadow-[0_0_20px_rgba(168,85,247,0.3)]"
                    >
                        <Play className="fill-current w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        <span className="hidden sm:inline">Auto-Demo</span>
                    </button>
                </div>
            </div>

            {/* Desktop User & Stats (Hidden on mobile) */}
            <div className="hidden md:flex pointer-events-auto flex-col items-end gap-2 shrink-0">
                <div className="flex items-center gap-4 bg-[#0a0f1a]/80 backdrop-blur-lg p-2 rounded-2xl border border-indigo-500/20 shadow-2xl">
                    <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-xl border border-white/10">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <div className="font-mono text-gray-300 text-sm w-12 text-center font-bold">
                            {elapsedTime}
                        </div>
                    </div>
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-3 py-1.5 rounded-xl text-xs font-bold shadow-lg">
                        STEP {currentStep + 1}/5
                    </div>
                    <div className="w-[1px] h-6 bg-white/10 mx-1" />
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 text-gray-500 hover:text-red-400 text-sm transition-colors group px-2 py-1.5 rounded-lg hover:bg-red-500/10"
                    >
                        <span className="font-medium hidden xl:inline-block truncate max-w-[100px] text-gray-400 group-hover:text-red-400">
                            {user?.name || 'Student'}
                        </span>
                        <LogOut className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}
