import { useExperimentStore } from '../../store/experimentStore';
import { CheckCircle2, FlaskConical, Beaker, Droplets, BarChart2 } from 'lucide-react';

const STEPS = [
    {
        stage: 'setup' as const,
        title: 'Setup Equipment',
        icon: Beaker,
        desc: 'Empty apparatus is ready. Camera shows the full bench setup.',
        action: 'Fill Burette with NaOH →',
        nextStage: 'fill-burette' as const,
        color: 'sky',
    },
    {
        stage: 'fill-burette' as const,
        title: 'Filling Burette',
        icon: FlaskConical,
        desc: 'Pouring 0.1M NaOH from the amber bottle into the burette…',
        action: null, // auto-advances
        nextStage: 'fill-flask' as const,
        color: 'blue',
    },
    {
        stage: 'fill-flask' as const,
        title: 'Filling Flask',
        icon: FlaskConical,
        desc: 'Pouring 25mL of 0.1M HCl + phenolphthalein indicator into the Erlenmeyer flask…',
        action: null, // auto-advances
        nextStage: 'titrate' as const,
        color: 'cyan',
    },
    {
        stage: 'titrate' as const,
        title: 'Titration',
        icon: Droplets,
        desc: 'Open the stopcock to add NaOH dropwise. Watch pH and colour change. Stop at the pale pink endpoint.',
        action: null,
        nextStage: 'done' as const,
        color: 'indigo',
    },
    {
        stage: 'done' as const,
        title: 'Results',
        icon: BarChart2,
        desc: 'Equivalence reached! Use M₁V₁ = M₂V₂ to confirm HCl concentration. View the pH curve in the Chart tab.',
        action: null,
        nextStage: null,
        color: 'emerald',
    },
];

const STAGE_ORDER: Record<string, number> = {
    setup: 0, 'fill-burette': 1, 'fill-flask': 2, titrate: 3, done: 4,
};

const COLOR_MAP: Record<string, string> = {
    sky: 'border-sky-500 bg-sky-500/20 text-sky-400 shadow-sky-500/30',
    blue: 'border-blue-500 bg-blue-500/20 text-blue-400 shadow-blue-500/30',
    cyan: 'border-cyan-500 bg-cyan-500/20 text-cyan-400 shadow-cyan-500/30',
    indigo: 'border-indigo-500 bg-indigo-500/20 text-indigo-400 shadow-indigo-500/30',
    emerald: 'border-emerald-500 bg-emerald-500/20 text-emerald-400 shadow-emerald-500/30',
};
const BTN_MAP: Record<string, string> = {
    sky: 'bg-sky-600 hover:bg-sky-500',
    blue: 'bg-blue-600 hover:bg-blue-500',
    cyan: 'bg-cyan-600 hover:bg-cyan-500',
    indigo: 'bg-indigo-600 hover:bg-indigo-500',
    emerald: 'bg-emerald-600 hover:bg-emerald-500',
};

export default function StepInstructions() {
    const labStage = useExperimentStore((s) => s.labStage);
    const setLabStage = useExperimentStore((s) => s.setLabStage);

    const currentIdx = STAGE_ORDER[labStage] ?? 0;

    return (
        <div className="flex flex-col gap-3 text-white">
            <h2 className="text-base font-bold tracking-tight text-gray-200 mb-1">Experiment Guide</h2>

            {STEPS.map((step, idx) => {
                const isDone = idx < currentIdx;
                const isActive = idx === currentIdx;
                const isFuture = idx > currentIdx;
                const Icon = step.icon;

                return (
                    <div
                        key={step.stage}
                        className={`relative flex gap-3 p-3 rounded-xl border transition-all duration-500
                            ${isActive ? `border-${step.color}-500/40 bg-${step.color}-500/8` : 'border-white/5 bg-white/2'}
                            ${isFuture ? 'opacity-40' : 'opacity-100'}`}
                    >
                        {/* Step icon */}
                        <div className={`shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center mt-0.5 transition-all duration-300
                            ${isDone ? 'border-emerald-500 bg-emerald-500/20' : isActive ? `border-${step.color}-500 bg-${step.color}-500/20 shadow-lg shadow-${step.color}-500/30` : 'border-gray-700 bg-gray-800'}`}>
                            {isDone
                                ? <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                : <Icon className={`w-4 h-4 ${isActive ? `text-${step.color}-400` : 'text-gray-600'}`} />
                            }
                        </div>

                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                                <span className={`text-xs font-bold uppercase tracking-wider
                                    ${isDone ? 'text-emerald-400' : isActive ? `text-${step.color}-300` : 'text-gray-600'}`}>
                                    {step.title}
                                </span>
                                {isActive && (
                                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/10 text-gray-400 font-medium animate-pulse">
                                        Active
                                    </span>
                                )}
                            </div>
                            {isActive && (
                                <p className="text-xs text-gray-400 leading-relaxed mb-2">{step.desc}</p>
                            )}
                            {isActive && step.action && (
                                <button
                                    onClick={() => step.nextStage && setLabStage(step.nextStage)}
                                    className={`text-xs font-bold px-3 py-1.5 rounded-lg text-white transition-all shadow-md ${BTN_MAP[step.color]}`}
                                >
                                    {step.action}
                                </button>
                            )}
                            {isActive && !step.action && step.stage !== 'titrate' && step.stage !== 'done' && (
                                <p className="text-xs text-gray-500 italic">Animating automatically…</p>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
