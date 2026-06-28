import { useCallback } from 'react';
import { Splide, SplideSlide } from '@splidejs/react-splide';
import '@splidejs/splide/css/core';
import CatalogSlide from './slides/CatalogSlide';
import { ARROW } from '@/presentation/components/ui/icons/ArrowSlideIcon';
import './CatalogCarousel.css';

export default function CatalogCarousel({ categories }) {
    const handleMove = useCallback(() => { }, []);

    if (!categories || categories.length === 0) {
        return (
            <div className="category-slide">
                <h2>Nenhum produto disponível em sua região</h2>
                <p>Tente mudar sua localização</p>
            </div>
        );
    }

    return (
        <Splide
            options={{
                type: 'slide',
                perPage: 1,
                height: '100%',
                width: '100%',
                arrows: true,
                pagination: false,
                releaseWheel: true,
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
            {categories.map((category) => (
                <SplideSlide key={category.id}>
                    <CatalogSlide category={category} />
                </SplideSlide>
            ))}
        </Splide>
    );
}