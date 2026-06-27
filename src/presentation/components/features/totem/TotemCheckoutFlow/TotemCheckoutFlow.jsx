import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useCart } from '@/presentation/contexts/CartContext';
import { useAuth } from '@/presentation/contexts/AuthContext';
import { useScrollLock } from '@/shared/hooks/useScrollLock';
import { OrderService, PaymentService } from '@/application/services';
import { useNotifications } from '@/presentation/contexts/NotificationsContext';
import './TotemCheckoutFlow.css';

function TotemCheckoutContent({ product, onClose, onOrderPlaced }) {
    const { addItem, clearCart } = useCart();
    const { user, token } = useAuth();
    const { addNotification } = useNotifications();

    const [step, setStep] = useState('payment');
    const [loading, setLoading] = useState(false);
    const [visible, setVisible] = useState(false);
    const [orderId, setOrderId] = useState(null);
    const [callNumber, setCallNumber] = useState(null);
    const [customerName, setCustomerName] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('pix');
    const [cardNumber, setCardNumber] = useState('');
    const [cardName, setCardName] = useState('');
    const [cardExpiry, setCardExpiry] = useState('');
    const [cardCvv, setCardCvv] = useState('');

    useScrollLock(true);

    useEffect(() => {
        requestAnimationFrame(() => setVisible(true));
    }, []);

    const handleClose = () => {
        setVisible(false);
        setTimeout(onClose, 260);
    };

    const handlePayment = async () => {
        if (paymentMethod === 'cartao') {
            if (!cardNumber || !cardName || !cardExpiry || !cardCvv) {
                alert('Preencha todos os dados do cartao');
                return;
            }
        }

        if (!customerName.trim()) {
            alert('Digite seu nome para chamada no caixa');
            return;
        }

        setLoading(true);

        try {
            addItem(product, 1);

            const orderData = {
                items: [{
                    productId: product.id,
                    quantity: 1,
                    price: product.price,
                }],
                total: product.price,
                subtotal: product.price,
                deliveryFee: 0,
                deliveryMethod: 'pickup',
                isGuest: !user,
                isTotem: true,
                customerName: customerName,
            };

            const order = await OrderService.create(orderData, token || undefined);
            setOrderId(order.id);

            const paymentResult = await PaymentService.process(
                { orderId: order.id, amount: product.price },
                token || undefined
            );

            if (paymentResult.status === 'approved') {
                // Gerar número de chamada (1-99)
                const callNum = Math.floor(Math.random() * 99) + 1;
                setCallNumber(callNum);

                console.log('✅ Pedido #' + order.id + ' - Chamada: ' + callNum + ' - Cliente: ' + customerName);

                addNotification({
                    type: 'order',
                    orderId: order.id,
                    text: `Totem - ${customerName} - Chamada: ${callNum}`,
                });

                clearCart();
                setStep('done');
                onOrderPlaced?.(order.id);
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

    return (
        <div className={`totem-checkout-overlay ${visible ? 'visible' : ''}`}>
            <div className={`totem-checkout-modal ${visible ? 'visible' : ''}`} onClick={(e) => e.stopPropagation()}>
                <div className="totem-checkout-header">
                    <span className="totem-checkout-title">Pagamento</span>
                    {step !== 'done' && (
                        <button className="totem-checkout-close" onClick={handleClose}>X</button>
                    )}
                </div>

                {step === 'payment' && (
                    <div className="totem-checkout-step">
                        <div className="totem-product-info">
                            <span className="totem-product-emoji">{product.emoji || '🍽️'}</span>
                            <h2 className="totem-product-name">{product.name}</h2>
                            {product.description && (
                                <p className="totem-product-description">{product.description}</p>
                            )}
                            <p className="totem-product-price">R$ {product.price.toFixed(2)}</p>
                        </div>

                        <div className="totem-customer-name">
                            <label>
                                Seu nome (para chamada no caixa)
                                <input
                                    type="text"
                                    value={customerName}
                                    onChange={(e) => setCustomerName(e.target.value)}
                                    placeholder="Digite seu nome"
                                    disabled={loading}
                                />
                            </label>
                        </div>

                        <div className="totem-payment-methods">
                            <label className="totem-payment-option">
                                <input
                                    type="radio"
                                    name="paymentMethod"
                                    value="pix"
                                    checked={paymentMethod === 'pix'}
                                    onChange={() => setPaymentMethod('pix')}
                                />
                                <span>PIX</span>
                            </label>
                            <label className="totem-payment-option">
                                <input
                                    type="radio"
                                    name="paymentMethod"
                                    value="cartao"
                                    checked={paymentMethod === 'cartao'}
                                    onChange={() => setPaymentMethod('cartao')}
                                />
                                <span>Cartão</span>
                            </label>
                        </div>

                        {paymentMethod === 'pix' && (
                            <div className="totem-pix-info">
                                <div className="totem-pix-qr">QR Code</div>
                                <p>Chave: totem@raizes.com.br</p>
                            </div>
                        )}

                        {paymentMethod === 'cartao' && (
                            <div className="totem-card-form">
                                <label>
                                    Número
                                    <input
                                        type="text"
                                        value={cardNumber}
                                        onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, '').slice(0, 16))}
                                        placeholder="0000 0000 0000 0000"
                                        disabled={loading}
                                    />
                                </label>
                                <label>
                                    Nome
                                    <input
                                        type="text"
                                        value={cardName}
                                        onChange={(e) => setCardName(e.target.value)}
                                        placeholder="Nome no cartão"
                                        disabled={loading}
                                    />
                                </label>
                                <div className="totem-card-row">
                                    <label>
                                        Validade
                                        <input
                                            type="text"
                                            value={cardExpiry}
                                            onChange={(e) => {
                                                let value = e.target.value.replace(/\D/g, '');
                                                if (value.length > 2) {
                                                    value = value.slice(0, 2) + '/' + value.slice(2, 4);
                                                }
                                                setCardExpiry(value);
                                            }}
                                            placeholder="MM/AA"
                                            maxLength="5"
                                            disabled={loading}
                                        />
                                    </label>
                                    <label>
                                        CVV
                                        <input
                                            type="text"
                                            value={cardCvv}
                                            onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                                            placeholder="000"
                                            maxLength="4"
                                            disabled={loading}
                                        />
                                    </label>
                                </div>
                            </div>
                        )}

                        <button
                            className="totem-checkout-btn"
                            onClick={handlePayment}
                            disabled={loading || !customerName.trim()}
                        >
                            {loading ? 'Processando...' : `Pagar R$ ${product.price.toFixed(2)}`}
                        </button>
                    </div>
                )}

                {step === 'done' && (
                    <div className="totem-checkout-done">
                        <span className="totem-done-icon">✅</span>
                        <h2>Pedido Confirmado!</h2>
                        <div className="totem-call-number">
                            <span className="totem-call-label">Sua chamada:</span>
                            <span className="totem-call-value">{callNumber}</span>
                        </div>
                        <p className="totem-customer-name-display">
                            {customerName}, aguardamos você no caixa.
                        </p>
                        <p className="totem-call-instruction">
                            Fique atento ao painel de chamadas.
                        </p>
                        <button className="totem-checkout-btn" onClick={handleClose}>
                            Voltar ao cardápio
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function TotemCheckoutFlow({ product, onClose, onOrderPlaced }) {
    return createPortal(
        <TotemCheckoutContent product={product} onClose={onClose} onOrderPlaced={onOrderPlaced} />,
        document.body
    );
}