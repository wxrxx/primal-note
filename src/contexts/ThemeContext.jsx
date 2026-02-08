import React, { createContext, useContext, useState, useEffect, useLayoutEffect } from 'react';

const ThemeContext = createContext();

export function useTheme() {
    return useContext(ThemeContext);
}

export function ThemeProvider({ children }) {
    // Mode
    const [mode, setMode] = useState(() => {
        const saved = localStorage.getItem('primal-theme-mode');
        return saved || 'dark';
    });

    // Background Settings
    const [bgImage, setBgImage] = useState(() => {
        const saved = localStorage.getItem('primal-bg-image');
        // Legacy "tree" image URL to be removed
        const legacyDefault = 'https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?q=80&w=1174&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D';

        if (saved === legacyDefault) {
            localStorage.removeItem('primal-bg-image');
            return null;
        }
        return saved || null;
    });

    const [bgOpacity, setBgOpacity] = useState(() => {
        return parseFloat(localStorage.getItem('primal-bg-opacity')) || 0.65;
    });

    const [glassOpacity, setGlassOpacity] = useState(() => {
        return parseFloat(localStorage.getItem('primal-glass-opacity')) || 0.75;
    });

    const [glassBlur, setGlassBlur] = useState(() => {
        return parseInt(localStorage.getItem('primal-glass-blur')) || 20;
    });


    // Derived Colors (Automatic)
    const [themeColors, setThemeColors] = useState({
        primary: '#8B5CF6',
        secondary: '#6366F1',
        isActive: false
    });

    // Apply Mode
    useLayoutEffect(() => {
        document.documentElement.setAttribute('data-theme', mode);
        localStorage.setItem('primal-theme-mode', mode);

        // Remove preload class to enable transitions
        const timer = setTimeout(() => {
            document.body.classList.remove('preload');
        }, 100);
        return () => clearTimeout(timer);
    }, [mode]);

    // Color Extraction Logic
    const extractColors = (imgSrc) => {
        if (!imgSrc) return;

        const img = new Image();
        img.crossOrigin = "Anonymous";
        img.src = imgSrc;

        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = 50;
            canvas.height = 50;
            ctx.drawImage(img, 0, 0, 50, 50);

            const imageData = ctx.getImageData(0, 0, 50, 50).data;
            const colorCounts = {};
            let maxCount = 0;
            let dominantColor = { r: 139, g: 92, b: 246 }; // Default Purple

            for (let i = 0; i < imageData.length; i += 40) { // Sample every 10th pixel
                const r = imageData[i];
                const g = imageData[i + 1];
                const b = imageData[i + 2];
                const alpha = imageData[i + 3];

                if (alpha < 128) continue; // Skip transparent
                // Skip too dark or too light pixels for accent
                if ((r + g + b) < 50 || (r + g + b) > 700) continue;

                const key = `${Math.round(r / 20) * 20},${Math.round(g / 20) * 20},${Math.round(b / 20) * 20}`;
                colorCounts[key] = (colorCounts[key] || 0) + 1;

                if (colorCounts[key] > maxCount) {
                    maxCount = colorCounts[key];
                    dominantColor = { r, g, b };
                }
            }

            // Adjust brightness/saturation for readability (Liquid Glass requirement)
            const primary = `rgb(${dominantColor.r}, ${dominantColor.g}, ${dominantColor.b})`;

            // Generate secondary by shifting hue
            // Simple string manipulation or just use complementary logic
            // For now, let's just make secondary a bit brighter version

            setThemeColors({
                primary: primary,
                secondary: primary, // Simplified for now, or calculate
                isActive: true
            });
        };

        img.onerror = () => {
            // Fallback to default if CORS fails or invalid image
            setThemeColors({
                primary: '#8B5CF6',
                secondary: '#6366F1',
                isActive: false
            });
        };
    };

    // Apply Background & Extract Colors
    useLayoutEffect(() => {
        if (bgImage) {
            document.documentElement.style.setProperty('--bg-image', `url(${bgImage})`);
            document.documentElement.style.setProperty('--bg-overlay-opacity', bgOpacity);

            // iOS 26 Liquid Glass Variables
            document.documentElement.style.setProperty('--bg-card', 'var(--bg-glass-card)');
            document.documentElement.style.setProperty('--bg-secondary', 'var(--bg-glass)');
            document.documentElement.style.setProperty('--bg-tertiary', 'var(--bg-glass-card)');
            document.documentElement.style.setProperty('--bg-card-hover', 'var(--bg-glass-card-hover)');
            document.documentElement.style.setProperty('--bg-primary', 'transparent');

            document.body.classList.add('has-custom-bg');
            localStorage.setItem('primal-bg-image', bgImage);
            localStorage.setItem('primal-bg-opacity', bgOpacity);

            extractColors(bgImage);
        } else {
            // Reset
            document.documentElement.style.removeProperty('--bg-image');
            document.documentElement.style.removeProperty('--bg-overlay-opacity');
            document.documentElement.style.removeProperty('--bg-card');
            document.documentElement.style.removeProperty('--bg-secondary');
            document.documentElement.style.removeProperty('--bg-tertiary');
            document.documentElement.style.removeProperty('--bg-card-hover');
            document.documentElement.style.removeProperty('--bg-primary');

            document.body.classList.remove('has-custom-bg');
            localStorage.removeItem('primal-bg-image');
            localStorage.removeItem('primal-bg-opacity');

            // Default Colors
            setThemeColors({
                primary: '#8B5CF6',
                secondary: '#6366F1',
                isActive: false
            });
        }
    }, [bgImage, bgOpacity]);

    // Apply Theme Colors
    useLayoutEffect(() => {
        const { primary, secondary } = themeColors;

        document.documentElement.style.setProperty('--accent-primary', primary);
        document.documentElement.style.setProperty('--accent-secondary', secondary);

        // Gradient
        document.documentElement.style.setProperty('--gradient-primary', `linear-gradient(135deg, ${primary} 0%, ${secondary} 100%)`);

        // Glows
        document.documentElement.style.setProperty('--border-hover', primary);
        document.documentElement.style.setProperty('--border-glow', `${primary}66`); // 40% opacity

    }, [themeColors]);

    // Glass Opacity Logic
    useLayoutEffect(() => {
        const isDark = mode === 'dark';
        const baseRgb = isDark ? '0, 0, 0' : '255, 255, 255'; // Adaptive base

        // Mode-aware opacity base
        const minOpacity = isDark ? 0.008 : 0.4; // Light mode needs more opacity

        const baseAlpha = Math.max(minOpacity, glassOpacity * 0.1);
        const cardAlpha = Math.max(minOpacity + 0.05, glassOpacity * 0.2); // Increased base for visibility
        const cardHoverAlpha = Math.max(minOpacity + 0.1, glassOpacity * 0.3);
        const elevatedAlpha = Math.max(minOpacity + 0.08, glassOpacity * 0.25);

        document.documentElement.style.setProperty('--bg-glass', `rgba(${baseRgb}, ${baseAlpha})`);
        document.documentElement.style.setProperty('--bg-glass-card', `rgba(${baseRgb}, ${cardAlpha})`);
        document.documentElement.style.setProperty('--bg-glass-card-hover', `rgba(${baseRgb}, ${cardHoverAlpha})`);
        document.documentElement.style.setProperty('--bg-glass-elevated', `rgba(${baseRgb}, ${elevatedAlpha})`);
        document.documentElement.style.setProperty('--bg-glass-rgb', baseRgb); // For other uses

        localStorage.setItem('primal-glass-opacity', glassOpacity);
    }, [mode, glassOpacity]);

    // Glass Blur Logic
    useLayoutEffect(() => {
        document.documentElement.style.setProperty('--glass-blur', `${glassBlur}px`);
        document.documentElement.style.setProperty('--glass-blur-heavy', `${glassBlur * 2}px`);
        document.documentElement.style.setProperty('--glass-blur-light', `${glassBlur * 0.5}px`);

        localStorage.setItem('primal-glass-blur', glassBlur);
    }, [glassBlur]);


    const toggleMode = () => setMode(p => p === 'dark' ? 'light' : 'dark');

    const value = {
        mode,
        toggleMode,
        bgImage,
        setBgImage,
        bgOpacity,
        setBgOpacity,
        glassOpacity,
        setGlassOpacity,
        glassBlur,
        setGlassBlur,
        themeColors // Export for preview if needed
    };

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
}
