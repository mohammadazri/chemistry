import { useEffect, useState } from 'react';
import LabScene from '../components/lab/LabScene';
import RightSidebar from '../components/panels/RightSidebar';
import TutorialOverlay from '../components/tutorial/TutorialOverlay';
import QuizModal from '../components/tutorial/QuizModal';
import ResultsModal from '../components/results/ResultsModal';
import { useUiStore } from '../store/uiStore';
import { useExperimentStore } from '../store/experimentStore';
import { useUserStore } from '../store/userStore';
import { useNavigate } from 'react-router-dom';
import { useExperiment } from '../hooks/useExperiment';
import { Atom, BookOpen, RotateCcw, Play, Clock, LogOut } from 'lucide-react';
import LabAssistant from '../components/lab/LabAssistant';

export default function LabPage() {
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
        <div className="flex flex-col flex-1 w-full overflow-hidden bg-[#050810] relative">
            {/* Lab Control Toolbar */}
            <div className="h-14 w-full bg-[#0a0f1a]/95 backdrop-blur-md border-b border-indigo-500/10 flex items-center justify-between px-4 sm:px-6 z-10 shrink-0 shadow-lg relative">
                <div className="flex items-center gap-2 sm:gap-4">
                    <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-lg text-indigo-300">
                        <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
                        <span className="text-xs font-bold tracking-wider uppercase">Live Lab</span>
                    </div>
                </div>

                <div className="flex items-center gap-2 sm:gap-4 overflow-x-auto no-scrollbar">
                    <button
                        onClick={toggleMolecular}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-300 ${showMolecular ? 'bg-indigo-600 shadow-[0_0_15px_rgba(79,70,229,0.4)] text-white border border-indigo-500' : 'bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10'}`}
                    >
                        <Atom className={`w-4 h-4 ${showMolecular ? 'animate-spin-slow' : ''}`} />
                        <span className="hidden sm:inline">Molecular</span>
                    </button>
                    <button
                        onClick={() => toggleTutorial()}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-all duration-200"
                    >
                        <BookOpen className="w-4 h-4" />
                        <span className="hidden sm:inline">Tutorial</span>
                    </button>
                    <button
                        onClick={() => {
                            stopDemo();
                            resetExperiment();
                            setElapsedTime('00:00');
                        }}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-all duration-200 group"
                    >
                        <RotateCcw className="w-4 h-4 group-hover:-rotate-180 transition-transform duration-500" />
                        <span className="hidden sm:inline">Reset</span>
                    </button>
                    <button
                        onClick={startDemo}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium bg-purple-500/10 border border-purple-500/20 text-purple-400 hover:text-purple-300 hover:bg-purple-500/20 transition-all duration-200 hover:shadow-[0_0_15px_rgba(168,85,247,0.2)]"
                    >
                        <Play className="w-4 h-4" />
                        <span className="hidden sm:inline">Auto-Demo</span>
                    </button>
                </div>

                <div className="flex items-center gap-4 sm:gap-6 shrink-0">
                    <div className="hidden md:flex items-center gap-2 bg-white/5 px-3 py-1 rounded-lg border border-white/10">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <div className="font-mono text-gray-300 text-sm w-12 text-center font-bold">
                            {elapsedTime}
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-3 py-1 rounded-lg text-xs font-bold shadow-lg">
                            STEP {currentStep + 1}/5
                        </div>
                    </div>
                    <div className="hidden lg:flex items-center gap-3 border-l border-white/10 pl-4">
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 text-gray-500 hover:text-red-400 text-sm transition-colors group px-2 py-1 rounded-md hover:bg-red-500/10"
                        >
                            <span className="font-medium hidden xl:inline-block truncate max-w-[100px] text-gray-400 group-hover:text-red-400">
                                {user?.name || 'Student'}
                            </span>
                            <LogOut className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            <TutorialOverlay />
            <QuizModal />
            <ResultsModal />

            <div className="flex flex-col lg:flex-row flex-1 overflow-hidden relative w-full h-full bg-[#050810]">
                {/* 3D Scene */}
                <div className="flex-[2] lg:flex-[3] min-h-[50vh] lg:min-h-0 relative w-full h-full">
                    <LabAssistant />
                    <LabScene />
                </div>

                {/* Sidebar Controls */}
                <RightSidebar />
            </div>
        </div>
    );
}
