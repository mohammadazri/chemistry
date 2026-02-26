import { useExperimentStore } from '../../store/experimentStore';
import { Beaker, FlaskConical, Droplets, BarChart2, CheckCircle2, ChevronRight } from 'lucide-react';
import { useEffect, useState } from 'react';

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
        desc: 'Adding 0.1M NaOH solution into the burette. Please wait...',
        action: null,
        nextStage: 'fill-flask' as const,
        color: 'blue',
    },
    {
        stage: 'fill-flask' as const,
        title: 'Preparing Flask',
        icon: FlaskConical,
        desc: 'Pouring 25mL of 0.1M HCl and phenolphthalein indicator into the flask.',
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

const STAGE_ORDER = { setup: 0, 'fill-burette': 1, 'fill-flask': 2, titrate: 3, done: 4 };

export default function LabAssistant() {
    const labStage = useExperimentStore((s) => s.labStage);
    const setLabStage = useExperimentStore((s) => s.setLabStage);

    // Add a pulsing animation to the assistant card when a new step starts
    const [animateCard, setAnimateCard] = useState(false);

    useEffect(() => {
        setAnimateCard(true);
        const timer = setTimeout(() => setAnimateCard(false), 500);
        return () => clearTimeout(timer);
    }, [labStage]);

    const currentIdx = STAGE_ORDER[labStage] || 0;
    const currentStep = STEPS[currentIdx];
    const Icon = currentStep.icon;

    return (
        <div className={`absolute top-20 left-4 sm:left-6 z-20 w-[300px] sm:w-[340px] pointer-events-none transition-all duration-500
            ${animateCard ? 'scale-105 opacity-80' : 'scale-100 opacity-100'}`}
        >
            <div className="pointer-events-auto bg-[#0a0f1a]/85 backdrop-blur-xl border border-indigo-500/20 rounded-2xl shadow-2xl overflow-hidden relative group">
                {/* Glowing top border based on current step color */}
                <div className={`absolute top-0 left-0 w-full h-1 bg-${currentStep.color}-500 transition-colors duration-500`} />
                <div className={`absolute inset-0 bg-gradient-to-br from-${currentStep.color}-500/5 to-transparent pointer-events-none`} />

                {/* AI Assistant Header */}
                <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between bg-white/[0.02] relative z-10">
                    <div className="flex items-center gap-3">
                        <div className={`relative flex items-center justify-center w-8 h-8 rounded-full bg-${currentStep.color}-500/20 text-${currentStep.color}-400 ring-1 ring-${currentStep.color}-500/50`}>
                            <Icon className="w-4 h-4" />
                            <span className={`absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-${currentStep.color}-400 animate-ping opacity-75`} />
                            <span className={`absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-${currentStep.color}-500`} />
                        </div>
                        <div>
                            <span className="text-[10px] uppercase font-bold tracking-widest text-gray-400 block mb-0.5">Lab Assistant</span>
                            <h3 className="text-sm font-semibold text-white tracking-tight leading-none">{currentStep.title}</h3>
                        </div>
                    </div>
                    <div className="flex gap-1">
                        {[0, 1, 2, 3, 4].map((i) => (
                            <div key={i} className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${i === currentIdx ? `bg-${currentStep.color}-400 ring-2 ring-${currentStep.color}-400/30 scale-125` : i < currentIdx ? 'bg-emerald-500' : 'bg-gray-700'}`} />
                        ))}
                    </div>
                </div>

                {/* Assistant Message */}
                <div className="p-5 relative z-10">
                    <p className="text-sm text-gray-300 leading-relaxed min-h-[60px]">
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
