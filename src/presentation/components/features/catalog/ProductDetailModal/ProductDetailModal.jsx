import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useCart } from '@/presentation/contexts/CartContext';
import { useUnit } from '@/presentation/contexts/UnitContext';
import { ProductService } from '@/application/services/ProductService';
import { useScrollLock } from '@/shared/hooks/useScrollLock';
import './ProductDetailModal.css';

function StockBadge({ stock, inCart }) {
    if (stock == null) return null;
    const remaining = stock - inCart;
    if (remaining <= 0) return <span className="stock-badge out">Esgotado nesta unidade</span>;
    if (remaining <= 3) return <span className="stock-badge low">Apenas {remaining} à esquerda</span>;
    return null;
}

function SuggestionItem({ item }) {
    const { addItem } = useCart();
    const [added, setAdded] = useState(false);

    return (
        <li className="suggestion-item">
            <span className="suggestion-emoji">{item.emoji || '🍽️'}</span>
            <div className="suggestion-info">
                <span className="suggestion-name">{item.name}</span>
                <span className="suggestion-price">R$ {item.price.toFixed(2)}</span>
            </div>
            <button
                className={`suggestion-add-btn ${added ? 'added' : ''}`}
                onClick={() => {
                    if (!added) {
                        addItem(item, 1);
                        setAdded(true);
                    }
                }}
                disabled={added}
            >
                {added ? '✓' : '+'}
            </button>
        </li>
    );
}

function ProductDetailModalContent({ product, onClose }) {
    const { addItemWithStockCheck, items } = useCart();
    const { activeUnit } = useUnit();

    const [quantity, setQuantity] = useState(1);
    const [suggestions, setSuggestions] = useState([]);
    const [stockAtUnit, setStockAtUnit] = useState(null);
    const [stockWarning, setStockWarning] = useState(null);
    const [added, setAdded] = useState(false);
    const [visible, setVisible] = useState(false);

    const inCart = items.find((i) => i.product.id === product.id)?.quantity ?? 0;

    useScrollLock(true);

    useEffect(() => {
        requestAnimationFrame(() => setVisible(true));

        ProductService.getSuggestions(product.id)
            .then(setSuggestions)
            .catch(() => setSuggestions([]));

        if (activeUnit?.id) {
            ProductService.getStock(product.id, activeUnit.id)
                .then((data) => setStockAtUnit(data.stock))
                .catch(() => setStockAtUnit(null));
        }
    }, [product.id, activeUnit?.id]);

    const maxQuantity = stockAtUnit != null ? Math.max(0, stockAtUnit - inCart) : 99;
    const cappedQuantity = Math.min(quantity, maxQuantity);

    useEffect(() => {
        if (quantity > maxQuantity && maxQuantity > 0) {
            setQuantity(maxQuantity);
        }
    }, [maxQuantity]);

    const handleClose = () => {
        setVisible(false);
        setTimeout(onClose, 260);
    };

    const handleAdd = async () => {
        if (maxQuantity === 0) return;

        const result = await addItemWithStockCheck(product, cappedQuantity, stockAtUnit ?? undefined);

        if (!result.ok && result.added > 0) {
            setStockWarning(
                `Apenas ${result.available} unidade${result.available !== 1 ? 's' : ''} disponível neste local — adicionamos ${result.added} ao seu carrinho.`
            );
            setAdded(true);
            setTimeout(handleClose, 2000);
            return;
        }

        if (!result.ok && result.added === 0) {
            setStockWarning(`Este item não está mais disponível nesta unidade.`);
            return;
        }

        setAdded(true);
        setTimeout(handleClose, 700);
    };

    const isOutOfStock = maxQuantity === 0;

    return (
        <div
            className={`product-detail-overlay ${visible ? 'visible' : ''}`}
            onClick={handleClose}
        >
            <div
                className={`product-detail-modal ${visible ? 'visible' : ''}`}
                onClick={(e) => e.stopPropagation()}
            >
                <button className="product-detail-close" onClick={handleClose}>✕</button>

                <div className="product-detail-hero">
                    <span className="product-detail-emoji">{product.emoji || '🍽️'}</span>
                </div>

                <div className="product-detail-body">
                    <div className="product-detail-header">
                        <h2 className="product-detail-name">{product.name}</h2>
                        <span className="product-detail-price">R$ {product.price.toFixed(2)}</span>
                    </div>

                    <p className="product-detail-description">{product.description}</p>

                    <StockBadge stock={stockAtUnit} inCart={inCart} />

                    {stockWarning && (
                        <div className="stock-warning">{stockWarning}</div>
                    )}

                    {!isOutOfStock && (
                        <div className="product-detail-quantity">
                            <span className="product-detail-quantity-label">Quantity</span>
                            <div className="quantity-stepper">
                                <button
                                    className="quantity-btn"
                                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                                    disabled={quantity <= 1}
                                >
                                    −
                                </button>
                                <span className="quantity-value">{cappedQuantity}</span>
                                <button
                                    className="quantity-btn"
                                    onClick={() => setQuantity((q) => Math.min(q + 1, maxQuantity))}
                                    disabled={cappedQuantity >= maxQuantity}
                                >
                                    +
                                </button>
                            </div>
                            <span className="product-detail-subtotal">
                                R$ {(product.price * cappedQuantity).toFixed(2)}
                            </span>
                        </div>
                    )}

                    <button
                        className={`product-detail-add-btn ${added ? 'added' : ''} ${isOutOfStock ? 'out-of-stock' : ''}`}
                        onClick={handleAdd}
                        disabled={added || isOutOfStock}
                    >
                        {isOutOfStock
                            ? 'Esgotado nesta unidade'
                            : added
                                ? 'Adicionado ao carrinho ✓'
                                : `Adicionar ao carrinho · R$ ${(product.price * cappedQuantity).toFixed(2)}`}
                    </button>

                    {suggestions.length > 0 && (
                        <div className="product-detail-suggestions">
                            <h3 className="suggestions-title">Combina bem com</h3>
                            <ul className="suggestions-list">
                                {suggestions.slice(0, 3).map((s) => (
                                    <SuggestionItem key={s.id} item={s} />
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function ProductDetailModal({ product, onClose }) {
    return createPortal(
        <ProductDetailModalContent product={product} onClose={onClose} />,
        document.body
    );
}