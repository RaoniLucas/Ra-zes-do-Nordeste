export default function StepReview({ items, totalPrice, onNext, onClose }) {
    return (
        <div className="checkout-step">
            <h2 className="checkout-step-title">Revisão do Pedido</h2>
            <ul className="checkout-item-list">
                {items.map(({ product, quantity }) => (
                    <li key={product.id} className="checkout-item">
                        <span className="checkout-item-emoji">{product.emoji || '🍽️'}</span>
                        <div className="checkout-item-info">
                            <span className="checkout-item-name">{product.name}</span>
                            <span className="checkout-item-qty">× {quantity}</span>
                        </div>
                        <span className="checkout-item-price">
                            R$ {(product.price * quantity).toFixed(2)}
                        </span>
                    </li>
                ))}
            </ul>
            <div className="checkout-total">
                <span>Total</span>
                <span>R$ {totalPrice.toFixed(2)}</span>
            </div>
            <div className="checkout-actions">
                <button className="checkout-btn-secondary" onClick={onClose}>
                    Cancelar
                </button>
                <button className="checkout-btn-primary" onClick={onNext}>
                    Continuar
                </button>
            </div>
        </div>
    );
}