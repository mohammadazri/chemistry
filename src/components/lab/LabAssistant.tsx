import { useExperimentStore } from '../../store/experimentStore';
import { useUiStore } from '../../store/uiStore';
import { Beaker, FlaskConical, Droplets, BarChart2, CheckCircle2, ChevronRight, ChevronDown, GripHorizontal, Maximize2 } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';

const STAGE_ORDER = { setup: 0, 'fill-burette': 1, 'fill-flask': 2, titrate: 3, done: 4 };

export default function LabAssistant() {
    const labStage = useExperimentStore((s) => s.labStage);
    const setLabStage = useExperimentStore((s) => s.setLabStage);
    const showAssistant = useUiStore((s) => s.showAssistant);

    // Pull dynamic values to show in the steps
    const hclConcentration = useExperimentStore((s) => s.hclConcentration);
    const naohConcentration = useExperimentStore((s) => s.naohConcentration);
    const flaskVolume = useExperimentStore((s) => s.flaskVolume);
    const buretteVolume = useExperimentStore((s) => s.buretteVolume);

    const STEPS = [
        {
            stage: 'setup' as const,
            title: 'Initial Setup',
            icon: Beaker,
            desc: 'The apparatus is ready. We will start by filling the burette with NaOH.',
            action: 'Fill Burette',
            nextStage: 'fill-burette' as const,
            color: 'sky',
        },
        {
            stage: 'fill-burette' as const,
            title: 'Filling Burette',
            icon: FlaskConical,
            desc: `Adding ${buretteVolume}mL of ${naohConcentration}M NaOH solution into the burette. Please wait...`,
            action: null,
            nextStage: 'fill-flask' as const,
            color: 'blue',
        },
        {
            stage: 'fill-flask' as const,
            title: 'Preparing Flask',
            icon: FlaskConical,
            desc: `Pouring ${flaskVolume}mL of ${hclConcentration}M HCl and phenolphthalein indicator into the flask.`,
            action: null,
            nextStage: 'titrate' as const,
            color: 'cyan',
        },
        {
            stage: 'titrate' as const,
            title: 'Titration',
            icon: Droplets,
            desc: 'Open the stopcock to add NaOH dropwise. Watch the pH and colour change carefully. Stop at the pale pink endpoint.',
            action: null,
            nextStage: 'done' as const,
            color: 'indigo',
        },
        {
            stage: 'done' as const,
            title: 'Analysis',
            icon: BarChart2,
            desc: 'Equivalence reached! You can now analyze the pH curve and data to confirm the HCl concentration.',
            action: null,
            nextStage: null,
            color: 'emerald',
        },
    ];

    const [animateCard, setAnimateCard] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);

    // Native Drag Logic
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const dragStartPos = useRef({ x: 0, y: 0 });

    const handlePointerDown = (e: React.PointerEvent) => {
        setIsDragging(true);
        dragStartPos.current = { x: e.clientX - position.x, y: e.clientY - position.y };
        e.currentTarget.setPointerCapture(e.pointerId);
    };

    const handlePointerMove = (e: React.PointerEvent) => {
        if (isDragging) {
            setPosition({
                x: e.clientX - dragStartPos.current.x,
                y: e.clientY - dragStartPos.current.y
            });
        }
    };

    const handlePointerUp = (e: React.PointerEvent) => {
        setIsDragging(false);
        e.currentTarget.releasePointerCapture(e.pointerId);
    };

    useEffect(() => {
        setAnimateCard(true);
        const timer = setTimeout(() => setAnimateCard(false), 500);
        return () => clearTimeout(timer);
    }, [labStage]);

    const currentIdx = STAGE_ORDER[labStage] || 0;
    const currentStep = STEPS[currentIdx];
    const Icon = currentStep.icon;

    if (!showAssistant) return null;

    if (isMinimized) {
        return (
            <div
                className="absolute top-2 left-2 sm:top-20 sm:left-4 z-20 pointer-events-none transition-transform duration-300"
                style={{ transform: `translate(${position.x}px, ${position.y}px)` }}
            >
                <div
                    className={`pointer-events-auto flex items-center gap-2 p-2 bg-card/90 backdrop-blur-xl border border-${currentStep.color}-500/30 rounded-full shadow-[0_0_20px_rgba(0,0,0,0.5)] cursor-grab active:cursor-grabbing hover:bg-muted/80 transition-all ${isDragging ? 'scale-[1.05] ring-2 ring-indigo-500/50' : ''}`}
                    onPointerDown={handlePointerDown}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                    onPointerCancel={handlePointerUp}
                >
                    <div className={`relative flex items-center justify-center w-8 h-8 rounded-full bg-${currentStep.color}-500/20 text-${currentStep.color}-400 ring-1 ring-${currentStep.color}-500/50 flex-shrink-0`}>
                        <Icon className="w-4 h-4" />
                        <span className={`absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-${currentStep.color}-400 animate-ping opacity-75`} />
                        <span className={`absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-${currentStep.color}-500`} />
                    </div>

                    <button
                        onPointerDown={(e) => e.stopPropagation()}
                        onClick={(e) => { e.stopPropagation(); setIsMinimized(false); }}
                        className="p-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors pointer-events-auto cursor-pointer"
                        title="Maximize Assistant"
                    >
                        <Maximize2 className="w-4 h-4" />
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div
            className={`absolute top-2 left-2 sm:top-20 sm:left-4 z-20 w-[220px] sm:w-[280px] transition-opacity duration-300 pointer-events-none
                ${animateCard ? 'opacity-80' : 'opacity-100'}`}
            style={{ transform: `translate(${position.x}px, ${position.y}px)` }}
        >
            <div className={`pointer-events-auto bg-card/85 backdrop-blur-xl border border-indigo-500/20 rounded-2xl shadow-2xl overflow-hidden relative group ${isDragging ? 'shadow-indigo-500/20 shadow-2xl scale-[1.02] ring-1 ring-indigo-500/50' : 'shadow-2xl'} transition-all duration-300`}>
                {/* Glowing top border based on current step color */}
                <div className={`absolute top-0 left-0 w-full h-1 bg-${currentStep.color}-500 transition-colors duration-500`} />
                <div className={`absolute inset-0 bg-gradient-to-br from-${currentStep.color}-500/5 to-transparent pointer-events-none`} />

                {/* AI Assistant Header */}
                <div
                    className="px-4 py-3 border-b border-border/50 flex items-center justify-between bg-muted/20 relative z-10 cursor-grab active:cursor-grabbing hover:bg-muted/50 select-none"
                    onPointerDown={handlePointerDown}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                    onPointerCancel={handlePointerUp}
                >
                    <div className="flex items-center gap-2">
                        <GripHorizontal className="w-4 h-4 text-gray-500 flex-shrink-0" />
                        <div className={`relative flex items-center justify-center w-7 h-7 rounded-full bg-${currentStep.color}-500/20 text-${currentStep.color}-400 ring-1 ring-${currentStep.color}-500/50 flex-shrink-0`}>
                            <Icon className="w-3.5 h-3.5" />
                            <span className={`absolute -top-1 -right-1 w-2 h-2 rounded-full bg-${currentStep.color}-400 animate-ping opacity-75`} />
                            <span className={`absolute -top-1 -right-1 w-2 h-2 rounded-full bg-${currentStep.color}-500`} />
                        </div>
                        <div className="min-w-0">
                            <span className="text-[9px] uppercase font-bold tracking-widest text-muted-foreground block mb-0.5 pointer-events-none">Assistant</span>
                            <h3 className="text-xs font-semibold text-foreground tracking-tight leading-none pointer-events-none truncate pr-2">{currentStep.title}</h3>
                        </div>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0 pointer-events-none">
                        <div className="hidden sm:flex gap-1.5 mr-1 pt-0.5">
                            {[0, 1, 2, 3, 4].map((i) => (
                                <div key={i} className={`w-1 h-1 rounded-full transition-all duration-300 ${i === currentIdx ? `bg-${currentStep.color}-400 ring-2 ring-${currentStep.color}-400/30 scale-125` : i < currentIdx ? 'bg-emerald-500' : 'bg-gray-700'}`} />
                            ))}
                        </div>
                        <button
                            onPointerDown={(e) => e.stopPropagation()}
                            onClick={(e) => { e.stopPropagation(); setIsMinimized(true); }}
                            className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors pointer-events-auto cursor-pointer"
                            title="Minimize Assistant"
                        >
                            <ChevronDown className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Assistant Message */}
                <div className="p-4 relative z-10 pointer-events-auto">
                    <p className="text-sm text-muted-foreground leading-relaxed min-h-[50px]">
                        {currentStep.desc}
                    </p>

                    {/* Action Area */}
                    <div className="mt-5 flex items-center justify-end h-10">
                        {currentStep.action ? (
                            <button
                                onClick={() => currentStep.nextStage && setLabStage(currentStep.nextStage)}
                                className={`flex items-center gap-2 px-4 py-2 text-sm font-bold text-white rounded-xl shadow-lg transition-all transform active:scale-95 bg-${currentStep.color}-600 hover:bg-${currentStep.color}-500 hover:shadow-${currentStep.color}-500/25`}
                            >
                                {currentStep.action}
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        ) : currentStep.stage !== 'titrate' && currentStep.stage !== 'done' ? (
                            <div className="flex items-center gap-2 text-xs text-indigo-400 font-bold bg-indigo-500/10 px-3 py-1.5 rounded-lg border border-indigo-500/20 uppercase tracking-wider">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                                </span>
                                Processing
                            </div>
                        ) : currentStep.stage === 'titrate' ? (
                            <div className="flex items-center gap-2 text-xs text-amber-400 font-bold bg-amber-500/10 px-3 py-1.5 rounded-lg border border-amber-500/20 uppercase tracking-wider">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                                </span>
                                Awaiting Endpoint
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 text-xs text-emerald-400 font-bold bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20 uppercase tracking-wider">
                                <CheckCircle2 className="w-4 h-4" />
                                Experiment Complete
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
