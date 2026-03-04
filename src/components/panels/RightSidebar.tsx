import { useUiStore } from '../../store/uiStore';
import { useExperimentStore } from '../../store/experimentStore';
import DataTable from './DataTable';
import PhCurveChart from './PhCurveChart';
import BuretteControls from './BuretteControls';
import { Table2, LineChart, SlidersHorizontal } from 'lucide-react';

export default function RightSidebar() {
    const sidebarTab = useUiStore((state) => state.sidebarTab);
    const setSidebarTab = useUiStore((state) => state.setSidebarTab);
    const currentPH = useExperimentStore((state) => state.currentPH);
    const volumeAdded = useExperimentStore((state) => state.volumeAdded);

    const activeClass = "flex-1 flex justify-center items-center gap-2 py-2.5 bg-indigo-600 text-white font-semibold rounded-lg shadow-md transition-all";
    const inactiveClass = "flex-1 flex justify-center items-center gap-2 py-2.5 text-muted-foreground hover:text-foreground hover:bg-muted font-medium transition-all cursor-pointer";

    return (
        <div className="w-full lg:w-[400px] xl:w-[450px] shrink-0 max-h-[45vh] lg:max-h-full h-auto lg:h-full bg-card/95 backdrop-blur-xl border-t lg:border-t-0 lg:border-l border-indigo-500/10 flex flex-col shadow-[0_0_50px_rgba(0,0,0,0.5)] z-20 overflow-hidden">
            {/* Tab Navigation */}
            <div className="p-4 border-b border-indigo-500/10">
                <div className="flex bg-muted/40 p-1 rounded-xl border border-border shadow-inner">
                    <div
                        className={sidebarTab === 'controls' ? activeClass : inactiveClass}
                        onClick={() => setSidebarTab('controls')}
                    >
                        <SlidersHorizontal className="w-4 h-4" />
                        <span className="text-sm">Controls</span>
                    </div>
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
            <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6 customized-scrollbar flex flex-col">
                {sidebarTab === 'controls' && (
                    <div className="flex-1 flex flex-col pt-4">
                        <BuretteControls />

                        <div className="flex justify-between items-center mt-auto bg-background/50 p-4 rounded-2xl border border-border/50 shadow-inner">
                            <div className="flex flex-col">
                                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Current pH</span>
                                <div className="text-3xl font-mono font-bold text-emerald-600 dark:text-emerald-400 tracking-tight" style={{ textShadow: '0 0 15px rgba(52,211,153,0.3)' }}>
                                    {currentPH.toFixed(2)}
                                </div>
                            </div>
                            <div className="w-[1px] h-12 bg-border/50 mx-4" />
                            <div className="flex flex-col text-right">
                                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Vol Added</span>
                                <div className="text-3xl font-mono font-bold text-blue-600 dark:text-blue-400 tracking-tight" style={{ textShadow: '0 0 15px rgba(96,165,250,0.3)' }}>
                                    {volumeAdded.toFixed(2)}<span className="text-lg text-blue-600/50 dark:text-blue-500/50 ml-1">mL</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                {sidebarTab === 'data' && <DataTable />}
                {sidebarTab === 'chart' && <PhCurveChart />}
            </div>
        </div>
    );
}
