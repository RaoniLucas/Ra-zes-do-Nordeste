import { useState, useEffect } from 'react';
import { useAuth } from '@/presentation/contexts/AuthContext';
import { useCart } from '@/presentation/contexts/CartContext';
import { useNotifications } from '@/presentation/contexts/NotificationsContext';
import { useScrollDetection } from '@/shared/hooks/useScrollDetection';
import { useHeaderTheme } from '@/shared/hooks/useHeaderTheme';
import { useModals } from '@/shared/hooks/useModals';
import SideDrawer from '@/presentation/components/ui/templates/SideDrawer';
import CheckoutFlow from '@/presentation/components/features/cart/CheckoutFlow';
import CartDrawer from '@/presentation/components/features/cart/CartDrawer';
import LoginModal from '@/presentation/components/features/auth/LoginModal';
import RegisterModal from '@/presentation/components/features/auth/RegisterModal';
import NotificationModal from '@/presentation/components/features/notifications/NotificationModal';
import OrderTrackingModal from '@/presentation/components/features/tracking/OrderTrackingModal';
import ProfilePage from '@/presentation/components/features/profile/ProfilePage';
import PromoSection from '../sections/PromoSection';
import CatalogSection from '../sections/CatalogSection';
import SideDrawerIcon from '@/presentation/components/ui/icons/SideDrawerIcon';
import NotificationIcon from '@/presentation/components/ui/icons/NotificationIcon';
import CartIcon from '@/presentation/components/ui/icons/CartIcon';
import { OrderService } from '@/application/services/OrderService';
import './UserAppHome.css';

export default function UserAppHome({ userLocation }) {
    const { user, logout } = useAuth();
    const { totalItems } = useCart();
    const { unreadCount } = useNotifications();
    const [isSideDrawerOpen, setIsSideDrawerOpen] = useState(false);
    const { currentSection, containerRef } = useScrollDetection();
    const { setHeaderBgColor, useLightText } = useHeaderTheme(isSideDrawerOpen, currentSection);
    const {
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
    } = useModals();

    const [pedidoAtivo, setPedidoAtivo] = useState(false);
    useEffect(() => {
        if (activeOrderId) {
            OrderService.getTracking(activeOrderId)
                .then(data => {
                    setPedidoAtivo(data.status !== 'picked-up');
                })
                .catch(() => {
                    setPedidoAtivo(false);
                });
        } else {
            setPedidoAtivo(false);
        }
    }, [activeOrderId]);

    const handleCheckoutFromCart = () => {
        setShowCart(false);
        setShowCheckout(true);
    };

    const handleCheckoutDoneWrapper = (orderId) => {
        handleCheckoutDone(orderId);
        setPedidoAtivo(true);
    };

    const handleCloseTracking = () => {
        setTrackingOrderId(null);
        if (activeOrderId) {
            OrderService.getTracking(activeOrderId)
                .then(data => {
                    setPedidoAtivo(data.status !== 'picked-up');
                })
                .catch(() => {
                    setPedidoAtivo(false);
                });
        }
    };
    const showNotificationIcon = user || pedidoAtivo;

    const showLoginButton = !user && !isSideDrawerOpen && totalItems === 0;

    return (
        <>
            <header className="app-header" style={{ color: useLightText ? '#fff' : '#1a1a1a' }}>
                <div className="header-left">
                    <SideDrawerIcon isOpen={isSideDrawerOpen} onToggle={() => setIsSideDrawerOpen(p => !p)} />
                </div>
                <span className="logo">RAÍZES DO NORDESTE</span>
                <div className="header-right">
                    {showNotificationIcon && (
                        <NotificationIcon
                            unreadCount={unreadCount}
                            onClick={() => setShowNotifications(true)}
                        />
                    )}
                    {totalItems > 0 ? (
                        <button className={`btn-cart ${!useLightText ? 'light' : 'dark'}`} onClick={() => setShowCart(true)}>
                            <CartIcon />
                        </button>
                    ) : showLoginButton ? (
                        <button className={`btn-login ${!useLightText ? 'light' : 'dark'}`} onClick={() => setShowLogin(true)}>
                            Entrar
                        </button>
                    ) : null}
                </div>
            </header>

            <main className="snap-container" ref={containerRef}>
                <PromoSection onCheckout={handleCheckoutFromCart} onColorChange={setHeaderBgColor} />
                <CatalogSection userLocation={userLocation} />
            </main>

            <SideDrawer
                isOpen={isSideDrawerOpen}
                user={user}
                onLogout={logout}
                onLoginClick={() => setShowLogin(true)}
                onRegisterClick={() => setShowRegister(true)}
                onProfileClick={() => { setIsSideDrawerOpen(false); setShowProfile(true); }}
                onTrackOrderClick={() => { setIsSideDrawerOpen(false); openTracking(null); }}
                activeOrderId={activeOrderId}
            />

            {showLogin && <LoginModal onSuccess={() => setShowLogin(false)} onSwitchToRegister={switchToRegister} onClose={() => setShowLogin(false)} />}
            {showRegister && <RegisterModal onSuccess={() => setShowRegister(false)} onSwitchToLogin={switchToLogin} onClose={() => setShowRegister(false)} />}

            {showNotifications && (
                <NotificationModal
                    onClose={() => setShowNotifications(false)}
                    onTrackingOpen={(orderId) => {
                        setShowNotifications(false);
                        openTracking(orderId);
                    }}
                />
            )}

            {showProfile && <ProfilePage onClose={() => setShowProfile(false)} onLogout={() => { setShowProfile(false); logout(); }} />}
            {showCart && <CartDrawer onCheckout={handleCheckoutFromCart} onClose={() => setShowCart(false)} />}
            {showCheckout && <CheckoutFlow onClose={() => setShowCheckout(false)} onOrderPlaced={handleCheckoutDoneWrapper} />}
            {trackingOrderId && <OrderTrackingModal orderId={trackingOrderId} onClose={handleCloseTracking} />}
        </>
    );
}