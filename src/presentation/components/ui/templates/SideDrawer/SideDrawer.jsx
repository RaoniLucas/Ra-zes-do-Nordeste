import { useState } from 'react';
import { useNotifications } from '@/presentation/contexts/NotificationsContext';
import { useLocation } from '@/presentation/contexts/LocationContext';
import './SideDrawer.css';

export default function SideDrawer({
    user,
    onLoginClick,
    onRegisterClick,
    onProfileClick,
    onTrackOrderClick,
    activeOrderId,
    isOpen,
}) {
    const { unreadCount } = useNotifications();
    const { availableUnits, selectedUnit, selectUnit } = useLocation();
    const [showUnitSelector, setShowUnitSelector] = useState(false);
    const hasActiveOrder = Boolean(activeOrderId);

    // Logs para debug
    console.log('SideDrawer - availableUnits:', availableUnits);
    console.log('SideDrawer - selectedUnit:', selectedUnit);

    return (
        <nav className={`sidebar-menu ${isOpen ? 'open' : 'hidden'}`}>
            <div className="corner c-tl"></div>
            <div className="corner c-tr"></div>
            <div className="corner c-bl"></div>
            <div className="corner c-br"></div>

            <header className="menu-header">
                <span>Menu</span>
            </header>

            <ul className="menu-list">
                <li>
                    <button onClick={() => alert('Em breve: Catálogo Completo')}>
                        Catálogo
                    </button>
                </li>
                <li>
                    <button onClick={() => alert('Em breve: Promoções')}>
                        Promoções
                    </button>
                </li>
                {hasActiveOrder && (
                    <li className="menu-track-item">
                        <button className="menu-track-btn" onClick={onTrackOrderClick}>
                            Rastrear Pedido
                            <span className="menu-track-dot" />
                        </button>
                    </li>
                )}
                <li>
                    <button
                        onClick={() => {
                            console.log('🔄 Rede Disponível clicado, availableUnits:', availableUnits);
                            setShowUnitSelector(!showUnitSelector);
                        }}
                    >
                        Rede Disponível {selectedUnit && `(${selectedUnit.nome})`}
                    </button>
                    {showUnitSelector && availableUnits && availableUnits.length > 0 && (
                        <ul className="unit-selector-list">
                            {availableUnits.map((unit) => (
                                <li key={unit.id}>
                                    <button
                                        className={`unit-selector-item ${selectedUnit?.id === unit.id ? 'active' : ''}`}
                                        onClick={() => {
                                            console.log('🔄 Selecionando unidade:', unit);
                                            selectUnit(unit);
                                            setShowUnitSelector(false);
                                        }}
                                    >
                                        <span>{unit.nome}</span>
                                        <span className="unit-selector-address">
                                            {unit.cidade} - {unit.bairro}
                                        </span>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                    {showUnitSelector && (!availableUnits || availableUnits.length === 0) && (
                        <ul className="unit-selector-list">
                            <li style={{ padding: '10px', color: '#888' }}>
                                Nenhuma unidade disponível
                            </li>
                        </ul>
                    )}
                </li>
            </ul>

            <footer className="menu-footer">
                {user ? (
                    <div className="user-info">
                        <button className="user-profile-btn" onClick={onProfileClick}>
                            <div className="user-profile-content">
                                {user.avatarBase64 ? (
                                    <img src={user.avatarBase64} className="user-avatar-sm" alt="" />
                                ) : (
                                    <span className="user-avatar-placeholder">👤</span>
                                )}
                                <div className="user-info-text">
                                    <span className="user-name">{user.nome}</span>
                                    <span className="user-points">{user.pontos || 0} pts</span>
                                </div>
                            </div>
                            <div className="user-profile-indicator">
                                <span>{'>'}</span>
                            </div>
                        </button>
                    </div>
                ) : (
                    <div className="auth-buttons">
                        <button onClick={onLoginClick}>Entrar</button>
                        <button onClick={onRegisterClick}>Cadastrar</button>
                    </div>
                )}
            </footer>
        </nav>
    );
}