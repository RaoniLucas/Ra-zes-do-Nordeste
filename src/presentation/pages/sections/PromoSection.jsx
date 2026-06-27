import { useState } from 'react';
import PromoCarousel from '@/presentation/components/ui/templates/carousels/PromoCarousel';
import JuninoFestivalModal from '@/presentation/components/features/catalog/JuninoFestivalModal';
import TotemCheckoutFlow from '@/presentation/components/features/totem/TotemCheckoutFlow';

export default function PromoSection({ onCheckout, onColorChange, isTotem = false }) {
    const [showJuninoFestival, setShowJuninoFestival] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);

    // Produtos mockados para os slides (usando IDs dos produtos existentes)
    const promoProducts = {
        acaraje: { id: 9, name: 'Acarajé Baiano', price: 16.9, emoji: '🫓' },
        combo: { id: 2, name: 'Cuscuz Recheado', price: 22.0, emoji: '🌽' },
    };

    const handlePromoCheckout = (product) => {
        if (isTotem) {
            setSelectedProduct(product);
        } else {
            onCheckout();
        }
    };

    return (
        <>
            <section className="section section-promo">
                <PromoCarousel
                    onCheckout={() => handlePromoCheckout(promoProducts.combo)}
                    onOpenJuninoFestival={() => {
                        if (isTotem) {
                            // No Totem, abrir o festival com fluxo direto
                            setShowJuninoFestival(true);
                        } else {
                            setShowJuninoFestival(true);
                        }
                    }}
                    onColorChange={onColorChange}
                    isTotem={isTotem}
                    onPromoProductSelect={(product) => {
                        if (isTotem) {
                            setSelectedProduct(product);
                        } else {
                            onCheckout();
                        }
                    }}
                />
            </section>

            {showJuninoFestival && (
                <JuninoFestivalModal
                    onClose={() => setShowJuninoFestival(false)}
                    isTotem={isTotem}
                    onProductSelect={(product) => {
                        if (isTotem) {
                            setSelectedProduct(product);
                            setShowJuninoFestival(false);
                        }
                    }}
                />
            )}

            {selectedProduct && isTotem && (
                <TotemCheckoutFlow
                    product={selectedProduct}
                    onClose={() => setSelectedProduct(null)}
                    onOrderPlaced={() => setSelectedProduct(null)}
                />
            )}
        </>
    );
}