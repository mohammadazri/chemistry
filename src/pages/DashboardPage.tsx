import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useUserStore } from '../store/userStore';
import { Beaker, TrendingUp, Award, Clock, ArrowRight, LogOut, FileText } from 'lucide-react';

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

    // Calculate aggregated stats
    const totalExperiments = experiments.length;
    const averageScore = totalExperiments > 0 ? Math.round(experiments.reduce((acc, curr) => acc + curr.score, 0) / totalExperiments) : 0;
    const bestScore = totalExperiments > 0 ? Math.max(...experiments.map(e => e.score)) : 0;

    return (
        <div className="flex-1 min-h-full bg-[#0a0f1a] text-white p-4 sm:p-8 overflow-hidden relative pb-16">
            {/* Background Glows */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />

            <div className="max-w-7xl mx-auto relative z-10 pt-4">
                {/* Dashboard Header / Hero */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4">
                    <div>
                        <h1 className="text-4xl font-bold mb-2 tracking-tight">
                            Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">{user.name}</span>!
                        </h1>
                        <p className="text-gray-400">Track your progress and start your next virtual chemistry session.</p>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-red-500/20 text-gray-300 hover:text-red-400 rounded-xl transition-all border border-white/10 hover:border-red-500/30 font-medium shadow-sm hover:shadow-red-500/10 group"
                    >
                        <LogOut className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                        <span>Sign Out</span>
                    </button>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                    <div className="bg-[#0F172A]/80 backdrop-blur-md border border-white/10 rounded-3xl p-6 flex items-center gap-5 hover:border-white/20 hover:bg-[#1e293b]/80 transition-all shadow-xl shadow-black/20 group">
                        <div className="w-14 h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center border border-blue-500/20 text-blue-400 group-hover:scale-110 group-hover:bg-blue-500/20 transition-all duration-300">
                            <Beaker className="w-7 h-7" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-400 font-medium mb-1 tracking-wide uppercase">Lab Sessions</p>
                            <p className="text-3xl font-extrabold">{totalExperiments}</p>
                        </div>
                    </div>

                    <div className="bg-[#0F172A]/80 backdrop-blur-md border border-white/10 rounded-3xl p-6 flex items-center gap-5 hover:border-white/20 hover:bg-[#1e293b]/80 transition-all shadow-xl shadow-black/20 group">
                        <div className="w-14 h-14 bg-indigo-500/10 rounded-2xl flex items-center justify-center border border-indigo-500/20 text-indigo-400 group-hover:scale-110 group-hover:bg-indigo-500/20 transition-all duration-300">
                            <TrendingUp className="w-7 h-7" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-400 font-medium mb-1 tracking-wide uppercase">Avg Score</p>
                            <p className="text-3xl font-extrabold">{averageScore}<span className="text-base text-gray-500 ml-1 font-semibold">/100</span></p>
                        </div>
                    </div>

                    <div className="bg-[#0F172A]/80 backdrop-blur-md border border-white/10 rounded-3xl p-6 flex items-center gap-5 hover:border-white/20 hover:bg-[#1e293b]/80 transition-all shadow-xl shadow-black/20 group">
                        <div className="w-14 h-14 bg-purple-500/10 rounded-2xl flex items-center justify-center border border-purple-500/20 text-purple-400 group-hover:scale-110 group-hover:bg-purple-500/20 transition-all duration-300">
                            <Award className="w-7 h-7" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-400 font-medium mb-1 tracking-wide uppercase">Best Score</p>
                            <p className="text-3xl font-extrabold flex items-baseline">{bestScore}<span className="text-base text-gray-500 ml-1 font-semibold">/100</span></p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Action Card */}
                    <div className="lg:col-span-1">
                        <div className="relative bg-gradient-to-br from-[#1e1b4b]/80 to-[#172554]/80 backdrop-blur-xl border border-indigo-500/30 rounded-[2rem] p-8 overflow-hidden group h-full flex flex-col justify-center shadow-2xl shadow-indigo-900/20">
                            {/* Decorative Grid */}
                            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] mix-blend-overlay"></div>

                            {/* Glowing effect inside card */}
                            <div className="absolute -top-1/2 -right-1/2 w-full h-full bg-indigo-500/20 blur-[80px] rounded-full group-hover:bg-indigo-500/30 transition-colors duration-700" />

                            <div className="relative z-10 text-center flex flex-col items-center">
                                <div className="mx-auto w-24 h-24 bg-indigo-500/20 rounded-full flex items-center justify-center mb-8 border border-indigo-400/30 shadow-[0_0_30px_rgba(99,102,241,0.3)] group-hover:scale-110 group-hover:shadow-[0_0_40px_rgba(99,102,241,0.5)] transition-all duration-500">
                                    <Beaker className="w-10 h-10 text-indigo-300" />
                                </div>

                                <h2 className="text-2xl font-bold mb-3 text-white tracking-tight">Acid-Base Titration</h2>
                                <p className="text-indigo-200/70 mb-10 text-sm leading-relaxed max-w-[250px] mx-auto">
                                    Determine the unknown concentration of an HCl solution using sodium hydroxide.
                                </p>

                                <button
                                    onClick={() => navigate('/lab')}
                                    className="w-full relative overflow-hidden rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 p-[1px] hover:shadow-[0_0_30px_rgba(99,102,241,0.5)] transition-all group/btn mt-auto"
                                >
                                    <div className="absolute inset-0 bg-white/20 group-hover/btn:bg-transparent transition-colors duration-300" />
                                    <div className="relative flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 rounded-xl">
                                        <span className="text-white font-bold text-lg tracking-wide">Enter Virtual Lab</span>
                                        <ArrowRight className="w-5 h-5 text-white group-hover/btn:translate-x-1.5 transition-transform" />
                                    </div>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Table Section */}
                    <div className="lg:col-span-2">
                        <div className="bg-[#0F172A]/80 backdrop-blur-md border border-white/10 rounded-[2rem] p-8 h-full shadow-2xl shadow-black/40 flex flex-col">
                            <div className="flex items-center gap-3 mb-8">
                                <div className="p-2 bg-indigo-500/10 rounded-lg border border-indigo-500/20">
                                    <FileText className="w-5 h-5 text-indigo-400" />
                                </div>
                                <h2 className="text-xl font-bold tracking-tight">Experiment History</h2>
                            </div>

                            {loading ? (
                                <div className="flex-1 flex flex-col items-center justify-center space-y-4">
                                    <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                                    <p className="text-gray-400 font-medium">Loading history...</p>
                                </div>
                            ) : experiments.length === 0 ? (
                                <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-2xl bg-white/[0.02]">
                                    <Clock className="w-12 h-12 text-gray-500 mb-4 opacity-50" />
                                    <p className="text-gray-300 font-semibold text-lg">No lab history</p>
                                    <p className="text-sm text-gray-500 mt-1 max-w-[200px] text-center">Complete your first titration to see your results here.</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto rounded-xl border border-white/5 bg-white/[0.01]">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-white/5 text-gray-400 text-xs font-semibold tracking-wider uppercase">
                                                <th className="px-6 py-4 rounded-tl-xl">Date</th>
                                                <th className="px-6 py-4">Conc. (M)</th>
                                                <th className="px-6 py-4">Error Margin</th>
                                                <th className="px-6 py-4">Score</th>
                                                <th className="px-6 py-4 rounded-tr-xl">Grade</th>
                                            </tr>
                                        </thead>
                                        <tbody className="text-gray-300 text-sm divide-y divide-white/5">
                                            {experiments.map((exp) => {
                                                const grade = exp.score >= 90 ? 'A' : exp.score >= 80 ? 'B' : exp.score >= 70 ? 'C' : 'F';

                                                let badgeClass = "bg-green-500/10 text-green-400 border-green-500/20 shadow-[0_0_10px_rgba(34,197,94,0.1)]";
                                                if (grade === 'B') badgeClass = "bg-blue-500/10 text-blue-400 border-blue-500/20 shadow-[0_0_10px_rgba(59,130,246,0.1)]";
                                                if (grade === 'C') badgeClass = "bg-yellow-500/10 text-yellow-400 border-yellow-500/20 shadow-[0_0_10px_rgba(234,179,8,0.1)]";
                                                if (grade === 'F') badgeClass = "bg-red-500/10 text-red-500 border-red-500/20 shadow-[0_0_10px_rgba(239,68,68,0.1)]";

                                                return (
                                                    <tr key={exp.id} className="hover:bg-white/[0.04] transition-colors group">
                                                        <td className="px-6 py-5 whitespace-nowrap text-gray-400 font-medium">
                                                            {new Date(exp.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                                        </td>
                                                        <td className="px-6 py-5 font-mono font-medium text-white">{exp.calculatedConcentration.toFixed(4)}</td>
                                                        <td className="px-6 py-5">
                                                            <div className="flex items-center gap-2">
                                                                <div className={`w-2 h-2 rounded-full shadow-[0_0_5px_currentColor] ${exp.percentageError <= 2 ? 'bg-green-400 text-green-400' : exp.percentageError <= 5 ? 'bg-yellow-400 text-yellow-400' : 'bg-red-400 text-red-400'}`}></div>
                                                                <span className={`font-medium ${exp.percentageError <= 2 ? 'text-green-300' : exp.percentageError <= 5 ? 'text-yellow-300' : 'text-red-300'}`}>
                                                                    {exp.percentageError.toFixed(2)}%
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-5">
                                                            <div className="flex items-baseline gap-1">
                                                                <span className="font-bold text-white text-base">{exp.score}</span>
                                                                <span className="text-xs text-gray-500 font-semibold">/100</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-5">
                                                            <span className={`inline-flex items-center justify-center w-9 h-9 rounded-xl border font-bold text-sm ${badgeClass}`}>
                                                                {grade}
                                                            </span>
                                                        </td>
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
        </div>
    );
}
