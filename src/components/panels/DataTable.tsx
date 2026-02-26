import { useEffect, useRef } from 'react';
import { useExperimentStore } from '../../store/experimentStore';
import { getPhaseLabel, getEquivalenceVolume } from '../../lib/chemistry';
import { Download } from 'lucide-react';

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
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-xl font-bold tracking-tight">Live Data Log</h2>
                    <p className="text-xs text-indigo-300/70 font-medium uppercase tracking-wider mt-1">Target: ~{equivVol.toFixed(2)} mL</p>
                </div>
                <button
                    onClick={handleExportCSV}
                    disabled={titrationData.length === 0}
                    className="flex items-center gap-2 bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 text-xs py-1.5 px-3 rounded-lg text-gray-200 disabled:opacity-50 transition-all font-medium shadow-sm"
                >
                    <Download className="w-3 h-3" />
                    Export CSV
                </button>
            </div>

            <div className="flex-1 overflow-hidden flex flex-col border border-indigo-500/20 rounded-2xl bg-[#0a0f1a]/50 shadow-inner backdrop-blur-sm relative">
                {/* Table Header */}
                <div className="grid grid-cols-4 gap-2 px-4 py-3 border-b border-indigo-500/20 bg-indigo-500/5 text-[10px] font-bold text-indigo-300 uppercase tracking-widest sticky top-0 z-10 backdrop-blur-md">
                    <div className="text-center">#</div>
                    <div className="text-right">Vol (mL)</div>
                    <div className="text-right">pH</div>
                    <div className="text-center">Phase</div>
                </div>

                {/* Table Body */}
                <div ref={scrollRef} className="flex-1 overflow-y-auto w-full customized-scrollbar">
                    {titrationData.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-indigo-300/50 space-y-3">
                            <div className="w-8 h-8 rounded-full border border-indigo-500/30 border-t-indigo-400 animate-spin" />
                            <div className="text-sm font-medium tracking-wide">Awaiting data points...</div>
                        </div>
                    ) : (
                        <div className="flex flex-col pb-2">
                            {titrationData.map((d, i) => {
                                const phase = getPhaseLabel(d.ph);
                                const isClosest = i === closestIndex && Math.abs(d.ph - 7.0) < 1.0;

                                let phaseColor = 'text-green-400 bg-green-500/10 border-green-500/20';
                                if (phase === 'Acidic') phaseColor = 'text-red-400 bg-red-500/10 border-red-500/20';
                                if (phase === 'Basic') phaseColor = 'text-blue-400 bg-blue-500/10 border-blue-500/20';

                                return (
                                    <div
                                        key={i}
                                        className={`grid grid-cols-4 gap-2 px-4 py-2.5 border-b border-white/5 text-sm hover:bg-white/5 transition-colors items-center
                      ${isClosest ? 'bg-indigo-500/20 border-l-2 border-l-indigo-400 shadow-[inset_0_0_15px_rgba(99,102,241,0.15)] relative overflow-hidden' : ''}`}
                                    >
                                        {isClosest && <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-transparent pointer-events-none" />}
                                        <div className="text-center text-gray-500 font-mono text-xs">{i + 1}</div>
                                        <div className="text-right font-mono text-gray-300 relative z-10">{d.volume.toFixed(2)}</div>
                                        <div className="text-right font-mono font-bold text-white relative z-10 drop-shadow-md">{d.ph.toFixed(2)}</div>
                                        <div className="flex justify-center relative z-10">
                                            <div className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md border ${phaseColor}`}>
                                                {phase}
                                            </div>
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
