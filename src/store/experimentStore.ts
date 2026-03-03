import { create } from 'zustand'
import { calculatePH } from '../lib/chemistry'

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
    flaskVolume: number;
    buretteVolume: number;
    volumeAdded: number;
    currentPH: number;
    titrationData: TitrationDataPoint[];
    isRunning: boolean;
    isStopcockOpen: boolean;
    score: number | null;
    startTime: number | null;
    setLabStage: (stage: LabStage) => void;
    setHclConcentration: (c: number) => void;
    setNaohConcentration: (c: number) => void;
    setFlaskVolume: (v: number) => void;
    setBuretteVolume: (v: number) => void;
    addVolume: (ml: number) => void;
    resetExperiment: () => void;
    restoreDefaults: () => void;
    setScore: (n: number) => void;
    setCurrentStep: (step: number) => void;
    setStartTime: (time: number) => void;
    setStopcockOpen: (isOpen: boolean) => void;
}

export const useExperimentStore = create<ExperimentState>((set) => ({
    labStage: 'setup',
    currentStep: 0,
    hclConcentration: 0.1,
    naohConcentration: 0.1,
    flaskVolume: 25.0,
    buretteVolume: 35.0,
    volumeAdded: 0,
    currentPH: 0.0,
    titrationData: [],
    isRunning: false,  // starts false — user must go through setup steps
    isStopcockOpen: false,
    score: null,
    startTime: null,

    setStopcockOpen: (isOpen: boolean) => set({ isStopcockOpen: isOpen }),
    setStartTime: (time: number) => set({ startTime: time }),
    setHclConcentration: (hclConcentration: number) => set({ hclConcentration: Math.max(0.01, Math.min(2.0, hclConcentration)) }),
    setNaohConcentration: (naohConcentration: number) => set({ naohConcentration: Math.max(0.01, Math.min(2.0, naohConcentration)) }),
    setFlaskVolume: (flaskVolume: number) => set({ flaskVolume: Math.max(5, Math.min(100, flaskVolume)) }),
    setBuretteVolume: (buretteVolume: number) => set({ buretteVolume: Math.max(5, Math.min(50, buretteVolume)) }),

    setLabStage: (labStage: LabStage) =>
        set((state) => {
            const updates: Partial<ExperimentState> = { labStage };

            // When titration starts, calculate initial pH and mark as running
            if (labStage === 'titrate') {
                updates.currentPH = calculatePH(0, state.naohConcentration, state.flaskVolume, state.hclConcentration);
                updates.isRunning = true;
            }

            return updates;
        }),

    addVolume: (ml: number) =>
        set((state) => {
            // Flask capacity is 250mL. Don't add more if already full.
            if (state.volumeAdded + state.flaskVolume >= 250) {
                return { isStopcockOpen: false, isRunning: false };
            }

            const maxAddable = 250 - (state.volumeAdded + state.flaskVolume);
            const actualAdd = Math.min(ml, maxAddable, state.buretteVolume - state.volumeAdded);

            const newVolume = state.volumeAdded + actualAdd;
            const newPH = calculatePH(newVolume, state.naohConcentration, state.flaskVolume, state.hclConcentration);

            const newData = [...state.titrationData, { volume: newVolume, ph: newPH }];
            const isBuretteEmpty = newVolume >= state.buretteVolume;
            const isFlaskFull = newVolume + state.flaskVolume >= 250;

            return {
                volumeAdded: newVolume,
                currentPH: newPH,
                titrationData: newData,
                isRunning: !isBuretteEmpty && !isFlaskFull,
                isStopcockOpen: state.isStopcockOpen && !isBuretteEmpty && !isFlaskFull,
            };
        }),

    resetExperiment: () =>
        set(() => ({
            labStage: 'setup',
            currentStep: 0,
            volumeAdded: 0,
            currentPH: 0.0,
            titrationData: [],
            isRunning: false,
            isStopcockOpen: false,
            score: null,
            startTime: null,
            // Keep hclConcentration, naohConcentration, flaskVolume from current state
        })),

    restoreDefaults: () =>
        set(() => ({
            hclConcentration: 0.1,
            naohConcentration: 0.1,
            flaskVolume: 25.0,
            buretteVolume: 35.0,
        })),

    setScore: (score: number) => set({ score }),
    setCurrentStep: (currentStep: number) => set({ currentStep }),
}))
