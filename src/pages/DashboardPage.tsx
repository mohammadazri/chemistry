import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useUserStore } from '../store/userStore';

interface ExperimentSummary {
    id: string;
    score: number;
    percentageError: number;
    calculatedConcentration: number;
    createdAt: string;
}

export default function DashboardPage() {
    const navigate = useNavigate();
    const { user, token, logout } = useUserStore();
    const [experiments, setExperiments] = useState<ExperimentSummary[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!token) {
            navigate('/');
            return;
        }

        const fetchExperiments = async () => {
            try {
                const res = await axios.get('http://localhost:3001/api/experiments/mine', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setExperiments(res.data);
            } catch (err) {
                console.error('Failed to load past experiments:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchExperiments();
    }, [token, navigate]);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    if (!user) return null;

    return (
        <div className="min-h-screen bg-[#0a0f1a] text-white p-8">
            {/* Navigation Bar */}
            <nav className="flex justify-between items-center mb-12 py-4 border-b border-gray-800">
                <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">
                    HoloLab
                </h1>
                <div className="flex items-center gap-6">
                    <span className="text-gray-300">Welcome, {user.name}</span>
                    <button
                        onClick={handleLogout}
                        className="text-gray-400 hover:text-white transition-colors"
                    >
                        Sign Out
                    </button>
                </div>
            </nav>

            <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Welcome Section */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                        <h2 className="text-xl font-bold mb-2">Ready to experiment?</h2>
                        <p className="text-gray-400 mb-6 text-sm">
                            In this module, you will perform a strong acid-strong base titration to determine the unknown concentration of an HCl solution.
                        </p>
                        <button
                            onClick={() => navigate('/lab')}
                            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                        >
                            Start New Lab Wait
                        </button>
                    </div>
                </div>

                {/* Recent Experiments Section */}
                <div className="lg:col-span-2">
                    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 h-full">
                        <h2 className="text-xl font-bold mb-6">Your Past Experiments</h2>

                        {loading ? (
                            <div className="text-center text-gray-500 py-12">Loading data...</div>
                        ) : experiments.length === 0 ? (
                            <div className="text-center text-gray-500 py-12 border-2 border-dashed border-gray-800 rounded-lg">
                                No past experiments found.<br />Click 'Start New Lab' to begin.
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="border-b border-gray-800 text-gray-400 text-sm">
                                            <th className="pb-3 font-medium">Date</th>
                                            <th className="pb-3 font-medium">Found Conc. (M)</th>
                                            <th className="pb-3 font-medium">Error Margin</th>
                                            <th className="pb-3 font-medium">Score</th>
                                            <th className="pb-3 font-medium">Grade</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-gray-300 text-sm">
                                        {experiments.map((exp) => {
                                            const grade = exp.score >= 90 ? 'A' : exp.score >= 80 ? 'B' : exp.score >= 70 ? 'C' : 'F';
                                            let gradeColor = 'text-green-400';
                                            if (grade === 'B') gradeColor = 'text-blue-400';
                                            if (grade === 'C') gradeColor = 'text-yellow-400';
                                            if (grade === 'F') gradeColor = 'text-red-400';

                                            return (
                                                <tr key={exp.id} className="border-b border-gray-800 hover:bg-gray-800/50 transition-colors">
                                                    <td className="py-4 truncate max-w-[150px]">
                                                        {new Date(exp.createdAt).toLocaleDateString()}
                                                    </td>
                                                    <td className="py-4 font-mono">{exp.calculatedConcentration.toFixed(4)}</td>
                                                    <td className="py-4">
                                                        <span className={exp.percentageError <= 2 ? 'text-green-400' : 'text-amber-400'}>
                                                            {exp.percentageError.toFixed(2)}%
                                                        </span>
                                                    </td>
                                                    <td className="py-4 font-mono">{exp.score} / 100</td>
                                                    <td className={`py-4 font-bold ${gradeColor}`}>{grade}</td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}
