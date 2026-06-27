import usersData from './data/users.json';
import productsData from './data/products.json';
import unitsData from './data/units.json';
import promosData from './data/promos.json';
import ordersData from './data/orders.json';

// ============ FUNÇÕES DE PERSISTÊNCIA ============
function loadUsers() {
    try {
        const data = localStorage.getItem('msw_users');
        if (data) {
            return JSON.parse(data);
        }
        // Se não tiver no localStorage, usa os dados do JSON
        return [...usersData];
    } catch (error) {
        console.warn('Erro ao carregar usuários do localStorage:', error);
        return [...usersData];
    }
}

function saveUsers(users) {
    try {
        localStorage.setItem('msw_users', JSON.stringify(users));
        console.log('✅ Usuários salvos no localStorage');
    } catch (error) {
        console.warn('Erro ao salvar usuários no localStorage:', error);
    }
}

// ============ CARREGAR DADOS ============
let users = loadUsers();
let products = [...productsData];
let units = [...unitsData];
let promos = [...promosData];
let orders = [...ordersData];

// ============ USER DB ============
export const userDB = {
    findById: (id) => users.find((u) => u.id === id) || null,
    findByEmail: (email) => users.find((u) => u.email === email) || null,
    create: (data) => {
        const user = {
            id: users.length + 1,
            pontos: 0,
            isLoyaltyMember: false,
            lgpd_consent: true,
            createdAt: new Date().toISOString(),
            ...data,
        };
        users.push(user);
        saveUsers(users); // SALVA NO LOCALSTORAGE
        console.log('📝 Usuário criado:', user);
        return user;
    },
    update: (id, data) => {
        const index = users.findIndex((u) => u.id === id);
        if (index === -1) return null;
        users[index] = { ...users[index], ...data };
        saveUsers(users); // SALVA NO LOCALSTORAGE
        console.log('📝 Usuário atualizado:', users[index]);
        return users[index];
    },
    getAll: () => users,
};

// ============ PRODUCT DB ============
export const productDB = {
    findById: (id) => products.find((p) => p.id === id) || null,
    findByCategory: (category) => products.filter((p) => p.category === category),
    findByUnit: (unitId) =>
        products.filter((p) => p.availableUnitIds && p.availableUnitIds.includes(unitId)),
    findBySeason: (season) =>
        products.filter((p) => p.seasonal && p.season === season),
    findByIds: (ids) =>
        ids.map((id) => products.find((p) => p.id === id)).filter(Boolean),
    getStockAtUnit: (productId, unitId) => {
        const product = products.find((p) => p.id === productId);
        if (!product) return 0;
        return product.stockByUnitId?.[String(unitId)] ?? 0;
    },
    getAll: () => products,
};

// ============ UNIT DB ============
export const unitDB = {
    findById: (id) => units.find((u) => u.id === id) || null,
    findByCity: (city) => units.filter((u) => u.cidade === city),
    findByBairro: (city, neighborhood) =>
        units.filter((u) => u.cidade === city && u.bairro === neighborhood),
    getAll: () => units,
};

// ============ PROMO DB ============
export const promoDB = {
    findById: (id) => promos.find((p) => p.id === id) || null,
    getActive: () =>
        promos.filter(
            (p) => p.ativa && (!p.validade || new Date(p.validade) > new Date())
        ),
    getByUnit: (unitId) =>
        promos.filter((p) => p.ativa && p.unidadesParticipantes && p.unidadesParticipantes.includes(unitId)),
    getBySeason: (season) => promos.filter((p) => p.temporada === season),
    getAll: () => promos,
};

// ============ ORDER DB ============
export const orderDB = {
    findById: (id) => orders.find((o) => o.id === id) || null,
    findByUser: (userId) => orders.filter((o) => o.userId === userId),
    create: (data) => {
        const order = {
            id: orders.length + 1,
            ...data,
            status: 'received',
            tracking: [
                { step: 'received', done: true, time: new Date().toISOString() },
                { step: 'confirmed', done: false, time: null },
                { step: 'preparing', done: false, time: null },
                { step: 'ready', done: false, time: null },
                { step: 'picked-up', done: false, time: null },
            ],
            createdAt: new Date().toISOString(),
        };
        orders.push(order);
        return order;
    },
    updateStatus: (id, status) => {
        const order = orders.find((o) => o.id === id);
        if (!order) return null;
        order.status = status;
        const step = order.tracking.find((t) => t.step === status);
        if (step) {
            step.done = true;
            step.time = new Date().toISOString();
        }
        return order;
    },
    getAll: () => orders,
};