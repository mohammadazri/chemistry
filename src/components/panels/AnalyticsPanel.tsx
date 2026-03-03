import DataTable from './DataTable';
import PhCurveChart from './PhCurveChart';
import { Table2, LineChart } from 'lucide-react';

export default function AnalyticsPanel() {
    return (
        <div className="w-[450px] xl:w-[500px] h-full bg-card/95 backdrop-blur-xl border-r border-indigo-500/10 flex flex-col shadow-2xl z-20">
            <div className="p-4 border-b border-indigo-500/10 bg-black/20 flex items-center justify-between">
                <h2 className="text-sm font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-2">
                    <Table2 className="w-4 h-4" />
                    Experiment Analytics
                </h2>
                <div className="flex gap-2">
                    {/* Future Export Buttons will go here */}
                </div>
            </div>

            <div className="flex-1 overflow-y-auto customized-scrollbar p-6 flex flex-col gap-8">
                {/* Data Table Section */}
                <section>
                    <div className="flex items-center gap-2 mb-4 text-gray-300">
                        <Table2 className="w-4 h-4 text-indigo-400" />
                        <h3 className="font-semibold text-sm uppercase tracking-wider">Live Data Log</h3>
                    </div>
                    <div className="max-h-[300px] overflow-y-auto customized-scrollbar rounded-xl border border-white/5 bg-black/40 shadow-inner">
                        <DataTable />
                    </div>
                </section>

                {/* Charting Section */}
                <section className="flex-1 flex flex-col min-h-[400px]">
                    <div className="flex items-center gap-2 mb-4 text-gray-300">
                        <LineChart className="w-4 h-4 text-purple-400" />
                        <h3 className="font-semibold text-sm uppercase tracking-wider">Titration Curves</h3>
                    </div>
                    <div className="flex-1 -mx-2 bg-white/5 rounded-xl border border-white/5 p-4 relative shadow-inner">
                        <PhCurveChart />
                    </div>
                </section>
            </div>
        </div>
    );
}
