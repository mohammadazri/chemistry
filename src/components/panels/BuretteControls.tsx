import { useState } from 'react';
import { useExperimentStore } from '../../store/experimentStore';
import { RefreshCcw, Power } from 'lucide-react';

export default function BuretteControls() {
    const addVolume = useExperimentStore((state) => state.addVolume);
    const resetExperiment = useExperimentStore((state) => state.resetExperiment);
    const isRunning = useExperimentStore((state) => state.isRunning);
    const labStage = useExperimentStore((state) => state.labStage);
    const canTitrate = labStage === 'titrate' && isRunning;

    const [isOpen, setIsOpen] = useState(false);

    const handleAddVolume = (amount: number) => {
        if (!canTitrate) return;
        addVolume(amount);
    };

    const toggleStopcock = () => {
        if (!canTitrate) return;
        setIsOpen(!isOpen);
    };

    const dropBtn = "relative overflow-hidden rounded-xl font-bold text-white transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed group bg-gradient-to-br from-blue-500 to-indigo-600 shadow-md hover:shadow-blue-500/20";
    const fastBtn = "relative overflow-hidden rounded-xl font-bold text-white transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed group bg-gradient-to-br from-indigo-500 to-purple-600 shadow-md hover:shadow-indigo-500/20";

    if (labStage !== 'titrate') {
        return (
            <div className="flex flex-col items-center justify-center gap-2 py-4 text-gray-500">
                <Power className="w-5 h-5 opacity-40" />
                <p className="text-xs font-medium text-center max-w-[180px]">
                    Controls unlock after filling burette &amp; flask
                </p>
                <button
                    onClick={resetExperiment}
                    className="flex items-center gap-2 mt-2 text-red-400/70 hover:text-red-400 text-xs font-medium px-3 py-1.5 rounded-lg border border-red-500/20 hover:bg-red-500/10 transition-all"
                >
                    <RefreshCcw className="w-3.5 h-3.5" /> Reset
                </button>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3">
                {/* Dropwise Controls */}
                <button
                    onClick={() => handleAddVolume(0.01)}
                    disabled={!canTitrate}
                    className={`${dropBtn} py-3 text-sm`}
                >
                    <div className="absolute inset-0 bg-white/20 group-hover:bg-transparent transition-colors" />
                    <span className="relative z-10 drop-shadow-md">+ 0.01 mL</span>
                </button>
                <button
                    onClick={() => handleAddVolume(0.10)}
                    disabled={!canTitrate}
                    className={`${dropBtn} py-3 text-base`}
                >
                    <div className="absolute inset-0 bg-white/20 group-hover:bg-transparent transition-colors" />
                    <span className="relative z-10 drop-shadow-md">+ 0.10 mL</span>
                </button>

                {/* Fast Addition Controls */}
                <button
                    onClick={() => handleAddVolume(1.00)}
                    disabled={!canTitrate}
                    className={`${fastBtn} py-4 text-lg col-span-1`}
                >
                    <div className="absolute inset-0 bg-white/20 group-hover:bg-transparent transition-colors" />
                    <span className="relative z-10 drop-shadow-md">+ 1.00 mL</span>
                </button>
                <button
                    onClick={() => handleAddVolume(5.00)}
                    disabled={!canTitrate}
                    className={`${fastBtn} py-4 text-xl col-span-1`}
                >
                    <div className="absolute inset-0 bg-white/20 group-hover:bg-transparent transition-colors" />
                    <span className="relative z-10 drop-shadow-md">+ 5.00 mL</span>
                </button>
            </div>

            {/* Utilities */}
            <div className="flex gap-3">
                <button
                    onClick={resetExperiment}
                    className="flex items-center justify-center gap-2 flex-1 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 hover:border-red-500/40 text-red-400 font-bold py-3 rounded-xl transition-all"
                >
                    <RefreshCcw className="w-4 h-4" />
                    Reset
                </button>
                <button
                    onClick={toggleStopcock}
                    disabled={!canTitrate}
                    className={`flex items-center justify-center gap-2 flex-1 font-bold py-3 rounded-xl transition-all disabled:opacity-50
            ${isOpen
                            ? 'bg-amber-500/20 border border-amber-500/40 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                            : 'bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 hover:border-white/20'}`}
                >
                    <Power className={`w-4 h-4 ${isOpen ? 'animate-pulse' : ''}`} />
                    {isOpen ? 'Close Flow' : 'Continuous Flow'}
                </button>
            </div>
        </div>
    );
}
