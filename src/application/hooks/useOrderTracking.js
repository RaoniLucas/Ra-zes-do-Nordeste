import { useState, useEffect, useRef } from 'react';
import { OrderService } from '../services/OrderService';

const STATUS_SEQUENCE = ['received', 'confirmed', 'preparing', 'ready', 'picked-up'];

export function useOrderTracking(orderId) {
    const [order, setOrder] = useState(null);
    const [error, setError] = useState(null);
    const intervalRef = useRef(null);

    useEffect(() => {
        if (!orderId) {
            return;
        }

        const fetchTracking = async () => {
            try {
                console.log('Buscando tracking para pedido:', orderId);
                const data = await OrderService.getTracking(orderId);
                console.log('Tracking recebido:', data);
                setOrder(data);
                setError(null);
                if (data.status === 'picked-up') {
                    clearInterval(intervalRef.current);
                }
            } catch (err) {
                console.error('Erro ao buscar tracking:', err);
                setError('Falha ao carregar informações do pedido');
            }
        };

        fetchTracking();
        intervalRef.current = setInterval(fetchTracking, 8000);

        return () => {
            clearInterval(intervalRef.current);
        };
    }, [orderId]);

    const currentIndex = STATUS_SEQUENCE.indexOf(order?.status ?? 'received');

    return { order, error, currentIndex, statusSequence: STATUS_SEQUENCE };
}