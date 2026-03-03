import { useState, useEffect } from 'react';
import { useExperimentStore } from '../../store/experimentStore';
import { useUiStore } from '../../store/uiStore';
import { RefreshCcw, Power, CheckCircle2, Plus, Minus } from 'lucide-react';

interface NumericInputProps {
    label: string;
    value: number;
    onChange: (val: number) => void;
    step: number;
    min: number;
    max: number;
    unit: string;
}

function NumericConfigInput({ label, value, onChange, step, min, max, unit }: NumericInputProps) {
    const [tempValue, setTempValue] = useState(value.toString());

    // Sync with external store changes (like Reset)
    useEffect(() => {
        setTempValue(value.toString());
    }, [value]);

    const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setTempValue(val);
        const parsed = parseFloat(val);
        if (!isNaN(parsed)) {
            onChange(parsed);
        }
    };

    const handleBlur = () => {
        let parsed = parseFloat(tempValue);
        if (isNaN(parsed)) parsed = min;
        const clamped = Math.max(min, Math.min(max, parsed));
        onChange(clamped);
        setTempValue(clamped.toString());
    };

    const adjust = (delta: number) => {
        const newValue = Math.max(min, Math.min(max, value + delta));
        // Use toFixed to eliminate floating point garbage while keeping necessary precision
        const fixedValue = parseFloat(newValue.toFixed(8));
        onChange(fixedValue);
        setTempValue(fixedValue.toString());
    };

    return (
        <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{label}</label>
            <div className="relative flex items-center gap-2">
                <button
                    onClick={() => adjust(-step)}
                    className="p-2 rounded-lg bg-muted hover:bg-muted/80 text-muted-foreground transition-colors border border-border"
                >
                    <Minus className="w-4 h-4" />
                </button>
                <div className="relative flex-1">
                    <input
                        type="text"
                        inputMode="decimal"
                        value={tempValue}
                        onChange={handleTextChange}
                        onBlur={handleBlur}
                        className="w-full bg-background border border-border rounded-lg px-3 pr-10 py-2 text-sm font-mono text-foreground focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-shadow"
                    />
                    <span className="absolute right-3 top-2 text-sm text-muted-foreground font-medium pointer-events-none">{unit}</span>
                </div>
                <button
                    onClick={() => adjust(step)}
                    className="p-2 rounded-lg bg-muted hover:bg-muted/80 text-muted-foreground transition-colors border border-border"
                >
                    <Plus className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}

export default function BuretteControls() {
    const addVolume = useExperimentStore((state) => state.addVolume);
    const resetExperiment = useExperimentStore((state) => state.resetExperiment);
    const isRunning = useExperimentStore((state) => state.isRunning);
    const labStage = useExperimentStore((state) => state.labStage);
    const isStopcockOpen = useExperimentStore((state) => state.isStopcockOpen);
    const setStopcockOpen = useExperimentStore((state) => state.setStopcockOpen);
    const setLabStage = useExperimentStore((state) => state.setLabStage);
    const volumeAdded = useExperimentStore((state) => state.volumeAdded);
    const toggleResults = useUiStore((state) => state.toggleResults);

    // Dynamic config
    const hclConcentration = useExperimentStore((state) => state.hclConcentration);
    const naohConcentration = useExperimentStore((state) => state.naohConcentration);
    const flaskVolume = useExperimentStore((state) => state.flaskVolume);
    const buretteVolume = useExperimentStore((state) => state.buretteVolume);
    const setHclConcentration = useExperimentStore((state) => state.setHclConcentration);
    const setNaohConcentration = useExperimentStore((state) => state.setNaohConcentration);
    const setFlaskVolume = useExperimentStore((state) => state.setFlaskVolume);
    const setBuretteVolume = useExperimentStore((state) => state.setBuretteVolume);
    const restoreDefaults = useExperimentStore((state) => state.restoreDefaults);

    const canTitrate = labStage === 'titrate' && isRunning;

    const handleAddVolume = (amount: number) => {
        if (!canTitrate) return;
        addVolume(amount);
    };

    const toggleStopcock = () => {
        if (!canTitrate) return;
        setStopcockOpen(!isStopcockOpen);
    };

    const dropBtn = "relative overflow-hidden rounded-xl font-bold text-white transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed group bg-gradient-to-br from-blue-500 to-indigo-600 shadow-md hover:shadow-blue-500/20";
    const fastBtn = "relative overflow-hidden rounded-xl font-bold text-white transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed group bg-gradient-to-br from-indigo-500 to-purple-600 shadow-md hover:shadow-indigo-500/20";

    if (labStage === 'setup') {
        return (
            <div className="flex flex-col gap-4 py-2">
                <div className="text-sm font-bold text-indigo-400 mb-1 border-b border-indigo-500/20 pb-2">Initial Configuration</div>

                <NumericConfigInput
                    label="NaOH Concentration (Burette)"
                    value={naohConcentration}
                    onChange={setNaohConcentration}
                    step={0.01}
                    min={0.01}
                    max={2.0}
                    unit="M"
                />

                <NumericConfigInput
                    label="NaOH Volume (Burette)"
                    value={buretteVolume}
                    onChange={setBuretteVolume}
                    step={5}
                    min={5}
                    max={50}
                    unit="mL"
                />

                <NumericConfigInput
                    label="HCl Concentration (Flask)"
                    value={hclConcentration}
                    onChange={setHclConcentration}
                    step={0.01}
                    min={0.01}
                    max={2.0}
                    unit="M"
                />

                <NumericConfigInput
                    label="HCl Volume (Flask)"
                    value={flaskVolume}
                    onChange={setFlaskVolume}
                    step={5}
                    min={5}
                    max={100}
                    unit="mL"
                />

                <button
                    onClick={restoreDefaults}
                    className="flex items-center justify-center gap-2 mt-2 text-indigo-400 hover:text-indigo-300 text-xs font-medium px-3 py-2 rounded-lg border border-indigo-500/20 hover:bg-indigo-500/10 transition-all"
                >
                    <RefreshCcw className="w-3.5 h-3.5" /> Restore Defaults
                </button>
            </div>
        );
    }

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
            <div className="flex flex-col gap-3">
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
                    ${isStopcockOpen
                                ? 'bg-amber-500/20 border border-amber-500/40 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                                : 'bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 hover:border-white/20'}`}
                    >
                        <Power className={`w-4 h-4 ${isStopcockOpen ? 'animate-pulse' : ''}`} />
                        {isStopcockOpen ? 'Close Flow' : 'Continuous Flow'}
                    </button>
                </div>

                <button
                    onClick={() => {
                        setStopcockOpen(false);
                        setLabStage('done');
                        toggleResults();
                    }}
                    disabled={volumeAdded < 0.1}
                    className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-indigo-500/20 mt-1"
                >
                    <CheckCircle2 className="w-5 h-5" />
                    Finish & Analyze Results
                </button>
            </div>
        </div>
    );
}
