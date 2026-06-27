import { useEffect, useRef, useCallback } from 'react';
import { OrderService } from '../services/OrderService';

const STATUS_SEQUENCE = ['received', 'confirmed', 'preparing', 'ready', 'picked-up'];
const STATUS_DELAYS_MS = {
    confirmed: 2000,
    preparing: 4000,
    ready: 6000,
    'picked-up': null,
};

export function useOrderSimulation({ orderId, token, onStatusChange, onReadyForPickup }) {
    const timersRef = useRef([]);
    const startedRef = useRef(false);
    const currentStatusRef = useRef('received');
    const isActiveRef = useRef(true);

    const advanceTo = useCallback(async (status) => {
        if (!isActiveRef.current || !orderId) return;

        try {
            console.log(`🔄 Avançando para status: ${status} (pedido #${orderId})`);

            if (status === 'picked-up') {
                onStatusChange?.(status);
                return;
            }

            const result = await OrderService.updateStatus(orderId, status, token);
            console.log(`✅ Status atualizado para: ${status}`, result);
            currentStatusRef.current = status;
            onStatusChange?.(status);

            if (status === 'ready') {
                console.log(`🔔 Pedido #${orderId} pronto para retirada!`);
                onReadyForPickup?.();
            }
        } catch (err) {
            console.error(`❌ Erro ao atualizar status para ${status}:`, err);
        }
    }, [orderId, token, onStatusChange, onReadyForPickup]);

    useEffect(() => {
        if (!orderId) {
            console.log('⏸️ useOrderSimulation: sem orderId, aguardando...');
            return;
        }

        if (startedRef.current) {
            console.log(`⏸️ useOrderSimulation: já iniciado para pedido #${orderId}`);
            return;
        }

        startedRef.current = true;
        isActiveRef.current = true;
        console.log(`🚀 Iniciando simulação para pedido #${orderId}`);

        const timers = [];

        // Agendar cada status sequencialmente
        let currentIndex = 1; // começa do 'confirmed' (índice 1)

        const scheduleNext = () => {
            if (!isActiveRef.current) {
                console.log('⏹️ Simulação cancelada');
                return;
            }

            if (currentIndex >= STATUS_SEQUENCE.length) {
                console.log('🏁 Simulação finalizada');
                return;
            }

            const status = STATUS_SEQUENCE[currentIndex];
            const delay = STATUS_DELAYS_MS[status];

            if (delay === null) {
                // 'picked-up' não é agendado automaticamente
                currentIndex++;
                scheduleNext();
                return;
            }

            console.log(`⏰ Agendando "${status}" em ${delay}ms (pedido #${orderId})`);

            const timer = setTimeout(async () => {
                await advanceTo(status);
                currentIndex++;
                scheduleNext();
            }, delay);

            timers.push(timer);
        };

        // Iniciar a simulação após 1 segundo (para dar tempo do pedido ser criado)
        const startTimer = setTimeout(() => {
            scheduleNext();
        }, 1000);

        timers.push(startTimer);

        // Limpeza
        return () => {
            console.log(`🧹 Limpando timers da simulação (pedido #${orderId})`);
            isActiveRef.current = false;
            timers.forEach(clearTimeout);
            timers.length = 0;
            startedRef.current = false;
        };
    }, [orderId, advanceTo]);

    // Função para forçar a parada da simulação
    const stopSimulation = useCallback(() => {
        isActiveRef.current = false;
        startedRef.current = false;
    }, []);

    return { currentStatus: currentStatusRef.current, stopSimulation };
}