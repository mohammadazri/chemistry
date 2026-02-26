import { useUiStore } from '../../store/uiStore';
import { useExperimentStore } from '../../store/experimentStore';
import StepInstructions from './StepInstructions';
import DataTable from './DataTable';
import PhCurveChart from './PhCurveChart';
import BuretteControls from './BuretteControls';

export default function RightSidebar() {
    const sidebarTab = useUiStore((state) => state.sidebarTab);
    const setSidebarTab = useUiStore((state) => state.setSidebarTab);
    const currentPH = useExperimentStore((state) => state.currentPH);
    const volumeAdded = useExperimentStore((state) => state.volumeAdded);

    const activeClass = "flex-1 pb-2 border-b-2 border-blue-500 text-blue-400 font-medium text-center";
    const inactiveClass = "flex-1 pb-2 text-gray-400 hover:text-gray-200 text-center cursor-pointer";

    return (
        <div className="w-[30%] h-full bg-gray-900 border-l border-gray-700 flex flex-col pt-4">
            {/* Tab Navigation */}
            <div className="flex px-4 border-b border-gray-700 mb-4">
                <div
                    className={sidebarTab === 'steps' ? activeClass : inactiveClass}
                    onClick={() => setSidebarTab('steps')}
                >
                    Steps
                </div>
                <div
                    className={sidebarTab === 'data' ? activeClass : inactiveClass}
                    onClick={() => setSidebarTab('data')}
                >
                    Data
                </div>
                <div
                    className={sidebarTab === 'chart' ? activeClass : inactiveClass}
                    onClick={() => setSidebarTab('chart')}
                >
                    Chart
                </div>
            </div>

            {/* Tab Content Area */}
            <div className="flex-1 overflow-y-auto px-6">
                {sidebarTab === 'steps' && <StepInstructions />}
                {sidebarTab === 'data' && <DataTable />}
                {sidebarTab === 'chart' && <PhCurveChart />}
            </div>

            {/* Bottom Controls / Status */}
            <div className="mt-auto border-t border-gray-700 p-4 bg-gray-800">
                <BuretteControls />
                <div className="flex justify-between items-center mt-4">
                    <div className="text-2xl font-mono text-green-400">
                        {currentPH.toFixed(2)} pH
                    </div>
                    <div className="text-xl font-mono text-blue-300">
                        {volumeAdded.toFixed(2)} mL
                    </div>
                </div>
            </div>
        </div>
    );
}
