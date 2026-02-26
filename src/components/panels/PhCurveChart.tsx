import { useState } from 'react';
import { useExperimentStore } from '../../store/experimentStore';
import { getEquivalenceVolume } from '../../lib/chemistry';
import { Eye, EyeOff } from 'lucide-react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

export default function PhCurveChart() {
    const titrationData = useExperimentStore((state) => state.titrationData);
    const hclConcentration = useExperimentStore((state) => state.hclConcentration);
    const naohConcentration = useExperimentStore((state) => state.naohConcentration);
    const [showDerivative, setShowDerivative] = useState(false);

    const equivVol = getEquivalenceVolume(hclConcentration, 25, naohConcentration);

    // Calculate derivative (dpH/dV)
    const derivativeData = titrationData.map((d, i, arr) => {
        if (i === 0) return { volume: d.volume, val: 0 };
        const prev = arr[i - 1];
        const dV = d.volume - prev.volume;
        const dph = d.ph - prev.ph;
        return { volume: d.volume, val: dV !== 0 ? Math.abs(dph / dV) : 0 };
    });

    const chartData = {
        labels: titrationData.map(d => d.volume.toFixed(2)),
        datasets: [
            {
                label: 'pH Level',
                data: titrationData.map(d => d.ph),
                borderColor: 'rgba(99, 102, 241, 1)', // Indigo 500
                backgroundColor: 'rgba(99, 102, 241, 0.1)',
                fill: true,
                tension: 0.4,
                pointRadius: titrationData.length > 50 ? 0 : 3,
                pointBackgroundColor: 'rgba(165, 180, 252, 1)',
                pointBorderWidth: 0,
                pointHoverRadius: 6,
                yAxisID: 'y'
            },
            // Target Equivalence Line
            {
                label: 'Equivalence Target',
                data: titrationData.map(d => d.volume >= equivVol ? d.ph : null),
                borderColor: 'rgba(52, 211, 153, 0.6)', // Emerald 400
                borderDash: [5, 5],
                borderWidth: 2,
                pointRadius: 0,
                yAxisID: 'y'
            },
            // Derivative Line
            ...(showDerivative ? [{
                label: 'Rate of Change (dpH/dV)',
                data: derivativeData.map(d => d.val),
                borderColor: 'rgba(245, 158, 11, 0.9)', // Amber 500
                borderDash: [3, 3],
                borderWidth: 2,
                tension: 0.3,
                pointRadius: 0,
                yAxisID: 'y1'
            }] : [])
        ]
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 0 },
        interaction: {
            mode: 'index' as const,
            intersect: false,
        },
        plugins: {
            legend: {
                labels: {
                    color: '#94a3b8',
                    usePointStyle: true,
                    boxWidth: 8,
                    font: { family: "'Inter', sans-serif", size: 12, weight: 'bold' }
                },
                position: 'top' as const,
                align: 'end' as const,
            },
            tooltip: {
                backgroundColor: 'rgba(15, 23, 42, 0.9)',
                titleColor: '#e2e8f0',
                bodyColor: '#cbd5e1',
                borderColor: 'rgba(99, 102, 241, 0.3)',
                borderWidth: 1,
                padding: 12,
                cornerRadius: 8,
                titleFont: { family: "'Inter', sans-serif", size: 13 },
                bodyFont: { family: "'Inter', sans-serif", size: 12 }
            }
        },
        scales: {
            x: {
                grid: { color: 'rgba(51, 65, 85, 0.3)', drawBorder: false },
                ticks: { color: '#64748b', font: { family: "'Inter', sans-serif", size: 10 } },
                title: { display: true, text: 'Volume of NaOH Added (mL)', color: '#94a3b8', font: { size: 12, weight: 'bold' } }
            },
            y: {
                type: 'linear' as const,
                display: true,
                position: 'left' as const,
                min: 0,
                max: 14,
                grid: { color: 'rgba(51, 65, 85, 0.3)', drawBorder: false },
                ticks: { color: '#64748b', font: { family: "'Inter', sans-serif", size: 10 } },
                title: { display: true, text: 'pH Level', color: '#94a3b8', font: { size: 12, weight: 'bold' } }
            },
            y1: {
                type: 'linear' as const,
                display: showDerivative,
                position: 'right' as const,
                grid: { drawOnChartArea: false },
                ticks: { color: '#f59e0b', font: { family: "'Inter', sans-serif", size: 10 } },
                title: { display: showDerivative, text: 'dpH/dV', color: '#f59e0b', font: { size: 12, weight: 'bold' } }
            }
        }
    };

    return (
        <div className="flex flex-col h-full text-white">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold tracking-tight">Titration Curve</h2>
                <button
                    onClick={() => setShowDerivative(!showDerivative)}
                    className={`flex items-center gap-2 text-xs py-1.5 px-3 rounded-lg transition-all font-medium border shadow-sm
            ${showDerivative
                            ? 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border-amber-500/30'
                            : 'bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white border-white/10'}`}
                >
                    {showDerivative ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    Derivative
                </button>
            </div>

            <div className="flex-1 w-full relative bg-[#0F172A]/50 rounded-2xl border border-indigo-500/10 p-4 shadow-inner">
                {titrationData.length === 0 ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-indigo-300/50 space-y-3">
                        <div className="w-8 h-8 rounded-full border border-indigo-500/30 border-t-indigo-400 animate-spin" />
                        <div className="text-sm font-medium tracking-wide">Awaiting data to plot curve...</div>
                    </div>
                ) : (
                    <Line options={options as any} data={chartData} />
                )}
            </div>
        </div>
    );
}
