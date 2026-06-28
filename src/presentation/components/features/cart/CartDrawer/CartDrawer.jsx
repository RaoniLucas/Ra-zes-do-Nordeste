import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useCart } from '@/presentation/contexts/CartContext';
import { useScrollLock } from '@/shared/hooks/useScrollLock';
import './CartDrawer.css';

function CartDrawerContent({ onCheckout, onClose }) {
    const { items, totalPrice, totalItems, updateQuantity, removeItem } = useCart();
    const [visible, setVisible] = useState(false);

    useScrollLock(true);

    useEffect(() => {
        requestAnimationFrame(() => setVisible(true));
    }, []);

    const handleClose = () => {
        setVisible(false);
        setTimeout(onClose, 260);
    };

    const handleCheckout = () => {
        setVisible(false);
        setTimeout(onCheckout, 260);
    };

    return (
        <div
            className={`cart-drawer-overlay ${visible ? 'visible' : ''}`}
            onClick={handleClose}
        >
            <div
                className={`cart-drawer ${visible ? 'visible' : ''}`}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="cart-drawer-header">
                    <h2 className="cart-drawer-title">
                        Seu carrinho
                        {totalItems > 0 && (
                            <span className="cart-drawer-count">{totalItems}</span>
                        )}
                    </h2>
                    <button className="cart-drawer-close" onClick={handleClose}>✕</button>
                </div>

                {totalItems === 0 ? (
                    <div className="cart-empty">
                        <span className="cart-empty-icon">🛒</span>
                        <p>Seu carrinho está vazio</p>
                    </div>
                ) : (
                    <>
                        <ul className="cart-drawer-list">
                            {items.map(({ product, quantity }) => (
                                <li key={product.id} className="cart-drawer-item">
                                    <span className="cart-drawer-emoji">{product.emoji || '🍽️'}</span>
                                    <div className="cart-drawer-item-info">
                                        <span className="cart-drawer-item-name">{product.name}</span>
                                        <span className="cart-drawer-item-price">
                                            R$ {(product.price * quantity).toFixed(2)}
                                        </span>
                                    </div>
                                    <div className="cart-drawer-stepper">
                                        <button className="cart-stepper-btn" onClick={() => updateQuantity(product.id, quantity - 1)}>−</button>
                                        <span className="cart-stepper-value">{quantity}</span>
                                        <button className="cart-stepper-btn" onClick={() => updateQuantity(product.id, quantity + 1)}>+</button>
                                    </div>
                                    <button className="cart-remove-btn" onClick={() => removeItem(product.id)}>×</button>
                                </li>
                            ))}
                        </ul>

                        <div className="cart-drawer-footer">
                            <div className="cart-drawer-total">
                                <span>Total</span>
                                <span>R$ {totalPrice.toFixed(2)}</span>
                            </div>
                            <button className="cart-checkout-btn" onClick={handleCheckout}>
                                Checkout · R$ {totalPrice.toFixed(2)}
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export default function CartDrawer({ onCheckout, onClose }) {
    return createPortal(
        <CartDrawerContent onCheckout={onCheckout} onClose={onClose} />,
        document.body
    );
}