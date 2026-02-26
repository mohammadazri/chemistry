import { useExperimentStore } from '../../store/experimentStore';
import { CheckCircle2, ArrowRight } from 'lucide-react';

const steps = [
    {
        title: "Setup Equipment",
        description: "Ensure the burette is filled with 0.1M NaOH and the flask contains 25mL of unknown HCl solution with phenolphthalein indicator."
    },
    {
        title: "Initial Reading",
        description: "Record the initial volume of the burette. The solution in the flask should be perfectly clear."
    },
    {
        title: "Begin Titration",
        description: "Open the stopcock to add NaOH dropwise while observing the pH and the color of the solution in the flask."
    },
    {
        title: "Reach Equivalence Point",
        description: "Stop adding NaOH exactly when the solution turning a faint, persistent pink color, indicating pH ≈ 7.0."
    },
    {
        title: "Final Calculation",
        description: "Record final volume and use the formula M1V1 = M2V2 to determine the HCl concentration."
    }
];

export default function StepInstructions() {
    const currentStep = useExperimentStore((state) => state.currentStep);
    const setCurrentStep = useExperimentStore((state) => state.setCurrentStep);

    return (
        <div className="flex flex-col h-full text-white">
            <h2 className="text-xl font-bold tracking-tight mb-6">Procedure Guide</h2>

            <div className="flex-1 overflow-y-auto pr-2 customized-scrollbar relative">
                {/* Vertical Line Connector */}
                <div className="absolute left-4 top-4 bottom-8 w-0.5 bg-indigo-500/20" />

                <div className="space-y-6 relative z-10">
                    {steps.map((step, index) => {
                        const isCompleted = index < currentStep;
                        const isActive = index === currentStep;
                        const isUpcoming = index > currentStep;

                        let ringColor = 'border-gray-600 bg-gray-800 text-gray-500';
                        if (isCompleted) ringColor = 'border-green-500 bg-green-500/20 text-green-400';
                        if (isActive) ringColor = 'border-indigo-500 bg-indigo-500/20 text-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.5)]';

                        return (
                            <div key={index} className={`flex gap-4 group transition-all duration-300 ${isUpcoming ? 'opacity-50' : 'opacity-100'}`}>
                                <div className="shrink-0 mt-1 relative bg-[#0F172A] z-10">
                                    <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${ringColor}`}>
                                        {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : <span className="font-bold text-sm tracking-tighter">{index + 1}</span>}
                                    </div>
                                </div>

                                <div className={`flex flex-col flex-1 p-4 rounded-2xl border transition-all duration-300
                                    ${isActive ? 'bg-indigo-500/10 border-indigo-500/30' : 'bg-transparent border-transparent'}
                                    ${isCompleted ? 'hover:bg-white/5 border-transparent' : ''}
                                `}>
                                    <h3 className={`text-sm font-bold tracking-wide uppercase mb-2
                                        ${isActive ? 'text-indigo-300' : isCompleted ? 'text-gray-300' : 'text-gray-500'}
                                    `}>
                                        {step.title}
                                    </h3>
                                    <p className={`text-sm leading-relaxed ${isActive ? 'text-gray-300' : 'text-gray-500'}`}>
                                        {step.description}
                                    </p>

                                    {isActive && (
                                        <button
                                            onClick={() => setCurrentStep(currentStep + 1)}
                                            className="mt-4 flex items-center gap-2 self-start bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-4 py-2 rounded-lg transition-all shadow-md group/btn"
                                        >
                                            Mark as Complete
                                            <ArrowRight className="w-3 h-3 group-hover/btn:translate-x-1 transition-transform" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
