import { useExperimentStore } from '../store/experimentStore';
import { useUiStore } from '../store/uiStore';

/**
 * useLabInteractions
 *
 * Centralises all 3D object click/interaction handlers for the lab scene.
 * Returns guard-protected callbacks that can be passed as `onClick` props
 * to any R3F mesh or group. Works with both mouse clicks AND AR gestures.
 */
export function useLabInteractions() {
    const { labStage, setLabStage, isStopcockOpen, setStopcockOpen, isRunning } =
        useExperimentStore();

    const { showTooltip, setShowTooltip } = (() => {
        // We keep pH tooltip state in uiStore (added below as arPhTooltip)
        const show = useUiStore((s) => s.arPhTooltip);
        const set = useUiStore((s) => s.setArPhTooltip);
        return { showTooltip: show, setShowTooltip: set };
    })();

    /**
     * Click the NaOH reagent bottle (displayed beside the burette).
     * Guard: only works during the 'setup' stage to begin filling the burette.
     */
    const onNaOHBottleClick = () => {
        if (labStage !== 'setup') return;
        setLabStage('fill-burette');
    };

    /**
     * Click the HCl reagent bottle (displayed beside the flask).
     * Guard: only works after the burette is filled.
     */
    const onHClBottleClick = () => {
        if (labStage !== 'fill-burette') return;
        setLabStage('fill-flask');
    };

    /**
     * Click the burette stopcock to toggle continuous flow.
     * Guard: only works while titration is active and running.
     */
    const onStopcockClick = () => {
        if (labStage !== 'titrate' || !isRunning) return;
        setStopcockOpen(!isStopcockOpen);
    };

    /**
     * Click the pH meter to toggle a floating tooltip showing the live pH value.
     * No guard — always available.
     */
    const onPhMeterClick = () => {
        setShowTooltip(!showTooltip);
    };

    // Derived convenience flags for conditional hover/glow
    const canClickNaOH = labStage === 'setup';
    const canClickHCl = labStage === 'fill-burette';
    const canClickStopcock = labStage === 'titrate' && isRunning;

    return {
        onNaOHBottleClick,
        onHClBottleClick,
        onStopcockClick,
        onPhMeterClick,
        canClickNaOH,
        canClickHCl,
        canClickStopcock,
        showPhTooltip: showTooltip,
    };
}
