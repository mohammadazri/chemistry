export type ThemeMode = 'light' | 'dark' | 'system';

export class ThemeManager {
    private static instance: ThemeManager;
    private currentMode: ThemeMode = 'system';
    private resolvedTheme: 'light' | 'dark' = 'light';
    private listeners: Set<(theme: 'light' | 'dark', mode: ThemeMode) => void> = new Set();
    private mediaQuery: MediaQueryList | null = null;

    private constructor() {
        if (typeof window === 'undefined') return;

        // Load from local storage
        const stored = localStorage.getItem('hololab_theme');
        if (stored === 'light' || stored === 'dark' || stored === 'system') {
            this.currentMode = stored as ThemeMode;
        }

        // Setup system listener
        this.mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        this.mediaQuery.addEventListener('change', this.handleSystemChange);

        // Intial resolution
        this.applyTheme(this.currentMode);
    }

    public static getInstance(): ThemeManager {
        if (!ThemeManager.instance) {
            ThemeManager.instance = new ThemeManager();
        }
        return ThemeManager.instance;
    }

    public setMode(mode: ThemeMode) {
        this.currentMode = mode;
        localStorage.setItem('hololab_theme', mode);
        this.applyTheme(mode);
    }

    public getMode(): ThemeMode {
        return this.currentMode;
    }

    public getResolvedTheme(): 'light' | 'dark' {
        return this.resolvedTheme;
    }

    public subscribe(listener: (theme: 'light' | 'dark', mode: ThemeMode) => void): () => void {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    }

    private handleSystemChange = (e: MediaQueryListEvent) => {
        if (this.currentMode === 'system') {
            const newTheme = e.matches ? 'dark' : 'light';
            this.updateDOM(newTheme);
            this.notifyListeners();
        }
    };

    private applyTheme(mode: ThemeMode) {
        if (mode === 'system') {
            this.resolvedTheme = this.mediaQuery?.matches ? 'dark' : 'light';
        } else {
            this.resolvedTheme = mode;
        }

        this.updateDOM(this.resolvedTheme);
        this.notifyListeners();
    }

    private updateDOM(theme: 'light' | 'dark') {
        const root = document.documentElement;
        if (theme === 'dark') {
            root.classList.add('dark');
            root.classList.remove('light');
        } else {
            root.classList.add('light');
            root.classList.remove('dark');
        }
        // Force tailwind to recognize
        root.style.colorScheme = theme;
    }

    private notifyListeners() {
        this.listeners.forEach((listener) => listener(this.resolvedTheme, this.currentMode));
    }
}
