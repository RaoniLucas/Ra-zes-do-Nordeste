import './SlideAcaraje.css';

export default function SlideAcaraje({ onCheckout, isTotem = false, onProductSelect }) {
    const handleClick = () => {
        if (isTotem && onProductSelect) {
            onProductSelect({
                id: 999,
                name: 'Acarajé Burguer',
                price: 29.9,
                emoji: '🍔',
                description: 'O melhor do acarajé, o melhor do hambúrguer'
            });
        } else {
            onCheckout();
        }
    };

    return (
        <div className="acaraje-slide">
            <div className="acaraje-content">
                <span className="acaraje-badge">Novidade</span>
                <h2 className="acaraje-title">
                    <span>Acarajé</span>
                    <br />
                    <span>Burguer</span>
                </h2>
                <p className="acaraje-description">
                    O melhor do acarajé, o melhor do hambúrguer. Crocância baiana, recheio suculento e a pimenta que manda o recado da Bahia para unir dois mundos em um único sabor.
                </p>
                <button className="acaraje-cta" onClick={handleClick}>
                    {isTotem ? 'Comprar agora' : 'Peça agora'}
                </button>
            </div>
            <div className="acaraje-content">
                <img className="acaraje-image" src="/src/assets/img/acaraje.png" alt="Acarajé baiano" />
            </div>
        </div>
    );
}