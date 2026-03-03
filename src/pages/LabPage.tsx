import LabScene from '../components/lab/LabScene';
import RightSidebar from '../components/panels/RightSidebar';
import TutorialOverlay from '../components/tutorial/TutorialOverlay';
import QuizModal from '../components/tutorial/QuizModal';
import ResultsModal from '../components/results/ResultsModal';
import LabAssistant from '../components/lab/LabAssistant';
import LabToolbar from '../components/lab/LabToolbar';

export default function LabPage() {
    return (
        <div className="flex flex-col flex-1 w-full overflow-hidden bg-background relative">

            <LabToolbar />

            <TutorialOverlay />
            <QuizModal />
            <ResultsModal />

            <div className="flex flex-col lg:flex-row flex-1 overflow-hidden relative w-full h-full bg-background">
                {/* 3D Scene */}
                <div className="flex-[2] lg:flex-[3] min-h-[50vh] lg:min-h-0 relative w-full h-full">
                    <LabAssistant />
                    <LabScene />
                </div>

                {/* Sidebar Controls */}
                <RightSidebar />
            </div>
        </div>
    );
}
