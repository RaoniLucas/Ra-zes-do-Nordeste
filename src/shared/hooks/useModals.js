import { useState } from 'react';

export function useModals() {
    const [showLogin, setShowLogin] = useState(false);
    const [showRegister, setShowRegister] = useState(false);
    const [showCart, setShowCart] = useState(false);
    const [showCheckout, setShowCheckout] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [showProfile, setShowProfile] = useState(false);
    const [trackingOrderId, setTrackingOrderId] = useState(null);
    const [activeOrderId, setActiveOrderId] = useState(null);

    const openTracking = (orderId) => {
        setTrackingOrderId(orderId || activeOrderId);
    };

    const handleCheckoutDone = (orderId) => {
        setActiveOrderId(orderId);
        setShowCheckout(false);
    };

    const switchToRegister = () => {
        setShowLogin(false);
        setShowRegister(true);
    };

    const switchToLogin = () => {
        setShowRegister(false);
        setShowLogin(true);
    };

    return {
        showLogin, setShowLogin,
        showRegister, setShowRegister,
        showCart, setShowCart,
        showCheckout, setShowCheckout,
        showNotifications, setShowNotifications,
        showProfile, setShowProfile,
        trackingOrderId, setTrackingOrderId,
        activeOrderId,
        openTracking,
        handleCheckoutDone,
        switchToRegister,
        switchToLogin,
    };
}