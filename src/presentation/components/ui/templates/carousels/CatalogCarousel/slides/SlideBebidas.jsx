import ProductCard from '@/presentation/components/features/catalog/ProductCard';

export default function SlideBebidas({ categoria, onAddToCart }) {
    return (
        <div
            className="category-slide"
            style={{
                background: 'linear-gradient(180deg, #0f3460 0%, #16213e 100%)',
            }}
        >
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    marginBottom: 30,
                }}
            >
                <span style={{ fontSize: '2.5rem' }}>🥤</span>
                <h2 className="category-title" style={{ margin: 0 }}>
                    {categoria.nome}
                </h2>
            </div>
            <p className="category-desc">
                Sucos naturais e bebidas típicas do Nordeste
            </p>
            <div className="product-grid">
                {categoria.produtos.map((produto) => (
                    <ProductCard key={produto.id} produto={produto} onAdd={onAddToCart} />
                ))}
            </div>
        </div>
    );
}