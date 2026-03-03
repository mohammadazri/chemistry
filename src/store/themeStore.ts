import { create } from 'zustand';
import { ThemeManager } from '../lib/theme/ThemeManager';
import type { ThemeMode } from '../lib/theme/ThemeManager';

interface ThemeState {
    mode: ThemeMode;
    resolvedTheme: 'light' | 'dark';
    setTheme: (mode: ThemeMode) => void;
}

const manager = ThemeManager.getInstance();

export const useThemeStore = create<ThemeState>((set) => {
    // Subscribe to the OOP ThemeManager for external updates (like system changes)
    manager.subscribe((resolvedTheme, mode) => {
        set({ resolvedTheme, mode });
    });

    return {
        mode: manager.getMode(),
        resolvedTheme: manager.getResolvedTheme(),
        setTheme: (mode: ThemeMode) => {
            manager.setMode(mode);
        }
    };
});
