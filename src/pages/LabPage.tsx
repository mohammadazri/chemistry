import LabScene from '../components/lab/LabScene';
import RightSidebar from '../components/panels/RightSidebar';
import TutorialOverlay from '../components/tutorial/TutorialOverlay';
import QuizModal from '../components/tutorial/QuizModal';
import ResultsModal from '../components/results/ResultsModal';

export default function LabPage() {
    return (
        <div className="flex w-full h-screen overflow-hidden">
            <TutorialOverlay />
            <QuizModal />
            <ResultsModal />
            <LabScene />
            <RightSidebar />
        </div>
    );
}
