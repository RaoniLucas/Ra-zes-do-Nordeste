import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useCart } from '@/presentation/contexts/CartContext';
import { useAuth } from '@/presentation/contexts/AuthContext';
import { useLocation } from '@/presentation/contexts/LocationContext';
import { useScrollLock } from '@/shared/hooks/useScrollLock';
import { OrderService, PaymentService, PointsService } from '@/application/services';
import StepReview from './steps/StepReview';
import StepPayment from './steps/StepPayment';
import StepLoyalty from './steps/StepLoyalty';
import { useNotifications } from '@/presentation/contexts/NotificationsContext';
import { useOrderSimulation } from '@/application/hooks/useOrderSimulation';
import DeliveryConfirmModal from '@/presentation/components/features/tracking/DeliveryConfirmModal';
import './CheckoutFlow.css';

function ProgressBar({ percent }) {
    return (
        <div className="checkout-progress">
            <div className="checkout-progress-bar" style={{ width: `${percent}%` }} />
        </div>
    );
}

function CheckoutFlowContent({ onClose, onOrderPlaced }) {
    const { items, totalItems, clearCart } = useCart();
    const { user, token, setLoyaltyMember } = useAuth();
    const { addNotification } = useNotifications();
    const { userAddress, getDeliveryFee } = useLocation();

    const [stepIndex, setStepIndex] = useState(0);
    const [loading, setLoading] = useState(false);
    const [orderId, setOrderId] = useState(null);
    const [visible, setVisible] = useState(false);
    const [usePoints, setUsePoints] = useState(false);
    const [pointsToUse, setPointsToUse] = useState(0);
    const [isGuest] = useState(!user);
    const [pointsEarned, setPointsEarned] = useState(0);
    const [isLoyaltyMember, setIsLoyaltyMember] = useState(user?.isLoyaltyMember || false);
    const [loyaltyStepPassed, setLoyaltyStepPassed] = useState(user?.isLoyaltyMember || false);
    const [showDeliveryConfirm, setShowDeliveryConfirm] = useState(false);
    const [orderCompleted, setOrderCompleted] = useState(false);
    const [deliveryMethod, setDeliveryMethod] = useState('pickup');
    const [deliveryAddress, setDeliveryAddress] = useState('');
    const [deliveryComplement, setDeliveryComplement] = useState('');

    const STEPS = isGuest
        ? ['review', 'delivery', 'payment', 'done']
        : ['review', 'loyalty', 'delivery', 'points', 'payment', 'done'];

    useScrollLock(true);

    useEffect(() => {
        requestAnimationFrame(() => setVisible(true));
    }, []);

    const handleClose = () => {
        setVisible(false);
        setTimeout(onClose, 260);
    };

    const totalPrice = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
    const deliveryFee = deliveryMethod === 'delivery' ? getDeliveryFee() : 0;
    const maxPointsToUse = user?.pontos || 0;
    const maxPointsValue = Math.min(maxPointsToUse * 0.1, totalPrice * 0.2);
    const pointsValue = usePoints ? Math.min(pointsToUse * 0.1, maxPointsValue) : 0;
    const finalPrice = Math.max(0, totalPrice + deliveryFee - pointsValue);

    const next = () => setStepIndex(i => Math.min(i + 1, STEPS.length - 1));
    const back = () => setStepIndex(i => Math.max(i - 1, 0));

    const handlePayment = async () => {
        setLoading(true);

        try {
            const orderData = {
                items: items.map(i => ({
                    productId: i.product.id,
                    quantity: i.quantity,
                    price: i.product.price,
                })),
                total: finalPrice,
                subtotal: totalPrice,
                deliveryFee: deliveryFee,
                deliveryMethod: deliveryMethod,
                deliveryAddress: deliveryMethod === 'delivery' ? deliveryAddress : null,
                deliveryComplement: deliveryMethod === 'delivery' ? deliveryComplement : null,
                usedPoints: usePoints,
                pointsUsed: pointsToUse,
                isGuest: isGuest,
                isLoyaltyMember: isLoyaltyMember,
            };

            const order = await OrderService.create(orderData, token || undefined);
            setOrderId(order.id);

            addNotification({
                type: 'order',
                orderId: order.id,
                text: `Pedido #${order.id} confirmado!`,
            });

            const paymentResult = await PaymentService.process(
                { orderId: order.id, amount: finalPrice },
                token || undefined
            );

            if (paymentResult.status === 'approved') {
                addNotification({
                    type: 'tracking',
                    orderId: order.id,
                    text: `Pedido #${order.id} em preparacao.`,
                });

                clearCart();
                onOrderPlaced?.(order.id);
                next();
            } else {
                alert('Pagamento recusado. Tente novamente.');
            }
        } catch (err) {
            console.error('Erro no checkout:', err);
            alert('Erro ao processar pedido: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleLoyaltyAccept = () => {
        setIsLoyaltyMember(true);
        setLoyaltyStepPassed(true);
        setLoyaltyMember(true);
        next();
    };

    const handleLoyaltyDecline = () => {
        setIsLoyaltyMember(false);
        setLoyaltyStepPassed(true);
        next();
    };

    const handleLoyaltySkip = () => {
        setIsLoyaltyMember(false);
        setLoyaltyStepPassed(true);
        next();
    };

    const handleDeliveryConfirm = async () => {
        setShowDeliveryConfirm(false);
        await OrderService.updateStatus(orderId, 'picked-up', token);
        onOrderPlaced?.(orderId);
        next();
    };

    const handleDeliveryDispute = () => {
        setShowDeliveryConfirm(false);
        addNotification({
            type: 'delivery',
            orderId: orderId,
            text: `Problema relatado no pedido #${orderId}. Nossa equipe entrara em contato.`,
        });
        onOrderPlaced?.(orderId);
        next();
    };

    useOrderSimulation({
        orderId: orderId || null,
        token: token,
        onStatusChange: (status) => {
            if (!isGuest) {
                addNotification({
                    type: 'tracking',
                    orderId: orderId,
                    text: `Pedido #${orderId}: ${status}.`,
                });
            }
        },
        onReadyForPickup: () => {
            console.log('Pedido pronto! Exibindo modal de confirmacao...');
            setShowDeliveryConfirm(true);
        },
    });

    const currentStep = STEPS[stepIndex];
    const progressPercent = (stepIndex / (STEPS.length - 1)) * 100;

    const renderStep = () => {
        switch (currentStep) {
            case 'review':
                return (
                    <StepReview
                        items={items}
                        totalPrice={totalPrice}
                        onNext={next}
                        onClose={handleClose}
                    />
                );
            case 'loyalty':
                if (isGuest) {
                    next();
                    return null;
                }
                if (user?.isLoyaltyMember) {
                    next();
                    return null;
                }
                if (loyaltyStepPassed) {
                    next();
                    return null;
                }
                return (
                    <StepLoyalty
                        user={user}
                        onAccept={handleLoyaltyAccept}
                        onDecline={handleLoyaltyDecline}
                        onSkip={handleLoyaltySkip}
                    />
                );
            case 'delivery':
                const hasUserAddress = user && userAddress && (userAddress.logradouro || userAddress.rua);
                
                return (
                    <div className="checkout-step">
                        <h2 className="checkout-step-title">Entrega</h2>

                        <div className="delivery-options">
                            <label className="delivery-option">
                                <input
                                    type="radio"
                                    name="deliveryMethod"
                                    value="pickup"
                                    checked={deliveryMethod === 'pickup'}
                                    onChange={() => setDeliveryMethod('pickup')}
                                />
                                <div>
                                    <span className="delivery-option-title">Retirada na loja</span>
                                    <span className="delivery-option-price">Gratuito</span>
                                </div>
                            </label>

                            <label className="delivery-option">
                                <input
                                    type="radio"
                                    name="deliveryMethod"
                                    value="delivery"
                                    checked={deliveryMethod === 'delivery'}
                                    onChange={() => setDeliveryMethod('delivery')}
                                />
                                <div>
                                    <span className="delivery-option-title">Entrega em casa</span>
                                    <span className="delivery-option-price">R$ {getDeliveryFee().toFixed(2)}</span>
                                </div>
                            </label>
                        </div>

                        {deliveryMethod === 'delivery' && (
                            <div className="delivery-address">
                                {hasUserAddress && (
                                    <button
                                        type="button"
                                        className="delivery-use-address-btn"
                                        onClick={() => {
                                            const addr = userAddress;
                                            const parts = [];
                                            if (addr.logradouro || addr.rua) parts.push(addr.logradouro || addr.rua);
                                            if (addr.numero) parts.push(addr.numero);
                                            if (addr.bairro) parts.push(addr.bairro);
                                            if (addr.cidade) parts.push(addr.cidade);
                                            if (addr.estado) parts.push(addr.estado);
                                            setDeliveryAddress(parts.join(', '));
                                        }}
                                    >
                                        Usar endereco do perfil
                                    </button>
                                )}

                                <label>
                                    Endereco de entrega
                                    <input
                                        type="text"
                                        value={deliveryAddress}
                                        onChange={(e) => setDeliveryAddress(e.target.value)}
                                        placeholder="Rua, numero, bairro, cidade"
                                    />
                                </label>
                                <label>
                                    Complemento
                                    <input
                                        type="text"
                                        value={deliveryComplement}
                                        onChange={(e) => setDeliveryComplement(e.target.value)}
                                        placeholder="Apto, bloco, referencia"
                                    />
                                </label>
                            </div>
                        )}

                        <div className="checkout-total">
                            <span>Subtotal</span>
                            <span>R$ {totalPrice.toFixed(2)}</span>
                        </div>
                        {deliveryMethod === 'delivery' && (
                            <div className="checkout-total">
                                <span>Frete</span>
                                <span>R$ {deliveryFee.toFixed(2)}</span>
                            </div>
                        )}
                        <div className="checkout-total" style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
                            <span>Total</span>
                            <span>R$ {(totalPrice + deliveryFee).toFixed(2)}</span>
                        </div>

                        <div className="checkout-actions">
                            <button className="checkout-btn-secondary" onClick={back}>
                                Voltar
                            </button>
                            <button
                                className="checkout-btn-primary"
                                onClick={next}
                                disabled={deliveryMethod === 'delivery' && !deliveryAddress}
                            >
                                Continuar
                            </button>
                        </div>
                    </div>
                );
            case 'points':
                if (isGuest || !user || !isLoyaltyMember) {
                    next();
                    return null;
                }
                return (
                    <div className="checkout-step">
                        <h2 className="checkout-step-title">Pontos de Fidelidade</h2>
                        <div className="points-box">
                            <div className="points-box-row">
                                <span>Seu saldo</span>
                                <span className="points-value">{user?.pontos || 0} pts</span>
                            </div>
                            <div className="points-box-row">
                                <span>Desconto maximo</span>
                                <span>R$ {maxPointsValue.toFixed(2)}</span>
                            </div>
                        </div>

                        <div className="points-slider-container">
                            <label className="points-slider-label">
                                <input
                                    type="checkbox"
                                    checked={usePoints}
                                    onChange={() => setUsePoints(p => !p)}
                                />
                                Usar pontos para desconto
                            </label>

                            {usePoints && (
                                <div className="points-slider">
                                    <label>
                                        Quantidade de pontos: <strong>{pointsToUse}</strong>
                                        <span className="points-slider-value">
                                            (R$ {(pointsToUse * 0.1).toFixed(2)})
                                        </span>
                                    </label>
                                    <input
                                        type="range"
                                        min="0"
                                        max={Math.min(maxPointsToUse, Math.floor(maxPointsValue / 0.1))}
                                        value={pointsToUse}
                                        onChange={(e) => setPointsToUse(Number(e.target.value))}
                                        className="points-slider-input"
                                    />
                                    <div className="points-slider-limits">
                                        <span>0 pts</span>
                                        <span>{Math.min(maxPointsToUse, Math.floor(maxPointsValue / 0.1))} pts</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="checkout-total">
                            <span>Total com desconto</span>
                            <span>R$ {finalPrice.toFixed(2)}</span>
                        </div>
                        <button className="checkout-btn-primary" onClick={next}>
                            Ir para Pagamento
                        </button>
                    </div>
                );
            case 'payment':
                return (
                    <StepPayment
                        finalPrice={finalPrice}
                        onConfirm={handlePayment}
                        onBack={back}
                        loading={loading}
                    />
                );
            case 'done':
                return (
                    <div className="checkout-step checkout-done">
                        <span className="done-icon">✓</span>
                        <h2 className="checkout-step-title">Pedido Confirmado</h2>
                        <p className="done-hint">
                            Pedido #{orderId} recebido com sucesso.
                            {!isGuest && pointsEarned > 0 && ` Voce ganhou ${pointsEarned} pontos.`}
                        </p>
                        <p className="done-hint" style={{ fontSize: '0.85rem', color: '#888' }}>
                            {isGuest
                                ? 'Para acompanhar seu pedido, cadastre-se no app.'
                                : 'Acompanhe seu pedido pelo menu lateral ou notificacoes.'}
                        </p>
                        <button className="checkout-btn-primary" onClick={handleClose}>
                            Voltar ao menu
                        </button>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <>
            <div className={`checkout-overlay ${visible ? 'visible' : ''}`}>
                <div className={`checkout-modal ${visible ? 'visible' : ''}`} onClick={(e) => e.stopPropagation()}>
                    <div className="checkout-header">
                        <span className="checkout-title">Checkout</span>
                        {currentStep !== 'done' && (
                            <button className="checkout-close" onClick={handleClose}>X</button>
                        )}
                    </div>
                    <ProgressBar percent={progressPercent} />
                    {renderStep()}
                </div>
            </div>

            {showDeliveryConfirm && orderId && (
                <DeliveryConfirmModal
                    orderId={orderId}
                    onConfirm={handleDeliveryConfirm}
                    onDispute={handleDeliveryDispute}
                />
            )}
        </>
    );
}

export default function CheckoutFlow({ onClose, onOrderPlaced }) {
    return createPortal(
        <CheckoutFlowContent onClose={onClose} onOrderPlaced={onOrderPlaced} />,
        document.body
    );
}