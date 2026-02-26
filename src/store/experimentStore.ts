import { create } from 'zustand'
import { calculatePH, getEquivalenceVolume } from '../lib/chemistry'

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
    startTime: number | null;
    addVolume: (ml: number) => void;
    resetExperiment: () => void;
    setScore: (n: number) => void;
    setCurrentStep: (step: number) => void;
    setStartTime: (time: number) => void;
}

export const useExperimentStore = create<ExperimentState>((set) => ({
    currentStep: 0,
    hclConcentration: 0.1,
    naohConcentration: 0.1,
    volumeAdded: 0,
    currentPH: 13.0,
    titrationData: [],
    isRunning: true,
    score: null,
    startTime: null,

    setStartTime: (time: number) => set({ startTime: time }),

    addVolume: (ml: number) =>
        set((state) => {
            const newVolume = state.volumeAdded + ml;
            const newPH = calculatePH(newVolume, state.hclConcentration, 25, state.naohConcentration);

            const newData = [...state.titrationData, { volume: newVolume, ph: newPH }];

            const equivVol = getEquivalenceVolume(state.hclConcentration, 25, state.naohConcentration);
            const isRunning = newVolume < equivVol + 5;

            return {
                volumeAdded: newVolume,
                currentPH: newPH,
                titrationData: newData,
                isRunning
            };
        }),

    resetExperiment: () =>
        set({
            currentStep: 0,
            hclConcentration: 0.1,
            naohConcentration: 0.1,
            volumeAdded: 0,
            currentPH: 13.0, // Should realistically recalculate initial pH, but user specification says 13.0
            titrationData: [],
            isRunning: true,
            score: null,
            startTime: null,
        }),

    setScore: (score: number) => set({ score }),
    setCurrentStep: (currentStep: number) => set({ currentStep }),
}))
