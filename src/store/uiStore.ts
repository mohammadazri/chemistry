import { create } from 'zustand'

export type CameraViewPreset = 'auto' | 'periodic_table' | 'emergency_shower' | 'safety_first' | 'side_desk' | 'wall_clock';

interface UiState {
    showTutorial: boolean;
    showQuiz: boolean;
    showMolecular: boolean;
    showResults: boolean;
    showAssistant: boolean;
    sidebarTab: 'controls' | 'data' | 'chart';
    cameraResetKey: number;
    activeCameraView: CameraViewPreset;
    arEnabled: boolean;           // AR / gesture system on/off
    arPhTooltip: boolean;         // pH meter 3D tooltip visible
    toggleTutorial: () => void;
    setShowQuiz: (show: boolean) => void;
    toggleMolecular: () => void;
    toggleAssistant: () => void;
    toggleResults: () => void;
    setSidebarTab: (tab: 'controls' | 'data' | 'chart') => void;
    resetCamera: () => void;
    setActiveCameraView: (view: CameraViewPreset) => void;
    setArEnabled: (enabled: boolean) => void;
    setArPhTooltip: (show: boolean) => void;
}

export const useUiStore = create<UiState>((set) => ({
    showTutorial: false,
    showQuiz: false,
    showMolecular: false,
    showAssistant: true,
    showResults: false,
    sidebarTab: 'controls',
    cameraResetKey: 0,
    activeCameraView: 'auto',
    arEnabled: false,
    arPhTooltip: false,
    toggleTutorial: () => set((state) => ({ showTutorial: !state.showTutorial })),
    setShowQuiz: (show) => set({ showQuiz: show }),
    toggleMolecular: () => set((state) => ({ showMolecular: !state.showMolecular })),
    toggleAssistant: () => set((state) => ({ showAssistant: !state.showAssistant })),
    toggleResults: () => set((state) => ({ showResults: !state.showResults })),
    setSidebarTab: (tab) => set({ sidebarTab: tab }),
    resetCamera: () => set((state) => ({ cameraResetKey: state.cameraResetKey + 1, activeCameraView: 'auto' })),
    setActiveCameraView: (view) => set({ activeCameraView: view }),
    setArEnabled: (enabled) => set({ arEnabled: enabled }),
    setArPhTooltip: (show) => set({ arPhTooltip: show }),
}))
