import { useState } from 'react';
import TotemCheckoutFlow from '../TotemCheckoutFlow';
import './TotemProductCard.css';

export default function TotemProductCard({ product, onOrderPlaced }) {
    const [showCheckout, setShowCheckout] = useState(false);

    return (
        <>
            <div className="totem-product-card" onClick={() => setShowCheckout(true)}>
                <div className="totem-product-card-image">
                    <span className="totem-product-card-emoji">{product.emoji || '🍽️'}</span>
                </div>
                <div className="totem-product-card-info">
                    <h3 className="totem-product-card-name">{product.name}</h3>
                    <span className="totem-product-card-price">R$ {product.price.toFixed(2)}</span>
                </div>
                <button
                    className="totem-product-card-btn"
                    onClick={(e) => {
                        e.stopPropagation();
                        setShowCheckout(true);
                    }}
                >
                    Comprar
                </button>
            </div>

            {showCheckout && (
                <TotemCheckoutFlow
                    product={product}
                    onClose={() => setShowCheckout(false)}
                    onOrderPlaced={onOrderPlaced}
                />
            )}
        </>
    );
}