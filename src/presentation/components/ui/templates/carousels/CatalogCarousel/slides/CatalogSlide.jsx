import ProductCard from '@/presentation/components/features/catalog/ProductCard';

export default function CatalogSlide({ category }) {
    return (
        <div className="category-slide">
            <h2 className="category-title">{category.name}</h2>
            <ul className="product-grid">
                {category.products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                ))}
            </ul>
        </div>
    );
}