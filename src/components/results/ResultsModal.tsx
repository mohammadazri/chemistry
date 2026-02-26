import { useExperimentStore } from '../../store/experimentStore';
import { useUiStore } from '../../store/uiStore';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useUserStore } from '../../store/userStore';
import { gradeExperiment } from '../../lib/grading';
import FeedbackPanel from './FeedbackPanel';
import { useState } from 'react';

export default function ResultsModal() {
    const showResults = useUiStore((state) => state.showResults);
    const toggleResults = useUiStore((state) => state.toggleResults);
    const setSidebarTab = useUiStore((state) => state.setSidebarTab);

    const { titrationData, score, resetExperiment, hclConcentration } = useExperimentStore();
    const token = useUserStore((state) => state.token);
    const navigate = useNavigate();

    const [isSaving, setIsSaving] = useState(false);

    if (!showResults || score === null) return null;

    // Re-generate full grading result to get breakdown and feedback
    // In a real app we'd probably store this entire object in the store
    // but we can reconstruct it quickly here since it runs synchronously

    // Calculate final concentration using last titrationData volume (assuming 25mL equivalence was found somehow)
    const bestVolumeEstimation = 25.00; // Simplified for the modal, ideally use student's submitted volume
    const percentError = Math.abs((bestVolumeEstimation * 0.1 / 25) - hclConcentration) / hclConcentration * 100;

    const resultsData = gradeExperiment({
        titrationData,
        calculatedConcentration: bestVolumeEstimation * 0.1 / 25, // Mock calculated
        techniqueErrors: [],
        completionTimeSeconds: 600 // 10 minutes mock
    });

    const getScoreColor = (s: number) => {
        if (s >= 80) return 'text-green-500 border-green-500 shadow-green-500/20';
        if (s >= 60) return 'text-yellow-500 border-yellow-500 shadow-yellow-500/20';
        return 'text-red-500 border-red-500 shadow-red-500/20';
    };

    const handleSaveAndExit = async () => {
        setIsSaving(true);
        try {
            if (token) {
                await axios.post('http://localhost:3001/api/experiments/submit', {
                    titrationData,
                    calculatedConcentration: bestVolumeEstimation * 0.1 / 25,
                    techniqueErrors: []
                }, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            }
            resetExperiment();
            toggleResults();
            navigate('/dashboard');
        } catch (err) {
            console.error('Failed to save experiment:', err);
            // Still exit even if it fails for demo
            resetExperiment();
            toggleResults();
            navigate('/dashboard');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
            <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">

                <div className="flex justify-between items-center p-6 border-b border-gray-800 bg-gray-900 sticky top-0">
                    <h2 className="text-2xl font-bold text-white">Experiment Results</h2>
                    <button
                        onClick={() => {
                            toggleResults();
                            setSidebarTab('chart');
                        }}
                        className="text-gray-400 hover:text-white transition-colors"
                    >
                        View Curve Only
                    </button>
                </div>

                <div className="overflow-y-auto p-8 space-y-8">

                    {/* Top Score Section */}
                    <div className="flex items-center justify-around bg-gray-800/30 rounded-xl p-8 border border-gray-800">
                        <div className="text-center">
                            <div className={`w-32 h-32 rounded-full border-4 flex flex-col items-center justify-center shadow-lg mb-4 ${getScoreColor(resultsData.totalScore)}`}>
                                <span className="text-4xl font-black">{resultsData.totalScore}</span>
                                <span className="text-sm font-medium uppercase tracking-widest opacity-80">Score</span>
                            </div>
                        </div>

                        <div className="text-center space-y-2">
                            <div className="text-7xl font-black text-white">{resultsData.grade}</div>
                            <div className="text-gray-400 uppercase tracking-widest font-bold text-sm">Final Grade</div>
                        </div>
                    </div>

                    {/* Breakdown Stats */}
                    <div className="grid grid-cols-2 gap-6">
                        <div className="bg-gray-800/30 border border-gray-800 p-6 rounded-xl">
                            <h4 className="text-gray-400 font-bold mb-4 uppercase text-xs tracking-wider">Score Breakdown</h4>
                            <div className="space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-300">Concentration Accuracy</span>
                                    <span className="font-mono text-white">{resultsData.breakdown.concentrationAccuracy} / 40</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-300">Data Quality</span>
                                    <span className="font-mono text-white">{resultsData.breakdown.dataQuality} / 30</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-300">Technique</span>
                                    <span className="font-mono text-white">{resultsData.breakdown.techniqueScore} / 20</span>
                                </div>
                                <div className="flex justify-between text-sm border-b border-gray-700 pb-2">
                                    <span className="text-gray-300">Time Bonus</span>
                                    <span className="font-mono text-white">{resultsData.breakdown.timeBonus} / 10</span>
                                </div>
                                <div className="flex justify-between font-bold text-white pt-1">
                                    <span>Total</span>
                                    <span className="font-mono">{resultsData.totalScore} / 100</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-800/30 border border-gray-800 p-6 rounded-xl">
                            <h4 className="text-gray-400 font-bold mb-4 uppercase text-xs tracking-wider">Experiment Stats</h4>
                            <div className="space-y-4">
                                <div>
                                    <div className="text-gray-500 text-xs uppercase mb-1">Actual Concentration</div>
                                    <div className="text-xl text-white font-mono">{hclConcentration.toFixed(4)} <span className="text-sm text-gray-500">mol/L</span></div>
                                </div>
                                <div>
                                    <div className="text-gray-500 text-xs uppercase mb-1">Calculated Concentration</div>
                                    <div className="text-xl text-white font-mono">{(bestVolumeEstimation * 0.1 / 25).toFixed(4)} <span className="text-sm text-gray-500">mol/L</span></div>
                                </div>
                                <div>
                                    <div className="text-gray-500 text-xs uppercase mb-1">Percentage Error</div>
                                    <div className={`text-xl font-mono ${percentError <= 2 ? 'text-green-400' : 'text-yellow-400'}`}>
                                        {percentError.toFixed(2)}%
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Feedback */}
                    <FeedbackPanel feedback={resultsData.feedback} />

                </div>

                <div className="p-6 border-t border-gray-800 bg-gray-900 sticky bottom-0 flex justify-end gap-4">
                    <button
                        onClick={() => {
                            resetExperiment();
                            toggleResults();
                        }}
                        className="px-6 py-3 rounded text-gray-300 hover:bg-gray-800 transition-colors"
                    >
                        Try Again
                    </button>
                    <button
                        onClick={handleSaveAndExit}
                        disabled={isSaving}
                        className="px-8 py-3 rounded bg-blue-600 hover:bg-blue-500 text-white font-bold transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                        {isSaving ? 'Saving...' : 'Save & Exit'}
                    </button>
                </div>
            </div>
        </div>
    );
}
