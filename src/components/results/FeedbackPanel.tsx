interface FeedbackPanelProps {
    feedback: string[];
}

export default function FeedbackPanel({ feedback }: FeedbackPanelProps) {
    if (feedback.length === 0) {
        return (
            <div className="bg-green-900/20 border border-green-800/50 p-6 rounded-xl">
                <h4 className="text-green-400 flex items-center gap-2 font-bold mb-2">
                    <span>✓</span> Perfect Technique!
                </h4>
                <p className="text-green-300/80 text-sm">
                    You performed the titration flawlessly with excellent precision. No major errors detected.
                </p>
            </div>
        );
    }

    return (
        <div className="bg-amber-900/20 border border-amber-800/50 p-6 rounded-xl">
            <h4 className="text-amber-500 flex items-center gap-2 font-bold mb-4">
                <span>⚠</span> Areas for Improvement
            </h4>
            <ul className="space-y-3">
                {feedback.map((msg, i) => (
                    <li key={i} className="flex gap-3 text-amber-300/80 text-sm items-start">
                        <span className="text-amber-500 mt-0.5">•</span>
                        {msg}
                    </li>
                ))}
            </ul>
        </div>
    );
}
