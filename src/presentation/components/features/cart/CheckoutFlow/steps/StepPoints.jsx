import { useState } from 'react';

export default function StepPoints({ user, totalPrice, usePoints, onToggle, onNext }) {
    const pointsValue = Math.min((user?.pontos || 0) * 0.1, totalPrice * 0.2);
    const finalPrice = usePoints
        ? Math.max(0, totalPrice - pointsValue)
        : totalPrice;

    return (
        <div className="checkout-step">
            <h2 className="checkout-step-title">Pontos de Fidelidade</h2>
            <div className="points-box">
                <div className="points-box-row">
                    <span>Seu saldo</span>
                    <span className="points-value">{user?.pontos || 0} pts</span>
                </div>
                <div className="points-box-row">
                    <span>Desconto com pontos</span>
                    <span>– R$ {pointsValue.toFixed(2)}</span>
                </div>
            </div>
            <label className="points-toggle">
                <input type="checkbox" checked={usePoints} onChange={onToggle} />
                Usar pontos e economizar R$ {pointsValue.toFixed(2)}
            </label>
            <div className="checkout-total">
                <span>Total</span>
                <span>R$ {finalPrice.toFixed(2)}</span>
            </div>
            <div className="checkout-actions">
                <button className="checkout-btn-primary" onClick={onNext}>
                    Ir para Pagamento
                </button>
            </div>
        </div>
    );
}