import { useExperimentStore } from '../store/experimentStore';
import { useRef } from 'react';

export function useExperiment() {
    const { addVolume, resetExperiment, setLabStage, labStage } = useExperimentStore();
    const demoTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const startDemo = () => {
        // Clear any existing demo sequence
        if (demoTimeoutRef.current) {
            clearTimeout(demoTimeoutRef.current);
        }

        // If at setup, start the filling sequence first
        if (labStage === 'setup') {
            setLabStage('fill-burette');

            // Wait for both fill animations to complete (~12s total)
            // fill-burette (5.8s) + fill-flask (5.8s) + small buffer = 12.5s
            demoTimeoutRef.current = setTimeout(() => {
                runTitrationLoop(0);
            }, 12500);
            return;
        }

        // If already in titration or done, just reset and start
        if (labStage === 'titrate' || labStage === 'done') {
            resetExperiment();
            setLabStage('fill-burette');
            demoTimeoutRef.current = setTimeout(() => {
                runTitrationLoop(0);
            }, 12500);
            return;
        }

        // Otherwise (middle of filling), just wait or do nothing to avoid double triggers
    };

    const runTitrationLoop = (currentVolume: number) => {
        let vol = currentVolume;

        const runDemoStep = () => {
            if (vol < 20) {
                vol += 1.0;
                addVolume(1.0);
                demoTimeoutRef.current = setTimeout(runDemoStep, 350);
            } else if (vol >= 20 && vol < 24.5) {
                vol += 0.1;
                addVolume(0.1);
                demoTimeoutRef.current = setTimeout(runDemoStep, 250);
            } else if (vol >= 24.5 && vol < 24.9) {
                vol += 0.1;
                addVolume(0.1);
                demoTimeoutRef.current = setTimeout(runDemoStep, 600);
            } else if (vol >= 24.9 && vol < 25.0) {
                vol += 0.1;
                addVolume(0.1);
                demoTimeoutRef.current = setTimeout(runDemoStep, 2000); // long pause at equivalence
            } else if (vol >= 25.0 && vol < 25.5) {
                vol += 0.1;
                addVolume(0.1);
                demoTimeoutRef.current = setTimeout(runDemoStep, 400);
            } else {
                // Demo done
                if (demoTimeoutRef.current) clearTimeout(demoTimeoutRef.current);
            }
        };

        runDemoStep();
    };

    const stopDemo = () => {
        if (demoTimeoutRef.current) {
            clearTimeout(demoTimeoutRef.current);
        }
    };

    return { startDemo, stopDemo };
}
