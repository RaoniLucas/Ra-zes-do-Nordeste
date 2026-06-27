import { useState, useEffect } from 'react';
import { NotificationService } from '../services/NotificationService';

export function useNotifications(token) {
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        if (!token) return;
        NotificationService.getMy(token)
            .then(setNotifications)
            .catch(() => setNotifications([]));
    }, [token]);

    const markAllRead = () =>
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));

    const unreadCount = notifications.filter((n) => !n.read).length;

    return { notifications, markAllRead, unreadCount };
}