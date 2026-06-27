import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Splide, SplideSlide } from '@splidejs/react-splide';
import '@splidejs/react-splide/css/core';
import { ProductService } from '@/application/services/ProductService';
import { useScrollLock } from '@/shared/hooks/useScrollLock';
import ProductDetailModal from '@/presentation/components/features/catalog/ProductDetailModal';
import TotemCheckoutFlow from '@/presentation/components/features/totem/TotemCheckoutFlow';
import balaoSaoJoao from '@/assets/img/balao_sao_joao.png';
import './JuninoFestivalModal.css';

const FESTIVAL_PRODUCTS = [
    { id: 22, name: 'Jantar Junino', price: 59.40, category: 'mains', emoji: '🫓', description: 'Jantar com pamonha, canjica, sarapatel e acompanhamentos' },
    { id: 23, name: 'Pamonha Doce', price: 9.9, category: 'mains', emoji: '🌽', description: 'Pamonha doce cozida na palha com coco e leite' },
    { id: 24, name: 'Canjica com Amendoim', price: 11.9, category: 'desserts', emoji: '🥣', description: 'Canjica branca cremosa com amendoim torrado' },
    { id: 25, name: 'Pé de Moleque', price: 5.9, category: 'desserts', emoji: '🍬', description: 'Doce de amendoim com rapadura e melado' },
    { id: 26, name: 'Quentão Nordestino', price: 8.9, category: 'drinks', emoji: '☕', description: 'Bebida quente com gengibre, canela e mel' },
    { id: 27, name: 'Mocotó Junino', price: 17.9, category: 'mains', emoji: '🍲', description: 'Caldo de mocotó com especiarias juninas' },
    { id: 28, name: 'Arroz Doce de Festa', price: 9.9, category: 'desserts', emoji: '🍚', description: 'Arroz doce com leite de coco e canela' },
];

const CATEGORY_LABELS = {
    mains: 'Pratos Principais',
    drinks: 'Bebidas',
    desserts: 'Sobremesas',
};

function groupByCategory(products) {
    const groups = {};
    products.forEach((p) => {
        if (!groups[p.category]) groups[p.category] = [];
        groups[p.category].push(p);
    });
    return Object.entries(groups).map(([category, items]) => ({
        category,
        label: CATEGORY_LABELS[category] || category,
        items,
    }));
}

function JuninoFestivalContent({ onClose, isTotem = false, onProductSelect }) {
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [visible, setVisible] = useState(false);
    const [useFallback, setUseFallback] = useState(false);

    useScrollLock(true);

    useEffect(() => {
        requestAnimationFrame(() => setVisible(true));
        
        ProductService.getBySeason('june-festival')
            .then((products) => {
                console.log('🌽 Produtos do festival (API):', products);
                if (products && products.length > 0) {
                    setGroups(groupByCategory(products));
                    setUseFallback(false);
                } else {
                    console.log('🌽 Usando fallback do festival');
                    setGroups(groupByCategory(FESTIVAL_PRODUCTS));
                    setUseFallback(true);
                }
                setLoading(false);
            })
            .catch((err) => {
                console.error('Erro ao buscar produtos do festival:', err);
                setGroups(groupByCategory(FESTIVAL_PRODUCTS));
                setUseFallback(true);
                setLoading(false);
            });
    }, []);

    const handleClose = () => {
        setVisible(false);
        setTimeout(onClose, 320);
    };

    const handleProductClick = (product) => {
        if (isTotem) {
            setSelectedProduct(product);
            onProductSelect?.(product);
        } else {
            setSelectedProduct(product);
        }
    };

    return (
        <div className={`junino-overlay ${visible ? 'visible' : ''}`}>
            <div className={`junino-modal ${visible ? 'visible' : ''}`}>
                <div className="junino-header">
                    <div className="junino-header-text">
                        <span className="junino-badge">Cardápio Junino</span>
                        <h1 className="junino-title">Sabores & Tradição</h1>
                        {useFallback && (
                            <span className="junino-fallback-badge">Dados locais</span>
                        )}
                    </div>
                    <button className="junino-close" onClick={handleClose}>
                        ✕
                    </button>
                    <img src={balaoSaoJoao} alt="balão de são joão" />
                </div>

                {loading ? (
                    <div className="junino-loading">Carregando menu...</div>
                ) : groups.length === 0 ? (
                    <div className="junino-loading">Nenhum item disponível</div>
                ) : (
                    <Splide
                        className="junino-splide"
                        options={{
                            type: 'slide',
                            perPage: 1,
                            arrows: true,
                            pagination: true,
                            height: '100%',
                            width: '100%',
                            releaseWheel: true,
                        }}
                    >
                        {groups.map((group) => (
                            <SplideSlide key={group.category}>
                                <div className="junino-category-slide">
                                    <h2 className="junino-category-title">{group.label}</h2>
                                    <ul className="junino-product-grid">
                                        {group.items.map((product) => (
                                            <li
                                                key={product.id}
                                                className="junino-product-card"
                                                onClick={() => handleProductClick(product)}
                                            >
                                                <div className="junino-product-emoji">
                                                    {product.emoji || '🪅'}
                                                </div>
                                                <div className="junino-product-info">
                                                    <span className="junino-product-name">{product.name}</span>
                                                    <span className="junino-product-price">
                                                        R$ {product.price.toFixed(2)}
                                                    </span>
                                                </div>
                                                <button
                                                    className="junino-add-btn"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleProductClick(product);
                                                    }}
                                                >
                                                    {isTotem ? 'Comprar' : '+'}
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </SplideSlide>
                        ))}
                    </Splide>
                )}
            </div>

            {selectedProduct && !isTotem && (
                <ProductDetailModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />
            )}

            {selectedProduct && isTotem && (
                <TotemCheckoutFlow
                    product={selectedProduct}
                    onClose={() => {
                        setSelectedProduct(null);
                        handleClose();
                    }}
                    onOrderPlaced={() => {
                        setSelectedProduct(null);
                        handleClose();
                    }}
                />
            )}
        </div>
    );
}

export default function JuninoFestivalModal({ onClose, isTotem = false, onProductSelect }) {
    return createPortal(
        <JuninoFestivalContent onClose={onClose} isTotem={isTotem} onProductSelect={onProductSelect} />,
        document.body
    );
}