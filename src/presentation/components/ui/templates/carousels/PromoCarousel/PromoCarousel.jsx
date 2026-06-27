import { Splide, SplideSlide } from '@splidejs/react-splide';
import '@splidejs/splide/css/core';
import { useCallback } from 'react';
import SlideJunino from './slides/SlideJunino';
import SlideCombo from './slides/SlideCombo';
import SlideAcaraje from './slides/SlideAcaraje';
import { ARROW } from '@/presentation/components/ui/icons/ArrowSlideIcon';
import './PromoCarousel.css';

const promos = [
    { id: 1, bgColor: '#f5e6d3' },
    { id: 2, bgColor: '#e8f5e9' },
    { id: 3, bgColor: '#2d2d2d' },
];

export default function PromoCarousel({
    onCheckout,
    onOpenJuninoFestival,
    onColorChange,
    isTotem = false,
    onPromoProductSelect
}) {
    const handleMove = useCallback((splide) => {
        onColorChange?.(promos[splide.index].bgColor);
    }, [onColorChange]);

    return (
        <Splide
            options={{
                type: 'loop',
                autoplay: false,
                interval: 4000,
                perPage: 1,
                arrows: true,
                pagination: false,
                height: '100%',
                width: '100%',
                arrowPath: ARROW,
            }}
            onMounted={(splide) => {
                handleMove(splide);
                splide.root.querySelectorAll('.splide__arrow svg').forEach((svg) => {
                    svg.setAttribute('viewBox', '0 0 19 8');
                });
            }}
            onMove={handleMove}
        >
            <SplideSlide>
                <SlideJunino
                    onOpenFestivalMenu={onOpenJuninoFestival}
                    isTotem={isTotem}
                />
            </SplideSlide>
            <SplideSlide>
                <SlideCombo
                    onCheckout={onCheckout}
                    isTotem={isTotem}
                    onProductSelect={onPromoProductSelect}
                />
            </SplideSlide>
            <SplideSlide>
                <SlideAcaraje
                    onCheckout={onCheckout}
                    isTotem={isTotem}
                    onProductSelect={onPromoProductSelect}
                />
            </SplideSlide>
        </Splide>
    );
}