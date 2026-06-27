import ProductCard from '@/presentation/components/features/catalog/ProductCard';

export default function SlideSobremesas({ categoria, onAddToCart }) {
    return (
        <div
            className="category-slide"
            style={{
                background: 'linear-gradient(180deg, #3d2c2e 0%, #1a1a2e 100%)',
            }}
        >
            <h2 className="category-title">{categoria.nome}</h2>
            <div className="product-grid">
                {categoria.produtos.map((produto) => (
                    <ProductCard key={produto.id} produto={produto} onAdd={onAddToCart} />
                ))}
            </div>
            <div style={{ marginTop: 20, fontSize: '0.9rem', opacity: 0.6 }}>
                Peça com 10% off após as 18h
            </div>
        </div>
    );
}