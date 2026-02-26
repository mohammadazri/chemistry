import { useState } from 'react';
import { useExperimentStore } from '../../store/experimentStore';
import { getEquivalenceVolume } from '../../lib/chemistry';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
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
        // We want absolute rate of change since pH drops
        return { volume: d.volume, val: dV !== 0 ? Math.abs(dph / dV) : 0 };
    });

    const chartData = {
        labels: titrationData.map(d => d.volume.toFixed(2)),
        datasets: [
            {
                label: 'pH',
                data: titrationData.map(d => d.ph),
                borderColor: 'rgba(59, 130, 246, 1)', // blue-500
                backgroundColor: 'rgba(59, 130, 246, 0.5)',
                tension: 0.4,
                pointRadius: 2,
                yAxisID: 'y'
            },
            // Target Equivalence Line
            {
                label: 'Target Equivalence',
                data: titrationData.map(d => d.volume >= equivVol ? d.ph : null),
                borderColor: 'rgba(239, 68, 68, 0.4)', // red dashed
                borderDash: [5, 5],
                pointRadius: 0,
                yAxisID: 'y'
            },
            // Derivative Line
            ...(showDerivative ? [{
                label: 'Derivative (dpH/dV)',
                data: derivativeData.map(d => d.val),
                borderColor: 'rgba(245, 158, 11, 0.8)', // amber-500
                borderDash: [2, 2],
                tension: 0.2,
                pointRadius: 0,
                yAxisID: 'y1'
            }] : [])
        ]
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 0 }, // Disable animation for real-time feel
        plugins: {
            legend: {
                labels: { color: '#e5e7eb' }, // gray-200
                position: 'top' as const,
            },
            title: {
                display: true,
                text: 'Titration Curve: HCl vs NaOH',
                color: '#f9fafb', // gray-50
                font: { size: 16 }
            }
        },
        scales: {
            x: {
                grid: { color: '#374151' }, // gray-700
                ticks: { color: '#9ca3af' }, // gray-400
                title: { display: true, text: 'Volume HCl Added (mL)', color: '#d1d5db' } // gray-300
            },
            y: {
                type: 'linear' as const,
                display: true,
                position: 'left' as const,
                min: 0,
                max: 14,
                grid: { color: '#374151' },
                ticks: { color: '#9ca3af' },
                title: { display: true, text: 'pH', color: '#d1d5db' }
            },
            y1: {
                type: 'linear' as const,
                display: showDerivative,
                position: 'right' as const,
                grid: { drawOnChartArea: false },
                ticks: { color: '#fbbf24' }, // amber-400
                title: { display: showDerivative, text: 'dpH/dV', color: '#fbbf24' }
            }
        }
    };

    return (
        <div className="flex flex-col h-full text-white">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Real-time Graph</h2>
                <button
                    onClick={() => setShowDerivative(!showDerivative)}
                    className={`text-sm py-1 px-3 rounded transition-colors
            ${showDerivative ? 'bg-amber-600 hover:bg-amber-500 text-white' : 'bg-gray-700 hover:bg-gray-600 text-gray-200'}`}
                >
                    {showDerivative ? 'Hide Derivative' : 'Show Derivative'}
                </button>
            </div>

            <div className="flex-1 w-full relative bg-gray-900 rounded border border-gray-700 p-2">
                {titrationData.length === 0 ? (
                    <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                        Start adding volume to plot curve
                    </div>
                ) : (
                    <Line options={options} data={chartData} />
                )}
            </div>
        </div>
    );
}
