export function calculatePH(volHCL_added: number, concHCL: number, volNaOH: number, concNaOH: number): number {
    const molesHCL = (volHCL_added / 1000) * concHCL;
    const molesNaOH = (volNaOH / 1000) * concNaOH;
    const molesExcess = molesHCL - molesNaOH;
    const totalVol = (volHCL_added + volNaOH) / 1000;

    let ph = 7.0;
    if (molesExcess > 0) {
        // Excess acid
        ph = -Math.log10(molesExcess / totalVol);
    } else if (molesExcess < 0) {
        // Excess base
        const pOH = -Math.log10(-molesExcess / totalVol);
        ph = 14 - pOH;
    }

    return Math.max(0, Math.min(14, ph));
}

export function getEquivalenceVolume(concHCL: number, volNaOH: number, concNaOH: number): number {
    return (concNaOH * volNaOH) / concHCL;
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
