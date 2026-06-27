import { useState, useEffect } from 'react';
import CatalogCarousel from '@/presentation/components/ui/templates/carousels/CatalogCarousel';
import { ProductService } from '@/application/services/ProductService';
import { groupByCategory } from '@/shared/helpers/groupByCategory';
import TotemProductCard from '@/presentation/components/features/totem/TotemProductCard';

export default function CatalogSection({ userLocation, isTotem = false }) {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [orderPlaced, setOrderPlaced] = useState(false);

    useEffect(() => {
        async function loadProducts() {
            try {
                setLoading(true);
                const products = await ProductService.getAll();

                if (!products || products.length === 0) {
                    setCategories([]);
                    setError('Nenhum produto disponivel');
                    return;
                }

                const grouped = groupByCategory(products);
                setCategories(grouped);
                setError(null);
            } catch (err) {
                console.error('Erro ao carregar produtos:', err);
                setError('Erro ao carregar cardapio: ' + err.message);
            } finally {
                setLoading(false);
            }
        }
        loadProducts();
    }, []);

    if (loading) {
        return (
            <section className="section section-menu">
                <div style={{ padding: '80px 20px', textAlign: 'center' }}>
                    <p>Carregando cardapio...</p>
                </div>
            </section>
        );
    }

    if (error) {
        return (
            <section className="section section-menu">
                <div style={{ padding: '80px 20px', textAlign: 'center' }}>
                    <p style={{ color: '#c0392b' }}>{error}</p>
                    <button onClick={() => window.location.reload()} style={{ marginTop: '16px' }}>
                        Tentar novamente
                    </button>
                </div>
            </section>
        );
    }

    if (!categories || categories.length === 0) {
        return (
            <section className="section section-menu">
                <div style={{ padding: '80px 20px', textAlign: 'center' }}>
                    <p>Nenhum produto disponivel no momento.</p>
                </div>
            </section>
        );
    }

    // Se for Totem, renderiza com TotemProductCard
    if (isTotem) {
        const allProducts = categories.flatMap(cat => cat.products);
        return (
            <section className="section section-menu totem-catalog">
                <div className="totem-product-grid">
                    {allProducts.map((product) => (
                        <TotemProductCard
                            key={product.id}
                            product={product}
                            onOrderPlaced={() => setOrderPlaced(true)}
                        />
                    ))}
                </div>
            </section>
        );
    }

    // Modo normal (UserApp)
    return (
        <section className="section section-menu">
            <CatalogCarousel categories={categories} />
        </section>
    );
}