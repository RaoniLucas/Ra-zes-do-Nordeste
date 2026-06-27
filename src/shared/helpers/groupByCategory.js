const CATEGORY_LABELS = {
    mains: 'Signature Dishes',
    drinks: 'Regional Drinks',
    desserts: 'Desserts',
};

export function groupByCategory(products) {
    const groups = {};
    products.forEach((p) => {
        if (!groups[p.category]) {
            groups[p.category] = {
                id: p.category,
                name: CATEGORY_LABELS[p.category] || p.category,
                products: [],
            };
        }
        groups[p.category].products.push(p);
    });
    return Object.values(groups);
}