import { createPortal } from 'react-dom';
import { useState, useEffect } from 'react';
import { useOrderTracking } from '@/application/hooks/useOrderTracking';
import { OrderService } from '@/application/services/OrderService';
import { useAuth } from '@/presentation/contexts/AuthContext';
import { useScrollLock } from '@/shared/hooks/useScrollLock';
import { PointsService } from '@/application/services/PointsService';
import { useNotifications } from '@/presentation/contexts/NotificationsContext';
import './OrderTrackingModal.css';

const STEP_LABELS = {
    received: 'Pedido Recebido',
    confirmed: 'Confirmado',
    preparing: 'Preparando',
    ready: 'Pronto para Retirada',
    'picked-up': 'Retirado',
};

function OrderTrackingContent({ orderId, onClose }) {
    const { order, error, currentIndex, statusSequence } = useOrderTracking(orderId);
    const { user, token } = useAuth();
    const { addNotification } = useNotifications();
    const [visible, setVisible] = useState(false);
    const [isConfirming, setIsConfirming] = useState(false);
    const [confirmError, setConfirmError] = useState('');
    const [showFeedback, setShowFeedback] = useState(false);
    const [showPoints, setShowPoints] = useState(false);
    const [showRefund, setShowRefund] = useState(false);
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [pointsEarned, setPointsEarned] = useState(0);
    const isLoyaltyMember = user?.isLoyaltyMember || false;

    useScrollLock(true);

    useEffect(() => {
        requestAnimationFrame(() => setVisible(true));
    }, []);

    const handleClose = () => {
        setVisible(false);
        setTimeout(onClose, 260);
    };

    useEffect(() => {
        if (order && order.status === 'received') {
            console.log('Forcando atualizacao para ready...');
            const advanceToReady = async () => {
                try {
                    await OrderService.updateStatus(orderId, 'confirmed', token);
                    await OrderService.updateStatus(orderId, 'preparing', token);
                    await OrderService.updateStatus(orderId, 'ready', token);
                    console.log('Pedido atualizado para ready');
                } catch (err) {
                    console.error('Erro ao forcar atualizacao:', err);
                }
            };
            advanceToReady();
        }
    }, [order, orderId, token]);

    const handleConfirmPickup = async () => {
        if (!orderId) return;
        setIsConfirming(true);
        setConfirmError('');
        try {
            console.log('Confirmando retirada do pedido:', orderId);
            await OrderService.updateStatus(orderId, 'picked-up', token);

            if (isLoyaltyMember && order) {
                const earned = Math.floor(order.total || 0);
                try {
                    await PointsService.add(earned, token);
                    setPointsEarned(earned);
                    addNotification({
                        type: 'points',
                        text: `Voce ganhou ${earned} pontos com o pedido #${orderId}!`,
                        canDelete: true,
                    });
                } catch (err) {
                    console.warn('Erro ao adicionar pontos:', err);
                }
            }

            setShowFeedback(true);
        } catch (err) {
            console.error('Erro ao confirmar retirada:', err);
            setConfirmError('Falha ao confirmar retirada. Tente novamente.');
        } finally {
            setIsConfirming(false);
        }
    };

    const handleDisputePickup = async () => {
        if (!orderId) return;
        setIsConfirming(true);
        setConfirmError('');
        try {
            console.log('Reportando problema no pedido:', orderId);
            await OrderService.updateStatus(orderId, 'picked-up', token);

            if (isLoyaltyMember && order) {
                const earned = Math.floor(order.total || 0);
                try {
                    await PointsService.add(earned, token);
                    setPointsEarned(earned);
                } catch (err) {
                    console.warn('Erro ao adicionar pontos:', err);
                }
            }

            setShowRefund(true);
        } catch (err) {
            console.error('Erro ao reportar problema:', err);
            setConfirmError('Falha ao reportar problema. Tente novamente.');
        } finally {
            setIsConfirming(false);
        }
    };

    const handleFeedbackSubmit = () => {
        setShowFeedback(false);
        if (isLoyaltyMember && pointsEarned > 0) {
            setShowPoints(true);
        } else {
            handleClose();
        }
    };

    const handlePointsConfirm = () => {
        setShowPoints(false);
        handleClose();
    };

    const handleRefundConfirm = () => {
        setShowRefund(false);
        if (isLoyaltyMember && pointsEarned > 0) {
            setShowPoints(true);
        } else {
            handleClose();
        }
    };

    if (!orderId) {
        return (
            <div className="tracking-overlay" onClick={handleClose}>
                <div className="tracking-modal">
                    <div className="tracking-header">
                        <h2>Rastreio de Pedido</h2>
                        <button className="tracking-close" onClick={handleClose}>X</button>
                    </div>
                    <div className="tracking-loading">Nenhum pedido selecionado</div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="tracking-overlay" onClick={handleClose}>
                <div className="tracking-modal">
                    <div className="tracking-header">
                        <h2>Rastreio de Pedido</h2>
                        <button className="tracking-close" onClick={handleClose}>X</button>
                    </div>
                    <div className="tracking-error">{error}</div>
                </div>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="tracking-overlay" onClick={handleClose}>
                <div className="tracking-modal">
                    <div className="tracking-header">
                        <h2>Rastreio de Pedido</h2>
                        <button className="tracking-close" onClick={handleClose}>X</button>
                    </div>
                    <div className="tracking-loading">Carregando status do pedido...</div>
                </div>
            </div>
        );
    }

    const isReady = order.status === 'ready';
    const isPickedUp = order.status === 'picked-up';

    return (
        <>
            <div className={`tracking-overlay ${visible ? 'visible' : ''}`} onClick={handleClose}>
                <div className={`tracking-modal ${visible ? 'visible' : ''}`} onClick={(e) => e.stopPropagation()}>
                    <div className="tracking-header">
                        <div>
                            <h2 className="tracking-title">Rastreio do Pedido</h2>
                            <span className="tracking-order-id">Pedido #{order.orderId}</span>
                        </div>
                        <button className="tracking-close" onClick={handleClose}>X</button>
                    </div>

                    <div className="tracking-status-badge">
                        <span className="tracking-status-label">
                            {STEP_LABELS[order.status] || order.status}
                        </span>
                    </div>

                    <ol className="tracking-steps">
                        {statusSequence.map((step, index) => {
                            const done = index <= currentIndex;
                            const active = index === currentIndex;
                            return (
                                <li key={step} className={`tracking-step ${done ? 'done' : ''} ${active ? 'active' : ''}`}>
                                    <div className="tracking-step-indicator">
                                        <span className="tracking-step-dot">
                                            {done ? '✓' : index + 1}
                                        </span>
                                        {index < statusSequence.length - 1 && (
                                            <div className={`tracking-step-line ${done ? 'done' : ''}`} />
                                        )}
                                    </div>
                                    <div className="tracking-step-content">
                                        <span className="tracking-step-label">{STEP_LABELS[step]}</span>
                                        {active && order.status !== 'picked-up' && order.status !== 'ready' && (
                                            <span className="tracking-step-pulse">Em andamento...</span>
                                        )}
                                        {active && order.status === 'ready' && (
                                            <span className="tracking-step-pulse" style={{ color: '#2d6a4f' }}>
                                                Aguardando confirmacao de retirada
                                            </span>
                                        )}
                                    </div>
                                </li>
                            );
                        })}
                    </ol>

                    {confirmError && (
                        <div className="tracking-error" style={{ margin: '0 20px' }}>
                            {confirmError}
                        </div>
                    )}

                    {isReady && !isPickedUp && (
                        <div className="tracking-actions">
                            <button
                                className="tracking-confirm-btn"
                                onClick={handleConfirmPickup}
                                disabled={isConfirming}
                            >
                                {isConfirming ? 'Confirmando...' : 'Confirmar Entrega'}
                            </button>
                            <button
                                className="tracking-dispute-btn"
                                onClick={handleDisputePickup}
                                disabled={isConfirming}
                            >
                                {isConfirming ? 'Processando...' : 'Nao recebi'}
                            </button>
                        </div>
                    )}

                    {isPickedUp && (
                        <div className="tracking-picked-up-msg">
                            Pedido retirado com sucesso! Volte sempre.
                        </div>
                    )}

                    <p className="tracking-refresh-hint">
                        {isPickedUp
                            ? 'Seu pedido foi retirado. Bom apetite!'
                            : isReady
                                ? 'Pedido pronto para retirada. Confirme a entrega abaixo.'
                                : 'Status atualiza automaticamente...'}
                    </p>

                    <button className="tracking-close-btn" onClick={handleClose}>
                        Voltar ao menu
                    </button>
                </div>
            </div>

            {showFeedback && (
                <div className="feedback-overlay">
                    <div className="feedback-modal">
                        <h3>Como foi sua experiencia?</h3>
                        <div className="feedback-stars">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <span
                                    key={star}
                                    className={`feedback-star ${star <= (hoverRating || rating) ? 'active' : ''}`}
                                    onMouseEnter={() => setHoverRating(star)}
                                    onMouseLeave={() => setHoverRating(0)}
                                    onClick={() => setRating(star)}
                                >
                                    ★
                                </span>
                            ))}
                        </div>
                        <p className="feedback-hint">
                            {rating === 0 ? 'Toque em uma estrela para avaliar' :
                                rating === 1 ? 'Muito ruim' :
                                    rating === 2 ? 'Ruim' :
                                        rating === 3 ? 'Regular' :
                                            rating === 4 ? 'Bom' :
                                                'Excelente'}
                        </p>
                        <button
                            className="feedback-submit-btn"
                            onClick={handleFeedbackSubmit}
                            disabled={rating === 0}
                        >
                            Enviar feedback
                        </button>
                    </div>
                </div>
            )}

            {showPoints && (
                <div className="points-modal-overlay">
                    <div className="points-modal">
                        <span className="points-modal-icon">⭐</span>
                        <h3>Pontos Ganhos!</h3>
                        <p className="points-modal-amount">
                            +{pointsEarned} pontos
                        </p>
                        <p className="points-modal-text">
                            Voce ganhou {pointsEarned} pontos com este pedido!
                            Continue acumulando para obter descontos exclusivos.
                        </p>
                        <button className="points-modal-btn" onClick={handlePointsConfirm}>
                            Que legal!
                        </button>
                    </div>
                </div>
            )}

            {showRefund && (
                <div className="refund-overlay">
                    <div className="refund-modal">
                        <span className="refund-modal-icon">💰</span>
                        <h3>Reembolso Solicitado</h3>
                        <p className="refund-modal-text">
                            Seu pedido sera reembolsado em ate 5 dias uteis.
                            Seus pontos de fidelidade permanecem na sua conta.
                        </p>
                        <button className="refund-modal-btn" onClick={handleRefundConfirm}>
                            Entendi
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}

export default function OrderTrackingModal({ orderId, onClose }) {
    return createPortal(
        <OrderTrackingContent orderId={orderId} onClose={onClose} />,
        document.body
    );
}