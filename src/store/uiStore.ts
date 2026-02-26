import { create } from 'zustand'

interface UiState {
    showTutorial: boolean;
    showQuiz: boolean;
    showMolecular: boolean;
    showResults: boolean;
    sidebarTab: 'data' | 'chart';
    toggleTutorial: () => void;
    setShowQuiz: (show: boolean) => void;
    toggleMolecular: () => void;
    toggleResults: () => void;
    setSidebarTab: (tab: 'data' | 'chart') => void;
}

export const useUiStore = create<UiState>((set) => ({
    showTutorial: false,
    showQuiz: false,
    showMolecular: false,
    showResults: false,
    sidebarTab: 'data',
    toggleTutorial: () => set((state) => ({ showTutorial: !state.showTutorial })),
    setShowQuiz: (show) => set({ showQuiz: show }),
    toggleMolecular: () => set((state) => ({ showMolecular: !state.showMolecular })),
    toggleResults: () => set((state) => ({ showResults: !state.showResults })),
    setSidebarTab: (tab) => set({ sidebarTab: tab }),
}))
