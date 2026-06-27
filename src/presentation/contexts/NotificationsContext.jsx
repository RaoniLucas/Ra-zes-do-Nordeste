import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { NotificationService } from '../../application/services/NotificationService';

const NotificationsContext = createContext(null);

const STORAGE_KEY = (userId) => `app_notifications_read_${userId}`;
const LOCAL_KEY = (userId) => `app_notifications_local_${userId}`;

export function NotificationsProvider({ children, userId, token }) {
    const [notifications, setNotifications] = useState([]);

    const getReadIds = useCallback(() => {
        if (!userId) return new Set();
        try {
            return new Set(JSON.parse(localStorage.getItem(STORAGE_KEY(userId)) || '[]'));
        } catch {
            return new Set();
        }
    }, [userId]);

    const saveReadIds = useCallback((ids) => {
        if (!userId) return;
        localStorage.setItem(STORAGE_KEY(userId), JSON.stringify([...ids]));
    }, [userId]);

    const getLocalNotifications = useCallback(() => {
        if (!userId) return [];
        try {
            return JSON.parse(localStorage.getItem(LOCAL_KEY(userId)) || '[]');
        } catch {
            return [];
        }
    }, [userId]);

    const saveLocalNotifications = useCallback((notifs) => {
        if (!userId) return;
        localStorage.setItem(LOCAL_KEY(userId), JSON.stringify(notifs.slice(-50)));
    }, [userId]);

    useEffect(() => {
        if (!token || !userId) {
            setNotifications([]);
            return;
        }

        const readIds = getReadIds();
        const local = getLocalNotifications();

        NotificationService.getMy(token)
            .then((remote) => {
                const remoteWithReadState = remote.map((n) => ({
                    ...n,
                    read: readIds.has(n.id),
                }));
                const localIds = new Set(remoteWithReadState.map((n) => n.id));
                const localOnly = local.filter((n) => !localIds.has(n.id));
                const merged = [...remoteWithReadState, ...localOnly].sort(
                    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
                );
                setNotifications(merged);
            })
            .catch(() => {
                const local = getLocalNotifications();
                const readIds = getReadIds();
                setNotifications(local.map((n) => ({ ...n, read: readIds.has(n.id) })));
            });
    }, [token, userId, getReadIds, getLocalNotifications]);

    const addNotification = useCallback((notification) => {
        const newNotif = {
            id: `local_${Date.now()}_${Math.random().toString(36).slice(2)}`,
            userId,
            type: notification.type || 'system',
            read: false,
            createdAt: new Date().toISOString(),
            orderId: notification.orderId || null,
            text: notification.text || 'Nova notificacao',
            status: notification.status || 'pending',
            canDelete: notification.canDelete || false,
            ...notification,
        };

        setNotifications((prev) => {
            const updated = [newNotif, ...prev];
            const localItems = updated.filter((n) => String(n.id).startsWith('local_'));
            saveLocalNotifications(localItems);
            return updated;
        });

        return newNotif.id;
    }, [userId, saveLocalNotifications]);

    const deleteNotification = useCallback((id) => {
        setNotifications((prev) => {
            const notification = prev.find(n => n.id === id);
            // Verificar se pode deletar (apenas notificações concluídas ou promoções)
            if (notification && (notification.status === 'picked-up' || notification.type === 'promo' || notification.canDelete)) {
                const filtered = prev.filter((n) => n.id !== id);
                const localItems = filtered.filter((n) => String(n.id).startsWith('local_'));
                saveLocalNotifications(localItems);
                return filtered;
            }
            return prev;
        });
    }, [saveLocalNotifications]);

    const markAllRead = useCallback(() => {
        setNotifications((prev) => {
            const updated = prev.map((n) => ({ ...n, read: true }));
            saveReadIds(new Set(updated.map((n) => n.id)));
            const localItems = updated.filter((n) => String(n.id).startsWith('local_'));
            saveLocalNotifications(localItems);
            return updated;
        });
    }, [saveReadIds, saveLocalNotifications]);

    const markRead = useCallback((id) => {
        setNotifications((prev) => {
            const updated = prev.map((n) => n.id === id ? { ...n, read: true } : n);
            const readIds = getReadIds();
            readIds.add(id);
            saveReadIds(readIds);
            return updated;
        });
    }, [getReadIds, saveReadIds]);

    const unreadCount = notifications.filter((n) => !n.read).length;

    return (
        <NotificationsContext.Provider value={{
            notifications,
            addNotification,
            deleteNotification,
            markAllRead,
            markRead,
            unreadCount,
        }}>
            {children}
        </NotificationsContext.Provider>
    );
}

export function useNotifications() {
    const ctx = useContext(NotificationsContext);
    if (!ctx) throw new Error('useNotifications must be used inside <NotificationsProvider>');
    return ctx;
}