export function calculatePH(volNaOH_added: number, concNaOH: number, volHCL_initial: number, concHCL: number): number {
    const molesNaOH = (volNaOH_added / 1000) * concNaOH;
    const molesHCL = (volHCL_initial / 1000) * concHCL;
    const totalVol = (volNaOH_added + volHCL_initial) / 1000;

    const molesExcessAcid = molesHCL - molesNaOH;

    let ph = 7.0;
    if (Math.abs(molesExcessAcid) < 1e-10) {
        ph = 7.0; // Exact equivalence handling to avoid precision float issues
    } else if (molesExcessAcid > 0) {
        // Excess strong acid
        ph = -Math.log10(molesExcessAcid / totalVol);
    } else {
        // Excess strong base
        const pOH = -Math.log10(-molesExcessAcid / totalVol);
        ph = 14 - pOH;
    }

    return Math.max(0, Math.min(14, ph));
}

export function getEquivalenceVolume(concHCL: number, volHCL_initial: number, concNaOH: number): number {
    return (concHCL * volHCL_initial) / concNaOH;
}

export function getIndicatorColor(indicator: string, ph: number): string {
    if (indicator === 'phenolphthalein') {
        if (ph < 8.2) return '#FFF5EE';
        if (ph > 10) return '#FF69B4';

        // Interpolate between 8.2 and 10
        const ratio = (ph - 8.2) / (10 - 8.2);
        // Rough interpolation from clear/faint to pink
        const r = Math.round(255 * (1 - ratio) + 255 * ratio);
        const g = Math.round(245 * (1 - ratio) + 105 * ratio);
        const b = Math.round(238 * (1 - ratio) + 180 * ratio);

        return `rgb(${r}, ${g}, ${b})`;
    }

    if (indicator === 'methylOrange') {
        if (ph < 3.1) return '#FF4500';
        if (ph > 4.4) return '#FFD700';

        const ratio = (ph - 3.1) / (4.4 - 3.1);
        const r = 255;
        const g = Math.round(69 * (1 - ratio) + 215 * ratio);
        const b = 0;

        return `rgb(${r}, ${g}, ${b})`;
    }

    return '#FFFFFF';
}

export function getPhaseLabel(ph: number): string {
    if (ph < 7) return 'Acidic';
    if (ph > 7) return 'Basic';
    return 'Neutral';
}
