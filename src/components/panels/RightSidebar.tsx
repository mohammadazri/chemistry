import { useUiStore } from '../../store/uiStore';
import { useExperimentStore } from '../../store/experimentStore';
import DataTable from './DataTable';
import PhCurveChart from './PhCurveChart';
import BuretteControls from './BuretteControls';
import { Table2, LineChart } from 'lucide-react';

export default function RightSidebar() {
    const sidebarTab = useUiStore((state) => state.sidebarTab);
    const setSidebarTab = useUiStore((state) => state.setSidebarTab);
    const currentPH = useExperimentStore((state) => state.currentPH);
    const volumeAdded = useExperimentStore((state) => state.volumeAdded);

    const activeClass = "flex-1 flex justify-center items-center gap-2 py-2.5 bg-indigo-600 text-white font-semibold rounded-lg shadow-md transition-all";
    const inactiveClass = "flex-1 flex justify-center items-center gap-2 py-2.5 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg font-medium transition-all cursor-pointer";

    return (
        <div className="w-full lg:w-[400px] xl:w-[450px] shrink-0 h-full bg-[#0F172A]/95 backdrop-blur-xl border-l border-indigo-500/10 flex flex-col shadow-[0_0_50px_rgba(0,0,0,0.5)] z-20">
            {/* Tab Navigation */}
            <div className="p-4 border-b border-indigo-500/10">
                <div className="flex bg-black/40 p-1 rounded-xl border border-white/5 shadow-inner">
                    <div
                        className={sidebarTab === 'data' ? activeClass : inactiveClass}
                        onClick={() => setSidebarTab('data')}
                    >
                        <Table2 className="w-4 h-4" />
                        <span className="text-sm">Data</span>
                    </div>
                    <div
                        className={sidebarTab === 'chart' ? activeClass : inactiveClass}
                        onClick={() => setSidebarTab('chart')}
                    >
                        <LineChart className="w-4 h-4" />
                        <span className="text-sm">Chart</span>
                    </div>
                </div>
            </div>

            {/* Tab Content Area */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden p-6 customized-scrollbar">
                {sidebarTab === 'data' && <DataTable />}
                {sidebarTab === 'chart' && <PhCurveChart />}
            </div>

            {/* Bottom Controls / Status */}
            <div className="mt-auto border-t border-indigo-500/10 p-5 bg-gradient-to-b from-[#0F172A] to-[#0a0f1a] relative shadow-[-10px_-10px_30px_rgba(0,0,0,0.5)] z-30">
                <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent" />
                <BuretteControls />

                <div className="flex justify-between items-center mt-6 bg-[#050810] p-4 rounded-2xl border border-white/5 shadow-inner">
                    <div className="flex flex-col">
                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Current pH</span>
                        <div className="text-3xl font-mono font-bold text-emerald-400 tracking-tight" style={{ textShadow: '0 0 15px rgba(52,211,153,0.3)' }}>
                            {currentPH.toFixed(2)}
                        </div>
                    </div>
                    <div className="w-[1px] h-12 bg-white/10 mx-4" />
                    <div className="flex flex-col text-right">
                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Vol Added</span>
                        <div className="text-3xl font-mono font-bold text-blue-400 tracking-tight" style={{ textShadow: '0 0 15px rgba(96,165,250,0.3)' }}>
                            {volumeAdded.toFixed(2)}<span className="text-lg text-blue-500/50 ml-1">mL</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
