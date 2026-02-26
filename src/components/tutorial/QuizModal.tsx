import { useState } from 'react';
import { useUiStore } from '../../store/uiStore';

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

    if (!showQuiz) return null;

    const handleNext = () => {
        if (selectedOption === null) return;

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

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
            <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col">
                {!isFinished ? (
                    <>
                        <div className="flex justify-between items-center p-6 border-b border-gray-800">
                            <h2 className="text-xl font-bold text-white">Pre-Lab Knowledge Check</h2>
                            <span className="text-gray-400 font-mono">
                                {currentQIndex + 1} / {QUIZ_QUESTIONS.length}
                            </span>
                        </div>

                        <div className="p-8">
                            <h3 className="text-lg text-white mb-6 leading-relaxed">
                                {currentQuestion.question}
                            </h3>

                            <div className="space-y-3">
                                {currentQuestion.options.map((opt, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setSelectedOption(i)}
                                        className={`w-full text-left px-5 py-4 rounded-lg border transition-all
                      ${selectedOption === i
                                                ? 'bg-blue-600/20 border-blue-500 text-white'
                                                : 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700'}`}
                                    >
                                        <span className="inline-block w-8 font-bold text-gray-500">
                                            {['A', 'B', 'C', 'D'][i]})
                                        </span>
                                        {opt}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="p-6 border-t border-gray-800 bg-gray-800/50 flex justify-end">
                            <button
                                onClick={handleNext}
                                disabled={selectedOption === null}
                                className="px-8 py-3 rounded bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {currentQIndex === QUIZ_QUESTIONS.length - 1 ? 'Finish Quiz' : 'Next Question'}
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="p-10 text-center">
                        {score >= 4 ? (
                            <>
                                <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <span className="text-5xl text-green-500">✓</span>
                                </div>
                                <h2 className="text-3xl font-bold text-white mb-2">Quiz Passed!</h2>
                                <p className="text-gray-400 mb-8">
                                    You scored {score}/{QUIZ_QUESTIONS.length}. You are ready to enter the lab.
                                </p>
                                <button
                                    onClick={() => setShowQuiz(false)}
                                    className="px-8 py-3 w-full rounded bg-green-600 hover:bg-green-500 text-white font-bold transition-colors"
                                >
                                    Proceed to Lab
                                </button>
                            </>
                        ) : (
                            <>
                                <div className="w-24 h-24 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <span className="text-5xl text-red-500">✗</span>
                                </div>
                                <h2 className="text-3xl font-bold text-white mb-2">Quiz Failed</h2>
                                <p className="text-gray-400 mb-8">
                                    You scored {score}/{QUIZ_QUESTIONS.length}. You must score at least 4 to proceed.
                                </p>
                                <button
                                    onClick={handleRetake}
                                    className="px-8 py-3 w-full rounded bg-gray-700 hover:bg-gray-600 text-white font-bold transition-colors"
                                >
                                    Retake Quiz
                                </button>
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
