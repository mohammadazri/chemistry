import { useState } from 'react';
import { useExperimentStore } from '../../store/experimentStore';

export default function BuretteControls() {
    const addVolume = useExperimentStore((state) => state.addVolume);
    const resetExperiment = useExperimentStore((state) => state.resetExperiment);
    const isRunning = useExperimentStore((state) => state.isRunning);

    const [isOpen, setIsOpen] = useState(false);

    const handleAddVolume = (amount: number) => {
        if (!isRunning) return;
        addVolume(amount);
    };

    const toggleStopcock = () => {
        if (!isRunning) return;
        setIsOpen(!isOpen);
        // Note: The continuous flow logic is handled by useFrame in BuretteModel,
        // this toggle would conventionally link to standard state, but since the spec 
        // puts the isRunning state in BuretteModel local state we leave this button as a placeholder 
        // or lift state to Zustand if needed later. For now, it's illustrative.
    };

    const btnBase = "rounded font-bold text-white transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 flex items-center justify-center";
    const dropBtn = `${btnBase} bg-blue-600 hover:bg-blue-500`;
    const fastBtn = `${btnBase} bg-green-600 hover:bg-green-500`;

    return (
        <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3">
                {/* Dropwise Controls */}
                <button
                    onClick={() => handleAddVolume(0.01)}
                    disabled={!isRunning}
                    className={`${dropBtn} py-2 text-sm`}
                >
                    + 0.01 mL
                </button>
                <button
                    onClick={() => handleAddVolume(0.10)}
                    disabled={!isRunning}
                    className={`${dropBtn} py-3 text-base`}
                >
                    + 0.10 mL
                </button>

                {/* Fast Addition Controls */}
                <button
                    onClick={() => handleAddVolume(1.00)}
                    disabled={!isRunning}
                    className={`${fastBtn} py-3 text-lg col-span-1`}
                >
                    + 1.00 mL
                </button>
                <button
                    onClick={() => handleAddVolume(5.00)}
                    disabled={!isRunning}
                    className={`${fastBtn} py-4 text-xl col-span-1`}
                >
                    + 5.00 mL
                </button>
            </div>

            {/* Utilities */}
            <div className="flex gap-3 mt-2">
                <button
                    onClick={resetExperiment}
                    className="flex-1 bg-red-600 hover:bg-red-500 text-white font-bold py-2 rounded transition-colors"
                >
                    Reset
                </button>
                <button
                    onClick={toggleStopcock}
                    disabled={!isRunning}
                    className={`flex-1 font-bold py-2 rounded transition-colors text-white
            ${isOpen ? 'bg-yellow-600 hover:bg-yellow-500' : 'bg-gray-600 hover:bg-gray-500'}`}
                >
                    {isOpen ? 'Close Stopcock' : 'Open Stopcock'}
                </button>
            </div>
        </div>
    );
}
