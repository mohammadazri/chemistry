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

export default function LabPage() {
    const { user, logout } = useUserStore();
    const navigate = useNavigate();

    const { showMolecular, toggleMolecular, toggleTutorial } = useUiStore();
    const { currentStep, isRunning, startTime, setStartTime, resetExperiment } = useExperimentStore();

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
        <div className="flex flex-col w-full h-screen overflow-hidden bg-[#0a0f1a]">
            {/* Top Navigation Bar */}
            <nav className="h-14 w-full bg-gray-900 border-b border-gray-800 flex items-center justify-between px-6 z-10 shrink-0">
                <div className="flex items-center gap-4">
                    <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400">
                        HoloLab
                    </span>
                    <span className="text-gray-500 font-medium">| Acid-Base Titration</span>
                </div>

                <div className="flex items-center gap-4">
                    <button
                        onClick={toggleMolecular}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm border font-medium transition-colors ${showMolecular ? 'bg-indigo-900/40 text-indigo-300 border-indigo-700/50' : 'bg-gray-800 border-gray-700 text-gray-400 hover:text-white hover:bg-gray-700'}`}
                    >
                        <span>⚛</span> Molecular View
                    </button>
                    <button
                        onClick={() => toggleTutorial()}
                        className="px-3 py-1.5 rounded-md text-sm bg-gray-800 border border-gray-700 text-gray-400 hover:text-white hover:bg-gray-700 font-medium transition-colors"
                    >
                        Tutorial
                    </button>
                    <button
                        onClick={() => {
                            resetExperiment();
                            setElapsedTime('00:00');
                        }}
                        className="px-3 py-1.5 rounded-md text-sm bg-gray-800 border border-gray-700 text-gray-400 hover:text-white hover:bg-gray-700 font-medium transition-colors"
                    >
                        Reset Lab
                    </button>
                </div>

                <div className="flex items-center gap-6">
                    <div className="bg-blue-900/30 text-blue-400 px-3 py-1 rounded text-sm font-bold border border-blue-800/50">
                        Step {currentStep + 1}/5
                    </div>
                    <div className="font-mono text-gray-300 text-lg w-16 text-right">
                        {elapsedTime}
                    </div>
                    <div className="flex items-center gap-3 border-l border-gray-700 pl-4 ml-2">
                        <span className="text-gray-400 text-sm hidden sm:inline-block truncate max-w-[120px]">
                            {user?.name || 'Student'}
                        </span>
                        <button
                            onClick={handleLogout}
                            className="text-gray-500 hover:text-white text-sm transition-colors"
                        >
                            Exit
                        </button>
                    </div>
                </div>
            </nav>

            <TutorialOverlay />
            <QuizModal />
            <ResultsModal />

            <div className="flex flex-1 overflow-hidden relative">
                <LabScene />
                <RightSidebar />
            </div>
        </div>
    );
}
