import * as THREE from 'three';

export function getLiquidColor(ph: number): THREE.Color {
    if (ph > 8.2) {
        // Interpolate towards pink base
        const ratio = Math.min(1, (ph - 8.2) / 1.8);
        const r = Math.round(255);
        const g = Math.round(248 - (ratio * (248 - 105)));
        const b = Math.round(240 - (ratio * (240 - 180)));
        return new THREE.Color(`rgb(${r}, ${g}, ${b})`);
    }

    // Clear/faint
    return new THREE.Color('#FFF8F0');
}
