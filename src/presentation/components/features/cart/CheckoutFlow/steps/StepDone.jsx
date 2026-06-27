export default function StepDone({ orderId, isGuest, pointsEarned, onClose }) {
    return (
        <div className="checkout-step checkout-done">
            <span className="done-icon">✓</span>
            <h2 className="checkout-step-title">Pedido Confirmado!</h2>
            <p className="done-hint">
                {isGuest
                    ? `Pedido #${orderId} recebido. Pedidos como convidado não podem ser rastreados em tempo real.`
                    : `Pedido #${orderId} recebido! Acompanhe pelo menu ou pelas notificações.`}
            </p>
            {!isGuest && pointsEarned > 0 && (
                <div className="done-points-badge">
                    ⭐ +{pointsEarned} pts ganhos neste pedido
                </div>
            )}
            <button className="checkout-btn-primary" onClick={onClose}>
                Voltar ao menu
            </button>
        </div>
    );
}