import { http, HttpResponse } from 'msw';
import { userDB, productDB, unitDB, promoDB, orderDB } from './db';
import notificationsData from './data/notifications.json';

const simulateDelay = () =>
    new Promise((r) => setTimeout(r, 600 + Math.random() * 600));

function generateToken(userId) {
    return `mock_token_${userId}_${Date.now()}`;
}

function extractUserId(token) {
    const match = token?.match(/mock_token_(\d+)/);
    return match ? parseInt(match[1]) : null;
}

let notifications = [...notificationsData];

export const handlers = [
    http.post('/api/auth/register', async ({ request }) => {
        await simulateDelay();
        const { nome, email, password, telefone } = await request.json();
        console.log('Registro - dados:', { nome, email, password, telefone });

        if (!nome || !email || !password) {
            return HttpResponse.json(
                { error: 'All fields are required' },
                { status: 400 }
            );
        }

        if (userDB.findByEmail(email)) {
            return HttpResponse.json(
                { error: 'Email already registered' },
                { status: 409 }
            );
        }

        const user = userDB.create({ nome, email, password, telefone });
        const { password: _, ...userData } = user;
        console.log('Usuário criado:', userData);
        return HttpResponse.json(
            { token: generateToken(user.id), user: userData },
            { status: 201 }
        );
    }),

    http.post('/api/auth/login', async ({ request }) => {
        await simulateDelay();
        const { email, password } = await request.json();
        console.log('Login - dados:', { email, password });

        if (!email || !password) {
            return HttpResponse.json(
                { error: 'Email and password are required' },
                { status: 400 }
            );
        }

        const user = userDB.findByEmail(email);
        if (!user || user.password !== password) {
            return HttpResponse.json(
                { error: 'Invalid email or password' },
                { status: 401 }
            );
        }

        const { password: _, ...userData } = user;
        console.log('Login bem-sucedido:', userData);
        return HttpResponse.json({ token: generateToken(user.id), user: userData });
    }),

    http.get('/api/auth/me', async ({ request }) => {
        await simulateDelay();
        const token = request.headers.get('Authorization')?.replace('Bearer ', '');
        const userId = extractUserId(token);
        if (!userId) {
            return HttpResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const user = userDB.findById(userId);
        if (!user) {
            return HttpResponse.json({ error: 'User not found' }, { status: 404 });
        }
        const { password: _, ...userData } = user;
        return HttpResponse.json(userData);
    }),

    http.patch('/api/auth/profile', async ({ request }) => {
        await simulateDelay();
        const token = request.headers.get('Authorization')?.replace('Bearer ', '');
        const userId = extractUserId(token);
        if (!userId) {
            return HttpResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const updates = await request.json();
        const allowed = ['nome', 'email', 'avatarBase64', 'endereco', 'telefone'];
        const filtered = Object.fromEntries(
            Object.entries(updates).filter(([k]) => allowed.includes(k))
        );

        const user = userDB.update(userId, filtered);
        if (!user) {
            return HttpResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const { password: _, ...userData } = user;
        return HttpResponse.json(userData);
    }),

    http.post('/api/user/points/add', async ({ request }) => {
        await simulateDelay();
        const token = request.headers.get('Authorization')?.replace('Bearer ', '');
        const userId = extractUserId(token);
        if (!userId) {
            return HttpResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { amount } = await request.json();
        const POINTS_CAP = 1000;
        const user = userDB.findById(userId);
        if (!user) {
            return HttpResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const newPoints = Math.min((user.pontos || 0) + amount, POINTS_CAP);
        const updated = userDB.update(userId, { pontos: newPoints });
        const { password: _, ...userData } = updated;

        return HttpResponse.json({
            user: userData,
            pointsAdded: newPoints - (user.pontos || 0),
        });
    }),

    http.post('/api/user/points/use', async ({ request }) => {
        await simulateDelay();
        const token = request.headers.get('Authorization')?.replace('Bearer ', '');
        const userId = extractUserId(token);
        if (!userId) {
            return HttpResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { amount } = await request.json();
        const user = userDB.findById(userId);
        if (!user) {
            return HttpResponse.json({ error: 'User not found' }, { status: 404 });
        }

        if ((user.pontos || 0) < amount) {
            return HttpResponse.json(
                { error: 'Insufficient points' },
                { status: 400 }
            );
        }

        const newPoints = Math.max(0, (user.pontos || 0) - amount);
        const updated = userDB.update(userId, { pontos: newPoints });
        const { password: _, ...userData } = updated;

        return HttpResponse.json({
            user: userData,
            pointsUsed: amount,
        });
    }),

    http.post('/api/user/loyalty', async ({ request }) => {
        await simulateDelay();
        const token = request.headers.get('Authorization')?.replace('Bearer ', '');
        const userId = extractUserId(token);
        if (!userId) {
            return HttpResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { isMember } = await request.json();
        const user = userDB.findById(userId);
        if (!user) {
            return HttpResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const updated = userDB.update(userId, { isLoyaltyMember: isMember });
        const { password: _, ...userData } = updated;

        return HttpResponse.json(userData);
    }),

    http.get('/api/units', async () => {
        await simulateDelay();
        return HttpResponse.json(unitDB.getAll());
    }),

    http.get('/api/units/nearby', async ({ request }) => {
        await simulateDelay();
        const url = new URL(request.url);
        const lat = parseFloat(url.searchParams.get('lat'));
        const lng = parseFloat(url.searchParams.get('lng'));
        const city = url.searchParams.get('city') || url.searchParams.get('cidade');
        const neighborhood = url.searchParams.get('neighborhood') || url.searchParams.get('bairro');

        if (lat && lng) {
            const toRad = (deg) => deg * (Math.PI / 180);
            const R = 6371;
            const nearby = unitDB.getAll().filter((u) => {
                const dLat = toRad(u.lat - lat);
                const dLng = toRad(u.lng - lng);
                const a =
                    Math.sin(dLat / 2) ** 2 +
                    Math.cos(toRad(lat)) * Math.cos(toRad(u.lat)) * Math.sin(dLng / 2) ** 2;
                return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) <= 10;
            });
            return HttpResponse.json(nearby);
        }
        if (city && neighborhood) {
            return HttpResponse.json(unitDB.findByBairro(city, neighborhood));
        }
        if (city) {
            return HttpResponse.json(unitDB.findByCity(city));
        }
        return HttpResponse.json(unitDB.getAll());
    }),

    http.get('/api/products', async ({ request }) => {
        await simulateDelay();
        const url = new URL(request.url);
        const unitId = parseInt(url.searchParams.get('unitId'));
        const category = url.searchParams.get('category');
        const season = url.searchParams.get('season');

        let result = productDB.getAll();
        if (unitId) result = productDB.findByUnit(unitId);
        if (category) result = result.filter((p) => p.category === category);
        if (season) result = result.filter((p) => p.seasonal && p.season === season);
        else result = result.filter((p) => !p.seasonal);
        return HttpResponse.json(result);
    }),

    http.get('/api/products/:id', async ({ params }) => {
        await simulateDelay();
        const product = productDB.findById(parseInt(params.id));
        if (!product) {
            return HttpResponse.json({ error: 'Product not found' }, { status: 404 });
        }
        return HttpResponse.json(product);
    }),

    http.get('/api/products/:id/stock', async ({ params, request }) => {
        await simulateDelay();
        const url = new URL(request.url);
        const unitId = parseInt(url.searchParams.get('unitId'));
        if (!unitId) {
            return HttpResponse.json({ error: 'unitId required' }, { status: 400 });
        }
        const stock = productDB.getStockAtUnit(parseInt(params.id), unitId);
        return HttpResponse.json({ productId: parseInt(params.id), unitId, stock });
    }),

    http.get('/api/products/:id/suggestions', async ({ params }) => {
        await simulateDelay();
        const product = productDB.findById(parseInt(params.id));
        if (!product) {
            return HttpResponse.json({ error: 'Product not found' }, { status: 404 });
        }
        const suggestions = productDB.findByIds(product.suggestionIds || []);
        return HttpResponse.json(suggestions);
    }),

    http.post('/api/orders', async ({ request }) => {
        await simulateDelay();
        const token = request.headers.get('Authorization')?.replace('Bearer ', '');
        const userId = extractUserId(token) || null;
        const body = await request.json();
        const order = orderDB.create({ userId, ...body });
        return HttpResponse.json(order, { status: 201 });
    }),

    http.get('/api/orders/:id/tracking', async ({ params }) => {
        await simulateDelay();
        const order = orderDB.findById(parseInt(params.id));
        if (!order) {
            return HttpResponse.json({ error: 'Order not found' }, { status: 404 });
        }
        return HttpResponse.json({
            orderId: order.id,
            status: order.status,
            tracking: order.tracking,
        });
    }),

    http.patch('/api/orders/:id/status', async ({ params, request }) => {
        await simulateDelay();
        const { status } = await request.json();
        const order = orderDB.updateStatus(parseInt(params.id), status);
        if (!order) {
            return HttpResponse.json({ error: 'Order not found' }, { status: 404 });
        }
        return HttpResponse.json(order);
    }),

    http.get('/api/user/notifications', async ({ request }) => {
        await simulateDelay();
        const token = request.headers.get('Authorization')?.replace('Bearer ', '');
        const userId = extractUserId(token);
        if (!userId) {
            return HttpResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        return HttpResponse.json(
            notifications.filter((n) => n.userId === userId || n.userId === 1)
        );
    }),

    http.get('/api/user/orders', async ({ request }) => {
        await simulateDelay();
        const token = request.headers.get('Authorization')?.replace('Bearer ', '');
        const userId = extractUserId(token);
        if (!userId) {
            return HttpResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        return HttpResponse.json(orderDB.findByUser(userId));
    }),

    http.get('/api/products/seasonal/:season', async ({ params }) => {
        await simulateDelay();
        return HttpResponse.json(productDB.findBySeason(params.season));
    }),

    http.post('/api/payment/process', async () => {
        await simulateDelay();
        const r = Math.random();
        if (r < 0.7) {
            return HttpResponse.json({
                status: 'approved',
                transactionId: `txn_${Date.now()}`,
            });
        }
        if (r < 0.9) {
            return HttpResponse.json(
                { status: 'declined', error: 'Card declined' },
                { status: 402 }
            );
        }
        return HttpResponse.json(
            { status: 'timeout', error: 'Service unavailable' },
            { status: 503 }
        );
    }),
];