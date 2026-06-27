import { apiClient } from '../../infrastructure/api/apiClient';

let mockOrders = [];
let orderIdCounter = 1;

function createTracking() {
    return [
        { step: 'received', done: true, time: new Date().toISOString() },
        { step: 'confirmed', done: false, time: null },
        { step: 'preparing', done: false, time: null },
        { step: 'ready', done: false, time: null },
        { step: 'picked-up', done: false, time: null },
    ];
}

export const OrderService = {
    create: async (data, token) => {
        try {
            const result = await apiClient.post('/orders', data, token);
            return result;
        } catch (err) {
            console.warn('API falhou, usando mock:', err.message);

            const newOrder = {
                id: orderIdCounter++,
                ...data,
                status: 'received',
                deliveryMethod: data.deliveryMethod || 'pickup',
                deliveryAddress: data.deliveryAddress || null,
                tracking: createTracking(),
                createdAt: new Date().toISOString(),
            };
            mockOrders.push(newOrder);
            return newOrder;
        }
    },

    getTracking: async (id) => {
        try {
            const result = await apiClient.get(`/orders/${id}/tracking`);
            return result;
        } catch (err) {
            console.warn('API falhou, usando mock:', err.message);

            let order = mockOrders.find(o => o.id === id);
            if (!order) {
                order = {
                    id: id,
                    status: 'received',
                    tracking: createTracking(),
                };
                mockOrders.push(order);
            }

            return {
                orderId: order.id,
                status: order.status,
                tracking: order.tracking,
            };
        }
    },

    updateStatus: async (id, status, token) => {
        try {
            const result = await apiClient.patch(`/orders/${id}/status`, { status }, token);
            return result;
        } catch (err) {
            console.warn('API falhou, usando mock:', err.message);

            const order = mockOrders.find(o => o.id === id);
            if (order) {
                order.status = status;
                const step = order.tracking.find(t => t.step === status);
                if (step) {
                    step.done = true;
                    step.time = new Date().toISOString();
                }
                return order;
            }

            const newOrder = {
                id: id,
                status: status,
                tracking: createTracking().map(t => ({
                    ...t,
                    done: t.step === status || (t.step === 'received' && status !== 'received'),
                    time: t.step === status ? new Date().toISOString() : null,
                })),
            };
            mockOrders.push(newOrder);
            return newOrder;
        }
    },

    getMyOrders: async (token) => {
        try {
            return await apiClient.get('/user/orders', null, token);
        } catch {
            return mockOrders;
        }
    },
};