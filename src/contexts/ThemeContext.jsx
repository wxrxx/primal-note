import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export function useTheme() {
    return useContext(ThemeContext);
}

// Predefined accent colors
const ACCENT_COLORS = [
    { id: 'purple', name: 'ม่วง', primary: '#8B5CF6', secondary: '#6366F1' },
    { id: 'blue', name: 'น้ำเงิน', primary: '#3B82F6', secondary: '#2563EB' },
    { id: 'cyan', name: 'ฟ้า', primary: '#06B6D4', secondary: '#0891B2' },
    { id: 'green', name: 'เขียว', primary: '#10B981', secondary: '#059669' },
    { id: 'orange', name: 'ส้ม', primary: '#F97316', secondary: '#EA580C' },
    { id: 'pink', name: 'ชมพู', primary: '#EC4899', secondary: '#DB2777' },
    { id: 'red', name: 'แดง', primary: '#EF4444', secondary: '#DC2626' },
];

export function ThemeProvider({ children }) {
    // Load saved theme from localStorage
    const [mode, setMode] = useState(() => {
        const saved = localStorage.getItem('primal-theme-mode');
        return saved || 'dark';
    });

    const [accentId, setAccentId] = useState(() => {
        const saved = localStorage.getItem('primal-accent-color');
        return saved || 'purple';
    });

    const [customSecondary, setCustomSecondary] = useState(() => {
        const saved = localStorage.getItem('primal-secondary-color');
        return saved || null;
    });

    // Apply theme to document
    useEffect(() => {
        document.documentElement.setAttribute('data-theme', mode);
        localStorage.setItem('primal-theme-mode', mode);
    }, [mode]);

    // Apply accent color
    useEffect(() => {
        const accent = ACCENT_COLORS.find(c => c.id === accentId) || ACCENT_COLORS[0];
        const primaryColor = accent.primary;
        const secondaryColor = customSecondary || accent.secondary;

        document.documentElement.style.setProperty('--accent-primary', primaryColor);
        document.documentElement.style.setProperty('--accent-secondary', secondaryColor);

        // Update gradient and glow colors
        document.documentElement.style.setProperty(
            '--gradient-primary',
            primaryColor
        );
        document.documentElement.style.setProperty(
            '--border-color',
            `${primaryColor}33`
        );
        document.documentElement.style.setProperty(
            '--border-glow',
            `${primaryColor}66`
        );
        document.documentElement.style.setProperty(
            '--shadow-glow',
            `0 0 30px ${primaryColor}4D`
        );

        localStorage.setItem('primal-accent-color', accentId);
        if (customSecondary) {
            localStorage.setItem('primal-secondary-color', customSecondary);
        } else {
            localStorage.removeItem('primal-secondary-color');
        }
    }, [accentId, customSecondary]);

    const toggleMode = () => {
        setMode(prev => prev === 'dark' ? 'light' : 'dark');
    };

    const value = {
        mode,
        setMode,
        toggleMode,
        accentId,
        setAccentId,
        accentColors: ACCENT_COLORS,
        currentAccent: ACCENT_COLORS.find(c => c.id === accentId) || ACCENT_COLORS[0],
        customSecondary,
        setCustomSecondary,
        resetSecondary: () => setCustomSecondary(null)
    };

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
}
