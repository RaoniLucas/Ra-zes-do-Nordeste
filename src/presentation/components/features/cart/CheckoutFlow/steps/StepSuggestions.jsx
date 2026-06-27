import { useState, useEffect } from 'react';
import { ProductService } from '@/application/services/ProductService';

function SuggestionRow({ productId, onAdd }) {
    const [product, setProduct] = useState(null);
    const [added, setAdded] = useState(false);

    useEffect(() => {
        ProductService.getById(productId)
            .then(setProduct)
            .catch(() => { });
    }, [productId]);

    if (!product) return null;

    return (
        <li className="suggestions-step-item">
            <span className="suggestions-step-emoji">{product.emoji || '🍽️'}</span>
            <div className="suggestions-step-info">
                <span className="suggestions-step-name">{product.name}</span>
                <span className="suggestions-step-price">
                    R$ {product.price.toFixed(2)}
                </span>
            </div>
            <button
                className={`suggestions-step-btn ${added ? 'added' : ''}`}
                onClick={() => {
                    if (!added) {
                        onAdd(product);
                        setAdded(true);
                    }
                }}
                disabled={added}
            >
                {added ? '✓' : '+'}
            </button>
        </li>
    );
}

function StepAutoAdvance({ onNext }) {
    useEffect(() => {
        onNext();
    }, [onNext]);
    return null;
}

export default function StepSuggestions({ items, onAddItem, onNext }) {
    const cartIds = new Set(items.map((i) => i.product.id));
    const suggestionIds = [
        ...new Set(
            items.flatMap((i) => (i.product.suggestionIds || []).slice(0, 2)),
        ),
    ]
        .filter((id) => !cartIds.has(id))
        .slice(0, 4);

    const categories = new Set(items.map((i) => i.product.category));
    const hint =
        !categories.has('drinks') && !categories.has('desserts')
            ? 'Que tal uma bebida ou sobremesa?'
            : !categories.has('drinks')
                ? 'Adicione uma bebida para completar?'
                : !categories.has('desserts')
                    ? 'Finalize com uma sobremesa?'
                    : 'Mais alguma coisa?';

    if (suggestionIds.length === 0) return <StepAutoAdvance onNext={onNext} />;

    return (
        <div className="checkout-step">
            <h2 className="checkout-step-title">Adicionais</h2>
            <p className="checkout-step-hint">{hint}</p>
            <ul className="suggestions-step-list">
                {suggestionIds.map((id) => (
                    <SuggestionRow
                        key={id}
                        productId={id}
                        onAdd={(p) => onAddItem(p, 1)}
                    />
                ))}
            </ul>
            <div className="checkout-actions">
                <button className="checkout-btn-secondary" onClick={onNext}>
                    Pular
                </button>
                <button className="checkout-btn-primary" onClick={onNext}>
                    Continuar
                </button>
            </div>
        </div>
    );
}