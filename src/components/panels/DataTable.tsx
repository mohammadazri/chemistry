import { useEffect, useRef } from 'react';
import { useExperimentStore } from '../../store/experimentStore';
import { getPhaseLabel, getEquivalenceVolume } from '../../lib/chemistry';

export default function DataTable() {
    const titrationData = useExperimentStore((state) => state.titrationData);
    const hclConcentration = useExperimentStore((state) => state.hclConcentration);
    const naohConcentration = useExperimentStore((state) => state.naohConcentration);

    const scrollRef = useRef<HTMLDivElement>(null);

    const equivVol = getEquivalenceVolume(hclConcentration, 25, naohConcentration);

    // Auto-scroll to bottom when data changes
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [titrationData]);

    const handleExportCSV = () => {
        const headers = ['Entry', 'Volume Added (mL)', 'pH', 'Phase'];
        const rows = titrationData.map((d, i) => [
            i + 1,
            d.volume.toFixed(2),
            d.ph.toFixed(2),
            getPhaseLabel(d.ph)
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(e => e.join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'titration_data.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Find the row closest to pH 7.0 for highlighting
    let closestIndex = -1;
    let minDiff = Infinity;
    titrationData.forEach((d, i) => {
        const diff = Math.abs(d.ph - 7.0);
        if (diff < minDiff) {
            minDiff = diff;
            closestIndex = i;
        }
    });

    return (
        <div className="flex flex-col h-full text-white">
            <div className="flex justify-between items-center mb-4">
                <div>
                    <h2 className="text-xl font-bold">Live Data Log</h2>
                    <p className="text-sm text-gray-400">Target: ~{equivVol.toFixed(2)} mL</p>
                </div>
                <button
                    onClick={handleExportCSV}
                    disabled={titrationData.length === 0}
                    className="bg-gray-700 hover:bg-gray-600 text-sm py-1 px-3 rounded text-gray-200 disabled:opacity-50"
                >
                    Export CSV
                </button>
            </div>

            <div className="flex-1 overflow-hidden flex flex-col border border-gray-700 rounded bg-gray-900">
                {/* Table Header */}
                <div className="grid grid-cols-4 gap-2 px-3 py-2 border-b border-gray-700 bg-gray-800 text-xs font-bold text-gray-400 uppercase">
                    <div className="text-center">#</div>
                    <div className="text-right">Vol (mL)</div>
                    <div className="text-right">pH</div>
                    <div className="text-center">Phase</div>
                </div>

                {/* Table Body */}
                <div ref={scrollRef} className="flex-1 overflow-y-auto w-full">
                    {titrationData.length === 0 ? (
                        <div className="text-center text-gray-500 mt-10">No data recorded yet.</div>
                    ) : (
                        <div className="flex flex-col">
                            {titrationData.map((d, i) => {
                                const phase = getPhaseLabel(d.ph);
                                const isClosest = i === closestIndex && Math.abs(d.ph - 7.0) < 1.0;

                                let phaseColor = 'text-green-400';
                                if (phase === 'Acidic') phaseColor = 'text-red-400';
                                if (phase === 'Basic') phaseColor = 'text-blue-400';

                                return (
                                    <div
                                        key={i}
                                        className={`grid grid-cols-4 gap-2 px-3 py-2 border-b border-gray-800 text-sm hover:bg-gray-800 transition-colors
                      ${isClosest ? 'bg-yellow-900/40 border-l-2 border-yellow-400' : ''}`}
                                    >
                                        <div className="text-center text-gray-500">{i + 1}</div>
                                        <div className="text-right font-mono text-gray-300">{d.volume.toFixed(2)}</div>
                                        <div className="text-right font-mono font-bold">{d.ph.toFixed(2)}</div>
                                        <div className={`text-center text-xs font-medium uppercase mt-0.5 ${phaseColor}`}>
                                            {phase}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
