import { useState } from 'react';

export default function StepPayment({ finalPrice, onConfirm, onBack, loading }) {
    const [paymentMethod, setPaymentMethod] = useState('pix');
    const [cardNumber, setCardNumber] = useState('');
    const [cardName, setCardName] = useState('');
    const [cardExpiry, setCardExpiry] = useState('');
    const [cardCvv, setCardCvv] = useState('');

    const handleConfirm = () => {
        if (paymentMethod === 'cartao') {
            if (!cardNumber || !cardName || !cardExpiry || !cardCvv) {
                alert('Preencha todos os dados do cartao');
                return;
            }
        }
        onConfirm();
    };

    return (
        <div className="checkout-step">
            <h2 className="checkout-step-title">Pagamento</h2>

            <div className="payment-methods">
                <label className="payment-method-option">
                    <input
                        type="radio"
                        name="paymentMethod"
                        value="pix"
                        checked={paymentMethod === 'pix'}
                        onChange={() => setPaymentMethod('pix')}
                    />
                    <span>PIX</span>
                </label>
                <label className="payment-method-option">
                    <input
                        type="radio"
                        name="paymentMethod"
                        value="cartao"
                        checked={paymentMethod === 'cartao'}
                        onChange={() => setPaymentMethod('cartao')}
                    />
                    <span>Cartao de Credito/Debito</span>
                </label>
            </div>

            {paymentMethod === 'pix' && (
                <div className="payment-pix-info">
                    <p>Pague via PIX com o QR Code abaixo:</p>
                    <div className="pix-qr-code">QR Code Simulado</div>
                    <p className="payment-hint">Chave PIX: raizes@nordeste.com.br</p>
                    <p className="payment-hint">Apos o pagamento, seu pedido sera confirmado automaticamente.</p>
                </div>
            )}

            {paymentMethod === 'cartao' && (
                <div className="payment-card-form">
                    <label>
                        Numero do Cartao
                        <input
                            type="text"
                            value={cardNumber}
                            onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, '').slice(0, 16))}
                            placeholder="0000 0000 0000 0000"
                            disabled={loading}
                        />
                    </label>
                    <label>
                        Nome no Cartao
                        <input
                            type="text"
                            value={cardName}
                            onChange={(e) => setCardName(e.target.value)}
                            placeholder="Nome impresso no cartao"
                            disabled={loading}
                        />
                    </label>
                    <div className="card-row">
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

            <div className="payment-total">
                <span>Valor devido</span>
                <span className="payment-amount">R$ {finalPrice.toFixed(2)}</span>
            </div>

            <p className="payment-hint">
                Pagamento simulado - nenhum valor real sera cobrado.
            </p>

            <div className="checkout-actions">
                <button className="checkout-btn-secondary" onClick={onBack} disabled={loading}>
                    Voltar
                </button>
                <button className="checkout-btn-primary" onClick={handleConfirm} disabled={loading}>
                    {loading ? 'Processando...' : 'Confirmar Pagamento'}
                </button>
            </div>
        </div>
    );
}