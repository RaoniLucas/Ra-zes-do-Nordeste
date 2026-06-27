import comboImg from '@/assets/img/combo_promocional.png';
import './SlideCombo.css';

export default function SlideCombo({ onCheckout, isTotem = false, onProductSelect }) {
    const handleClick = () => {
        if (isTotem && onProductSelect) {
            onProductSelect({
                id: 998,
                name: 'Combo Nordestino',
                price: 24.9,
                emoji: '🍽️',
                description: 'Cuscuz recheado + Suco regional'
            });
        } else {
            onCheckout();
        }
    };

    return (
        <div className="slide-combo">
            <div className="slide-combo-content">
                <span className="slide-combo-badge">Oferta por Tempo Limitado</span>
                <h2 className="slide-combo-title">Combo Promocional</h2>
                <p className="slide-combo-desc">Cuscuz Recheado + Bebida Regional</p>
                <div className="slide-combo-price">R$ 24,90</div>
                <button className="btn-checkout" onClick={handleClick}>
                    {isTotem ? 'Comprar agora' : 'Peça agora'}
                </button>
            </div>
            <div className="slide-combo-image">
                <img className="combo-image" src={comboImg} alt="combo-promocional" />
            </div>
        </div>
    );
}
