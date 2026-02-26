import { create } from 'zustand'
import { calculatePH, getEquivalenceVolume } from '../lib/chemistry'

export type LabStage = 'setup' | 'fill-burette' | 'fill-flask' | 'titrate' | 'done';

export interface TitrationDataPoint {
    volume: number;
    ph: number;
}

interface ExperimentState {
    labStage: LabStage;
    currentStep: number;
    hclConcentration: number;
    naohConcentration: number;
    volumeAdded: number;
    currentPH: number;
    titrationData: TitrationDataPoint[];
    isRunning: boolean;
    score: number | null;
    startTime: number | null;
    setLabStage: (stage: LabStage) => void;
    addVolume: (ml: number) => void;
    resetExperiment: () => void;
    setScore: (n: number) => void;
    setCurrentStep: (step: number) => void;
    setStartTime: (time: number) => void;
}

export const useExperimentStore = create<ExperimentState>((set) => ({
    labStage: 'setup',
    currentStep: 0,
    hclConcentration: 0.1,
    naohConcentration: 0.1,
    volumeAdded: 0,
    currentPH: 0.0,
    titrationData: [],
    isRunning: false,  // starts false — user must go through setup steps
    score: null,
    startTime: null,

    setStartTime: (time: number) => set({ startTime: time }),

    setLabStage: (labStage: LabStage) =>
        set((state) => {
            const updates: Partial<ExperimentState> = { labStage };

            // When titration starts, calculate initial pH and mark as running
            if (labStage === 'titrate') {
                updates.currentPH = calculatePH(0, state.naohConcentration, 25, state.hclConcentration);
                updates.isRunning = true;
            }

            return updates;
        }),

    addVolume: (ml: number) =>
        set((state) => {
            const newVolume = state.volumeAdded + ml;
            const newPH = calculatePH(newVolume, state.naohConcentration, 25, state.hclConcentration);

            const newData = [...state.titrationData, { volume: newVolume, ph: newPH }];

            const equivVol = getEquivalenceVolume(state.hclConcentration, 25, state.naohConcentration);
            const stillRunning = newVolume < equivVol + 5;

            return {
                volumeAdded: newVolume,
                currentPH: newPH,
                titrationData: newData,
                isRunning: stillRunning,
                labStage: stillRunning ? 'titrate' : 'done',
            };
        }),

    resetExperiment: () =>
        set(() => ({
            labStage: 'setup',
            currentStep: 0,
            hclConcentration: 0.1,
            naohConcentration: 0.1,
            volumeAdded: 0,
            currentPH: 0.0,
            titrationData: [],
            isRunning: false,
            score: null,
            startTime: null,
        })),

    setScore: (score: number) => set({ score }),
    setCurrentStep: (currentStep: number) => set({ currentStep }),
}))
