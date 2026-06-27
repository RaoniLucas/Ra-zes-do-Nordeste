import { useState, useEffect, useCallback } from 'react';

export function useHeaderTheme(isSideDrawerOpen, currentSection) {
    const [headerBgColor, setHeaderBgColor] = useState('#f5e6d3');

    useEffect(() => {
        const meta = document.querySelector('meta[name="theme-color"]');
        if (!meta) return;

        let color;

        if (isSideDrawerOpen) {
            color = '#c0c0c0';
        } else if (currentSection === 'catalog') {
            color = '#161616';
        } else {
            color = headerBgColor;
        }

        meta.setAttribute('content', color);
    }, [isSideDrawerOpen, currentSection, headerBgColor]);

    const isDarkBackground = useCallback((color) => {
        const hex = color.replace('#', '');
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);
        return (0.299 * r + 0.587 * g + 0.114 * b) / 255 < 0.5;
    }, []);

    const useLightText = isSideDrawerOpen
        ? false
        : currentSection === 'catalog'
            ? false
            : isDarkBackground(headerBgColor);

    return {
        headerBgColor,
        setHeaderBgColor,
        useLightText,
    };
}