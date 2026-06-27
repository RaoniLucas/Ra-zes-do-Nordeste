import { createContext, useContext, useState, useCallback } from 'react';

const CartContext = createContext(null);

export function CartProvider({ children }) {
    const [items, setItems] = useState([]);

    const addItem = useCallback((product, quantity = 1) => {
        setItems((prev) => {
            const existing = prev.find((i) => i.product.id === product.id);
            if (existing) {
                return prev.map((i) =>
                    i.product.id === product.id ? { ...i, quantity: i.quantity + quantity } : i
                );
            }
            return [...prev, { product, quantity }];
        });
    }, []);

    const addItemWithStockCheck = useCallback((product, requestedQty, availableStock) => {
        const hardLimit = availableStock ?? Infinity;

        return new Promise((resolve) => {
            setItems((prev) => {
                const existing = prev.find((i) => i.product.id === product.id);
                const alreadyInCart = existing?.quantity ?? 0;
                const canAdd = Math.min(requestedQty, hardLimit - alreadyInCart);

                if (canAdd <= 0) {
                    resolve({ ok: false, available: hardLimit, added: 0 });
                    return prev;
                }

                const nextItems = existing
                    ? prev.map((i) =>
                        i.product.id === product.id
                            ? { ...i, quantity: i.quantity + canAdd }
                            : i
                    )
                    : [...prev, { product, quantity: canAdd }];

                resolve({ ok: canAdd === requestedQty, available: hardLimit, added: canAdd });
                return nextItems;
            });
        });
    }, []);

    const removeItem = useCallback((productId) => {
        setItems((prev) => prev.filter((i) => i.product.id !== productId));
    }, []);

    const updateQuantity = useCallback((productId, quantity, stockLimit) => {
        const capped = stockLimit != null ? Math.min(quantity, stockLimit) : quantity;
        if (capped <= 0) {
            setItems((prev) => prev.filter((i) => i.product.id !== productId));
            return;
        }
        setItems((prev) =>
            prev.map((i) => (i.product.id === productId ? { ...i, quantity: capped } : i))
        );
    }, []);

    const clearCart = useCallback(() => setItems([]), []);

    const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
    const totalPrice = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);

    return (
        <CartContext.Provider
            value={{
                items,
                addItem,
                addItemWithStockCheck,
                removeItem,
                updateQuantity,
                clearCart,
                totalItems,
                totalPrice,
            }}
        >
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const ctx = useContext(CartContext);
    if (!ctx) throw new Error('useCart must be used inside <CartProvider>');
    return ctx;
}