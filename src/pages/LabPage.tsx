import LabScene from '../components/lab/LabScene';

export default function LabPage() {
    return (
        <div className="flex w-full h-screen overflow-hidden">
            <LabScene />
            <div className="w-[30%] h-full bg-gray-900 border-l border-gray-700">
                {/* Placeholder for RightSidebar */}
                <div className="p-8 text-white h-full flex flex-col items-center justify-center">
                    <p className="text-xl">Sidebar Panel</p>
                </div>
            </div>
        </div>
    );
}
