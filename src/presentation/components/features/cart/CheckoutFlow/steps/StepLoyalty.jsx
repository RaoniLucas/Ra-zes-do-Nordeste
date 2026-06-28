import { useState, useEffect } from 'react';

export default function StepLoyalty({ user, onAccept, onDecline, onSkip }) {
    const [showConsent, setShowConsent] = useState(false);
    const [accepted, setAccepted] = useState(false);

    useEffect(() => {
        if (user?.isLoyaltyMember) {
            onAccept();
        }
    }, [user, onAccept]);

    const handleAccept = () => {
        setShowConsent(true);
    };

    const handleConsentAccept = () => {
        setAccepted(true);
        onAccept();
    };

    const handleConsentDecline = () => {
        setShowConsent(false);
        onDecline();
    };

    const handleSkip = () => {
        if (!accepted) {
            onSkip();
        }
    };

    if (user?.isLoyaltyMember) {
        return null;
    }

    return (
        <div className="checkout-step">
            <h2 className="checkout-step-title">Programa de Fidelidade</h2>

            <div className="loyalty-info">
                <p className="loyalty-description">
                    Participe do nosso programa de fidelidade e acumule pontos a cada compra.
                    Com os pontos voce pode obter descontos em pedidos futuros.
                </p>
                <ul className="loyalty-benefits">
                    <li>1 ponto por cada R$1 gasto</li>
                    <li>10 pontos = R$1 de desconto</li>
                    <li>Desconto maximo de 20% do pedido</li>
                </ul>
            </div>

            {!showConsent && !accepted && (
                <div className="loyalty-actions">
                    <button className="checkout-btn-primary" onClick={handleAccept}>
                        Quero participar!
                    </button>
                    <button className="checkout-btn-secondary" onClick={handleSkip}>
                        Pular por enquanto
                    </button>
                </div>
            )}

            {accepted && (
                <div className="loyalty-accepted">
                    <p className="success-message">Voce esta participando do programa de fidelidade!</p>
                    <button className="checkout-btn-primary" onClick={onAccept}>
                        Continuar
                    </button>
                </div>
            )}

            {showConsent && (
                <div className="loyalty-consent-overlay">
                    <div className="loyalty-consent-modal">
                        <h3>Consentimento LGPD</h3>
                        <p>
                            Para participar do programa de fidelidade, precisamos coletar e armazenar
                            seus dados de compra. Seus dados serao utilizados exclusivamente para:
                        </p>
                        <ul>
                            <li>Acumulo e gerenciamento de pontos</li>
                            <li>Oferta de descontos personalizados</li>
                            <li>Historico de compras</li>
                        </ul>
                        <p>
                            Voce pode cancelar sua participacao a qualquer momento no seu perfil.
                        </p>
                        <div className="loyalty-consent-actions">
                            <button className="checkout-btn-primary" onClick={handleConsentAccept}>
                                Aceito os termos
                            </button>
                            <button className="checkout-btn-secondary" onClick={handleConsentDecline}>
                                Nao concordo
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}