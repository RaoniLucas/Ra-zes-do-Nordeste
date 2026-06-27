import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useScrollLock } from '@/shared/hooks/useScrollLock';
import { useNotifications } from '@/presentation/contexts/NotificationsContext';
import './NotificationModal.css';

const TYPE_ICONS = {
    order: '📦',
    tracking: '🗺️',
    points: '⭐',
    promo: '🏷️',
    delivery: '🔔',
    system: '📢',
};

function NotificationItem({ notification, onMarkRead, onTrackingClick, onDelete }) {
    const isTracking = notification.type === 'tracking' || notification.type === 'delivery' || notification.type === 'order';
    const canDelete = notification.status === 'picked-up' || notification.type === 'promo' || notification.canDelete;

    const handleClick = () => {
        if (!notification.read) onMarkRead(notification.id);
        if (isTracking && notification.orderId) {
            console.log('Abrindo tracking para pedido:', notification.orderId);
            onTrackingClick(notification.orderId);
        }
    };

    const handleDelete = (e) => {
        e.stopPropagation();
        onDelete(notification.id);
    };

    return (
        <li
            className={`notification-item ${!notification.read ? 'unread' : ''} ${isTracking ? 'clickable' : ''}`}
            onClick={handleClick}
        >
            <span className="notification-type-icon">
                {TYPE_ICONS[notification.type] || '📢'}
            </span>
            <div className="notification-content">
                <p className="notification-text">{notification.text}</p>
                {notification.createdAt && (
                    <span className="notification-time">
                        {new Date(notification.createdAt).toLocaleString('pt-BR', {
                            month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
                        })}
                    </span>
                )}
                {isTracking && notification.orderId && (
                    <span className="notification-cta">Toque para rastrear →</span>
                )}
            </div>
            {!notification.read && <span className="notification-dot" />}
            {canDelete && (
                <button className="notification-delete-btn" onClick={handleDelete} title="Deletar notificação">
                    ✕
                </button>
            )}
        </li>
    );
}

function NotificationContent({ onClose, onTrackingOpen }) {
    const { notifications, markAllRead, markRead, unreadCount, deleteNotification } = useNotifications();
    const [visible, setVisible] = useState(false);

    useScrollLock(true);

    useEffect(() => {
        requestAnimationFrame(() => setVisible(true));
    }, []);

    const handleClose = () => {
        setVisible(false);
        setTimeout(onClose, 260);
    };

    return (
        <div className={`notification-overlay ${visible ? 'visible' : ''}`} onClick={handleClose}>
            <div className={`notification-drawer ${visible ? 'visible' : ''}`} onClick={(e) => e.stopPropagation()}>
                <div className="notification-header">
                    <div>
                        <h2 className="notification-title">Notificações</h2>
                        {unreadCount > 0 && (
                            <span className="notification-unread-badge">{unreadCount} não lidas</span>
                        )}
                    </div>
                    <div className="notification-header-actions">
                        {unreadCount > 0 && (
                            <button className="notification-mark-all-btn" onClick={markAllRead}>
                                Marcar todas como lidas
                            </button>
                        )}
                        <button className="notification-close" onClick={handleClose}>✕</button>
                    </div>
                </div>

                {notifications.length === 0 ? (
                    <div className="notification-empty">
                        <span>🔕</span>
                        <p>Nenhuma notificação</p>
                    </div>
                ) : (
                    <ul className="notification-list">
                        {notifications.map((n) => (
                            <NotificationItem
                                key={n.id}
                                notification={n}
                                onMarkRead={markRead}
                                onTrackingClick={(orderId) => {
                                    handleClose();
                                    onTrackingOpen(orderId);
                                }}
                                onDelete={deleteNotification}
                            />
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}

export default function NotificationModal({ onClose, onTrackingOpen }) {
    return createPortal(
        <NotificationContent onClose={onClose} onTrackingOpen={onTrackingOpen} />,
        document.body
    );
}