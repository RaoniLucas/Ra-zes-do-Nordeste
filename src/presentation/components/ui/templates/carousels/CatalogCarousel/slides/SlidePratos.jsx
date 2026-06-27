import ProductCard from '@/presentation/components/features/catalog/ProductCard';

export default function SlidePratos({ categoria, onAddToCart }) {
    return (
        <div className="category-slide" style={{ background: 'linear-gradient(180deg, #1a1a2e 0%, #16213e 100%)' }}>
            <h2 className="category-title">{categoria.nome}</h2>
            <p className="category-desc">Os clássicos que todo nordestino ama</p>
            <div className="product-grid">
                {categoria.produtos.map((produto) => (
                    <ProductCard key={produto.id} produto={produto} onAdd={onAddToCart} />
                ))}
            </div>
        </div>
    );
}