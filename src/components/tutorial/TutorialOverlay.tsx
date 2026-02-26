import { useState } from 'react';
import { useUiStore } from '../../store/uiStore';

const INSTRUCTIONS = [
    {
        title: 'Safety First',
        content: 'Virtual PPE, lab coat, and safety goggles are required at all times. In this virtual environment, accidents are just learning opportunities, but real-world safety rules still apply.',
        iconColor: 'bg-red-500'
    },
    {
        title: 'Equipment Overview',
        content: 'Familiarize yourself with the setup. The burette holds the titrant (HCl). The Erlenmeyer flask contains the analyte (NaOH) and indicator. The pH meter records live data.',
        iconColor: 'bg-blue-500'
    },
    {
        title: 'Titration Technique',
        content: 'Add HCl rapidly at first, then dropwise as you approach the equivalence point. Watch closely for a lasting color change in the flask.',
        iconColor: 'bg-green-500'
    }
    ,
    {
        title: 'Reading the Burette',
        content: 'Always read from the bottom of the meniscus at eye level to avoid parallax error. The automated system here records precisely what you see.',
        iconColor: 'bg-yellow-500'
    },
    {
        title: 'Ready?',
        content: 'You will now take a brief pre-lab quiz to ensure you understand the procedure. Pass the quiz to unlock the laboratory equipment.',
        iconColor: 'bg-purple-500'
    }
];

export default function TutorialOverlay() {
    const showTutorial = useUiStore((state) => state.showTutorial);
    const toggleTutorial = useUiStore((state) => state.toggleTutorial);
    const setShowQuiz = useUiStore((state) => state.setShowQuiz);
    const [currentSlide, setCurrentSlide] = useState(0);

    if (!showTutorial) return null;

    const handleNext = () => {
        if (currentSlide < INSTRUCTIONS.length - 1) {
            setCurrentSlide(currentSlide + 1);
        }
    };

    const handlePrev = () => {
        if (currentSlide > 0) {
            setCurrentSlide(currentSlide - 1);
        }
    };

    const handleSkip = () => {
        toggleTutorial();
        setShowQuiz(true);
    };

    const slide = INSTRUCTIONS[currentSlide];
    const isLastSlide = currentSlide === INSTRUCTIONS.length - 1;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
            <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col">

                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-gray-800">
                    <h2 className="text-2xl font-bold text-white">Pre-Lab Tutorial</h2>
                    <button
                        onClick={handleSkip}
                        className="text-gray-400 hover:text-white transition-colors"
                    >
                        Skip
                    </button>
                </div>

                {/* Content Body */}
                <div className="p-10 flex flex-col items-center text-center">
                    {/* Illustration Placeholder */}
                    <div className={`w-32 h-32 rounded-full mb-8 flex items-center justify-center ${slide.iconColor}`}>
                        <span className="text-5xl text-white font-bold">{currentSlide + 1}</span>
                    </div>

                    <h3 className="text-3xl font-bold text-white mb-4">{slide.title}</h3>
                    <p className="text-gray-300 text-lg leading-relaxed max-w-lg">
                        {slide.content}
                    </p>
                </div>

                {/* Footer / Controls */}
                <div className="p-6 border-t border-gray-800 bg-gray-800/50 flex justify-between items-center">
                    <button
                        onClick={handlePrev}
                        disabled={currentSlide === 0}
                        className="px-6 py-2 rounded text-gray-300 disabled:opacity-30 hover:bg-gray-700 transition-colors"
                    >
                        Previous
                    </button>

                    {/* Dot Indicators */}
                    <div className="flex gap-2">
                        {INSTRUCTIONS.map((_, i) => (
                            <div
                                key={i}
                                className={`w-3 h-3 rounded-full transition-colors ${i === currentSlide ? 'bg-blue-500' : 'bg-gray-600'}`}
                            />
                        ))}
                    </div>

                    {!isLastSlide ? (
                        <button
                            onClick={handleNext}
                            className="px-6 py-2 rounded bg-blue-600 hover:bg-blue-500 text-white transition-colors"
                        >
                            Next
                        </button>
                    ) : (
                        <button
                            onClick={() => {
                                toggleTutorial();
                                setShowQuiz(true);
                            }}
                            className="px-6 py-2 rounded bg-green-600 hover:bg-green-500 text-white font-bold transition-colors shadow-lg shadow-green-900/20"
                        >
                            Start Quiz
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
