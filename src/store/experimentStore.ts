import { create } from 'zustand'

export interface TitrationDataPoint {
    volume: number;
    ph: number;
}

interface ExperimentState {
    currentStep: number;
    hclConcentration: number;
    naohConcentration: number;
    volumeAdded: number;
    currentPH: number;
    titrationData: TitrationDataPoint[];
    isRunning: boolean;
    score: number | null;
    addVolume: (ml: number) => void;
    resetExperiment: () => void;
    setScore: (n: number) => void;
}

export const useExperimentStore = create<ExperimentState>((set) => ({
    currentStep: 0,
    hclConcentration: 0.1,
    naohConcentration: 0.1,
    volumeAdded: 0,
    currentPH: 13.0,
    titrationData: [],
    isRunning: false, // will turn true when started
    score: null,

    addVolume: (ml: number) =>
        set((state) => ({ volumeAdded: state.volumeAdded + ml })), // Logic placeholder

    resetExperiment: () =>
        set({
            currentStep: 0,
            hclConcentration: 0.1,
            naohConcentration: 0.1,
            volumeAdded: 0,
            currentPH: 13.0,
            titrationData: [],
            isRunning: false,
            score: null,
        }),

    setScore: (score: number) => set({ score }),
}))
