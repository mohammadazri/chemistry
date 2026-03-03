import { Moon, Sun, Settings } from 'lucide-react';
import { useThemeStore } from '../../store/themeStore';

export default function ThemeToggle() {
    const { mode, resolvedTheme, setTheme } = useThemeStore();

    const handleCycle = () => {
        if (mode === 'light') setTheme('dark');
        else if (mode === 'dark') setTheme('system');
        else setTheme('light');
    };

    return (
        <button
            onClick={handleCycle}
            className={`
                p-2 rounded-full border shadow-sm transition-all duration-300
                flex items-center justify-center
                ${resolvedTheme === 'dark'
                    ? 'bg-white/5 border-white/10 text-gray-300 hover:text-white hover:bg-white/10 shadow-inner'
                    : 'bg-white border-gray-200 text-gray-600 hover:text-indigo-600 hover:bg-gray-50 shadow-sm'}
            `}
            title={`Current mode: ${mode}`}
        >
            {mode === 'light' && <Sun className="w-4 h-4" />}
            {mode === 'dark' && <Moon className="w-4 h-4" />}
            {mode === 'system' && <Settings className="w-4 h-4" />}
        </button>
    );
}
