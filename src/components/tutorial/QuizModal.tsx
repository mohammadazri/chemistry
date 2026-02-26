import { useState, useEffect } from 'react';
import { useUiStore } from '../../store/uiStore';
import { CheckCircle, XCircle, ChevronRight, Beaker, RotateCcw, ArrowRight } from 'lucide-react';

const QUIZ_QUESTIONS = [
    {
        question: 'What does phenolphthalein indicator look like in a basic solution?',
        options: ['Yellow', 'Pink', 'Blue', 'Clear'],
        answer: 1
    },
    {
        question: 'At the equivalence point, the pH of a strong acid-strong base titration is:',
        options: ['4', '7', '10', '14'],
        answer: 1
    },
    {
        question: 'To avoid parallax error when reading the burette, you should:',
        options: ['Look from above', 'Look at eye level', 'Look from below', 'Use a calculator'],
        answer: 1
    },
    {
        question: 'How many moles of HCl are needed to neutralize 0.025L of 0.1 mol/L NaOH?',
        options: ['0.001', '0.0025', '0.01', '0.025'],
        answer: 1
    },
    {
        question: 'Why do we perform the titration in triplicate?',
        options: ['To use more chemicals', 'To get concordant results', 'It is a rule', 'To pass the time'],
        answer: 1
    }
];

export default function QuizModal() {
    const showQuiz = useUiStore((state) => state.showQuiz);
    const setShowQuiz = useUiStore((state) => state.setShowQuiz);

    const [currentQIndex, setCurrentQIndex] = useState(0);
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [score, setScore] = useState(0);
    const [isFinished, setIsFinished] = useState(false);
    const [showError, setShowError] = useState(false);

    // Reset state when modal is opened
    useEffect(() => {
        if (showQuiz) {
            setCurrentQIndex(0);
            setSelectedOption(null);
            setScore(0);
            setIsFinished(false);
        }
    }, [showQuiz]);

    if (!showQuiz) return null;

    const handleNext = () => {
        if (selectedOption === null) {
            setShowError(true);
            setTimeout(() => setShowError(false), 2000);
            return;
        }

        // Check answer
        const currentQuestion = QUIZ_QUESTIONS[currentQIndex];
        if (selectedOption === currentQuestion.answer) {
            setScore(s => s + 1);
        }

        if (currentQIndex < QUIZ_QUESTIONS.length - 1) {
            setCurrentQIndex(currentQIndex + 1);
            setSelectedOption(null);
        } else {
            // End of quiz
            setIsFinished(true);
        }
    };

    const handleRetake = () => {
        setCurrentQIndex(0);
        setSelectedOption(null);
        setScore(0);
        setIsFinished(false);
    };

    const currentQuestion = QUIZ_QUESTIONS[currentQIndex];
    const progressPercentage = ((currentQIndex + 1) / QUIZ_QUESTIONS.length) * 100;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-md" />

            <div className="bg-[#0F172A]/90 backdrop-blur-xl border border-indigo-500/20 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl relative z-10 flex flex-col transform transition-all shadow-[0_0_50px_rgba(30,27,75,0.5)]">
                {/* Header Gradient */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />

                {!isFinished ? (
                    <>
                        <div className="p-6 sm:p-8 pb-0">
                            <div className="flex justify-between items-center mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="bg-indigo-500/10 p-2 rounded-xl text-indigo-400 border border-indigo-500/20">
                                        <Beaker className="w-5 h-5" />
                                    </div>
                                    <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Pre-Lab Knowledge Check</h2>
                                </div>
                                <div className="bg-white/5 px-3 py-1 rounded-full border border-white/10 flex items-center gap-2">
                                    <span className="text-indigo-400 font-bold text-sm">Q{currentQIndex + 1}</span>
                                    <span className="text-gray-500 text-sm">of {QUIZ_QUESTIONS.length}</span>
                                </div>
                            </div>

                            {/* Progress Bar */}
                            <div className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden mb-8">
                                <div
                                    className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-500 ease-out"
                                    style={{ width: `${progressPercentage}%` }}
                                />
                            </div>

                            <h3 className="text-xl sm:text-2xl font-medium text-white mb-8 leading-relaxed">
                                {currentQuestion.question}
                            </h3>

                            <div className="space-y-3 mb-8">
                                {currentQuestion.options.map((opt, i) => {
                                    const isSelected = selectedOption === i;
                                    return (
                                        <button
                                            key={i}
                                            onClick={() => setSelectedOption(i)}
                                            className={`w-full group text-left px-6 py-4 rounded-2xl border transition-all duration-200 flex items-center gap-4
                                                ${isSelected
                                                    ? 'bg-indigo-600/10 border-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.15)] ring-1 ring-indigo-500'
                                                    : 'bg-[#1e293b]/50 border-white/5 text-gray-300 hover:bg-[#1e293b] hover:border-white/10'}`}
                                        >
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border transition-colors
                                                ${isSelected ? 'bg-indigo-500 text-white border-indigo-500' : 'bg-transparent border-gray-600 text-gray-500 group-hover:border-gray-400 group-hover:text-gray-300'}
                                            `}>
                                                {['A', 'B', 'C', 'D'][i]}
                                            </div>
                                            <span className={`text-base sm:text-lg ${isSelected ? 'text-white font-medium' : ''}`}>
                                                {opt}
                                            </span>
                                            {isSelected && (
                                                <div className="ml-auto w-2 h-2 rounded-full bg-indigo-400 shadow-[0_0_10px_rgba(129,140,248,1)]" />
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="p-6 sm:px-8 border-t border-white/5 bg-[#050810]/50 flex justify-between items-center relative">
                            {showError && (
                                <p className="text-red-400 text-sm animate-pulse flex items-center gap-2 absolute left-8">
                                    <XCircle className="w-4 h-4" /> Please select an answer
                                </p>
                            )}
                            <div className="ml-auto">
                                <button
                                    onClick={handleNext}
                                    className={`flex items-center gap-2 px-8 py-3.5 rounded-xl font-bold text-white transition-all shadow-lg group
                                        ${selectedOption === null
                                            ? 'bg-gray-700 opacity-50 cursor-not-allowed'
                                            : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:shadow-indigo-500/25 hover:-translate-y-0.5'}`}
                                >
                                    {currentQIndex === QUIZ_QUESTIONS.length - 1 ? 'Finish Quiz' : 'Next Question'}
                                    {currentQIndex === QUIZ_QUESTIONS.length - 1 ? <CheckCircle className="w-5 h-5" /> : <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="p-10 sm:p-14 text-center">
                        {score >= 4 ? (
                            <div className="flex flex-col items-center animate-in fade-in zoom-in duration-500">
                                <div className="relative mb-8">
                                    <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-2xl animate-pulse" />
                                    <div className="w-28 h-28 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center relative shadow-2xl">
                                        <CheckCircle className="w-14 h-14 text-white" strokeWidth={3} />
                                    </div>
                                </div>

                                <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4 tracking-tight">Quiz Passed!</h2>
                                <p className="text-gray-300 text-lg mb-10 max-w-md mx-auto leading-relaxed">
                                    Outstanding. You scored <strong className="text-emerald-400">{score}/{QUIZ_QUESTIONS.length}</strong>. You are fully prepared to enter the virtual laboratory.
                                </p>

                                <button
                                    onClick={() => setShowQuiz(false)}
                                    className="px-10 py-4 w-full sm:w-auto rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-lg shadow-[0_0_30px_rgba(16,185,129,0.3)] hover:shadow-[0_0_40px_rgba(16,185,129,0.5)] transition-all flex items-center justify-center gap-3 group"
                                >
                                    Proceed to Lab
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform" />
                                </button>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center animate-in fade-in zoom-in duration-500">
                                <div className="relative mb-8">
                                    <div className="absolute inset-0 bg-rose-500/20 rounded-full blur-2xl animate-pulse" />
                                    <div className="w-28 h-28 bg-gradient-to-br from-rose-400 to-rose-600 rounded-full flex items-center justify-center relative shadow-2xl">
                                        <XCircle className="w-14 h-14 text-white" strokeWidth={3} />
                                    </div>
                                </div>

                                <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4 tracking-tight">Quiz Failed</h2>
                                <p className="text-gray-300 text-lg mb-10 max-w-md mx-auto leading-relaxed">
                                    You scored <strong className="text-rose-400">{score}/{QUIZ_QUESTIONS.length}</strong>. You must score at least 4 out of 5 to ensure you understand the safety and procedural requirements.
                                </p>

                                <button
                                    onClick={handleRetake}
                                    className="px-10 py-4 w-full sm:w-auto rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-white font-bold text-lg transition-all flex items-center justify-center gap-3 group"
                                >
                                    <RotateCcw className="w-5 h-5 group-hover:-rotate-90 transition-transform duration-300" />
                                    Review & Retake
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
