import { create } from 'zustand'

interface UiState {
    showTutorial: boolean;
    showQuiz: boolean;
    showMolecular: boolean;
    showResults: boolean;
    showAssistant: boolean;
    sidebarTab: 'controls' | 'data' | 'chart';
    cameraResetKey: number;
    toggleTutorial: () => void;
    setShowQuiz: (show: boolean) => void;
    toggleMolecular: () => void;
    toggleAssistant: () => void;
    toggleResults: () => void;
    setSidebarTab: (tab: 'controls' | 'data' | 'chart') => void;
    resetCamera: () => void;
}

export const useUiStore = create<UiState>((set) => ({
    showTutorial: false,
    showQuiz: false,
    showMolecular: false,
    showAssistant: true,
    showResults: false,
    sidebarTab: 'controls',
    cameraResetKey: 0,
    toggleTutorial: () => set((state) => ({ showTutorial: !state.showTutorial })),
    setShowQuiz: (show) => set({ showQuiz: show }),
    toggleMolecular: () => set((state) => ({ showMolecular: !state.showMolecular })),
    toggleAssistant: () => set((state) => ({ showAssistant: !state.showAssistant })),
    toggleResults: () => set((state) => ({ showResults: !state.showResults })),
    setSidebarTab: (tab) => set({ sidebarTab: tab }),
    resetCamera: () => set((state) => ({ cameraResetKey: state.cameraResetKey + 1 })),
}))
