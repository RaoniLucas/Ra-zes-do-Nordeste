import { useState, useEffect, useRef } from 'react';

export function useScrollDetection() {
    const [currentSection, setCurrentSection] = useState('promo');
    const containerRef = useRef(null);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const handleScroll = () => {
            setCurrentSection(
                container.scrollTop > window.innerHeight * 0.5 ? 'catalog' : 'promo',
            );
        };

        container.addEventListener('scroll', handleScroll);
        return () => container.removeEventListener('scroll', handleScroll);
    }, []);

    return { currentSection, containerRef };
}