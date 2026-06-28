import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useScrollLock } from '@/shared/hooks/useScrollLock';
import './DeliveryConfirmModal.css';

function DeliveryConfirmContent({ orderId, onConfirm, onDispute }) {
    const [visible, setVisible] = useState(false);
    useScrollLock(true);
    useEffect(() => {
        requestAnimationFrame(() => setVisible(true));
    }, []);

    const handleConfirm = () => {
        console.log('Confirmando entrega do pedido:', orderId);
        onConfirm();
    };

    const handleDispute = () => {
        console.log('Reportando problema no pedido:', orderId);
        onDispute();
    };

    return (
        <div className={`delivery-overlay ${visible ? 'visible' : ''}`}>
            <div className={`delivery-modal ${visible ? 'visible' : ''}`} onClick={(e) => e.stopPropagation()}>
                <span className="delivery-icon">🔔</span>
                <h2 className="delivery-title">Seu pedido está pronto!</h2>
                <p className="delivery-hint">
                    Pedido #{orderId} está pronto para retirada/entrega. Confirme que você recebeu o pedido.
                </p>
                <div className="delivery-actions">
                    <button className="delivery-btn-confirm" onClick={handleConfirm}>
                        Sim, recebi o pedido!
                    </button>
                    <button className="delivery-btn-dispute" onClick={handleDispute}>
                        Houve um problema
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function DeliveryConfirmModal({ orderId, onConfirm, onDispute }) {
    return createPortal(
        <DeliveryConfirmContent orderId={orderId} onConfirm={onConfirm} onDispute={onDispute} />,
        document.body
    );
}