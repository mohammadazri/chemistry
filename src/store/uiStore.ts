import { create } from 'zustand'

interface UiState {
    showTutorial: boolean;
    showMolecular: boolean;
    showResults: boolean;
    sidebarTab: 'steps' | 'data' | 'chart';
    toggleTutorial: () => void;
    toggleMolecular: () => void;
    toggleResults: () => void;
    setSidebarTab: (tab: 'steps' | 'data' | 'chart') => void;
}

export const useUiStore = create<UiState>((set) => ({
    showTutorial: true,
    showMolecular: false,
    showResults: false,
    sidebarTab: 'steps',
    toggleTutorial: () => set((state) => ({ showTutorial: !state.showTutorial })),
    toggleMolecular: () => set((state) => ({ showMolecular: !state.showMolecular })),
    toggleResults: () => set((state) => ({ showResults: !state.showResults })),
    setSidebarTab: (tab) => set({ sidebarTab: tab }),
}))
