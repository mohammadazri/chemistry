import { useExperimentStore } from '../store/experimentStore';
import { useRef } from 'react';

export function useExperiment() {
    const { addVolume, resetExperiment, isRunning } = useExperimentStore();
    const demoTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const startDemo = () => {
        resetExperiment();

        // Clear any existing demo sequence
        if (demoTimeoutRef.current) {
            clearTimeout(demoTimeoutRef.current);
        }

        let currentVolume = 0;

        const runDemoStep = () => {
            if (currentVolume < 20) {
                currentVolume += 1.0;
                addVolume(1.0);
                demoTimeoutRef.current = setTimeout(runDemoStep, 400);
            } else if (currentVolume >= 20 && currentVolume < 24.5) {
                currentVolume += 0.1;
                addVolume(0.1);
                demoTimeoutRef.current = setTimeout(runDemoStep, 300);
            } else if (currentVolume >= 24.5 && currentVolume < 24.9) {
                currentVolume += 0.1;
                addVolume(0.1);
                demoTimeoutRef.current = setTimeout(runDemoStep, 600);
            } else if (currentVolume >= 24.9 && currentVolume < 25.0) {
                currentVolume += 0.1;
                addVolume(0.1);
                demoTimeoutRef.current = setTimeout(runDemoStep, 2000); // long pause at equivalence
            } else if (currentVolume >= 25.0 && currentVolume < 26.0) {
                currentVolume += 0.1;
                addVolume(0.1);
                demoTimeoutRef.current = setTimeout(runDemoStep, 400);
            } else {
                // Demo done
                if (demoTimeoutRef.current) clearTimeout(demoTimeoutRef.current);
            }
        };

        demoTimeoutRef.current = setTimeout(runDemoStep, 1000);
    };

    const stopDemo = () => {
        if (demoTimeoutRef.current) {
            clearTimeout(demoTimeoutRef.current);
        }
    };

    return { startDemo, stopDemo };
}
