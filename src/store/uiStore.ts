import { create } from 'zustand'

interface UiState {
    showTutorial: boolean;
    showQuiz: boolean;
    showMolecular: boolean;
    showResults: boolean;
    sidebarTab: 'steps' | 'data' | 'chart';
    toggleTutorial: () => void;
    setShowQuiz: (show: boolean) => void;
    toggleMolecular: () => void;
    toggleResults: () => void;
    setSidebarTab: (tab: 'steps' | 'data' | 'chart') => void;
}

export const useUiStore = create<UiState>((set) => ({
    showTutorial: true,
    showQuiz: false,
    showMolecular: false,
    showResults: false,
    sidebarTab: 'steps',
    toggleTutorial: () => set((state) => ({ showTutorial: !state.showTutorial })),
    setShowQuiz: (show) => set({ showQuiz: show }),
    toggleMolecular: () => set((state) => ({ showMolecular: !state.showMolecular })),
    toggleResults: () => set((state) => ({ showResults: !state.showResults })),
    setSidebarTab: (tab) => set({ sidebarTab: tab }),
}))
