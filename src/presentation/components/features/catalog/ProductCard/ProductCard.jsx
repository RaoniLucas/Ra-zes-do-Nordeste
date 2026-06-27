import { useState } from 'react';
import ProductDetailModal from "@/presentation/components/features/catalog/ProductDetailModal";
import './ProductCard.css';

export default function ProductCard({ product }) {
    const [showDetail, setShowDetail] = useState(false);

    return (
        <>
            <li className="product-card" onClick={() => setShowDetail(true)}>
                <div className="product-card-image">
                    {product.emoji
                        ? <span className="product-card-emoji">{product.emoji}</span>
                        : <div className="product-card-placeholder">🍽️</div>
                    }
                </div>
                <div className="product-card-info">
                    <h3 className="product-card-name">{product.name}</h3>
                    <span className="product-card-price">R$ {product.price.toFixed(2)}</span>
                </div>
                <button
                    className="product-card-add-btn"
                    onClick={(e) => {
                        e.stopPropagation();
                        setShowDetail(true);
                    }}
                >
                    +
                </button>
            </li>

            {showDetail && (
                <ProductDetailModal product={product} onClose={() => setShowDetail(false)} />
            )}
        </>
    );
}