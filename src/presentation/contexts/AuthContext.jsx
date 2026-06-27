import { createContext, useContext, useState, useCallback } from 'react';
import { AuthService } from '../../application/services/AuthService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => {
        const saved = localStorage.getItem('app_user');
        return saved ? JSON.parse(saved) : null;
    });
    const [token, setToken] = useState(() => localStorage.getItem('app_token') || null);

    const saveSession = useCallback((userData, userToken) => {
        const userWithLoyalty = {
            ...userData,
            isLoyaltyMember: userData.isLoyaltyMember || false,
        };
        localStorage.setItem('app_user', JSON.stringify(userWithLoyalty));
        localStorage.setItem('app_token', userToken);
        setUser(userWithLoyalty);
        setToken(userToken);
    }, []);

    const updateUser = useCallback((userData) => {
        const updated = {
            ...userData,
            isLoyaltyMember: userData.isLoyaltyMember || user?.isLoyaltyMember || false,
        };
        localStorage.setItem('app_user', JSON.stringify(updated));
        setUser(updated);
    }, [user]);

    const login = useCallback(async (email, password) => {
        const data = await AuthService.login(email, password);
        saveSession(data.user, data.token);
        return data.user;
    }, [saveSession]);

    const register = useCallback(async (nome, email, password, telefone) => {
        const data = await AuthService.register(nome, email, password, telefone);
        saveSession(data.user, data.token);
        return data.user;
    }, [saveSession]);

    const logout = useCallback(() => {
        localStorage.removeItem('app_user');
        localStorage.removeItem('app_token');
        setUser(null);
        setToken(null);
    }, []);

    const setLoyaltyMember = useCallback(async (isMember) => {
        if (!user || !token) return;
        try {
            const updatedUser = await AuthService.setLoyaltyMember(isMember, token);
            updateUser(updatedUser);
        } catch (err) {
            console.warn('Erro ao atualizar status de fidelidade:', err);
            // Fallback: atualizar localmente
            const updatedUser = { ...user, isLoyaltyMember: isMember };
            localStorage.setItem('app_user', JSON.stringify(updatedUser));
            setUser(updatedUser);
        }
    }, [user, token, updateUser]);

    const refreshUser = useCallback(async (currentToken) => {
        const t = currentToken || token;
        if (!t) return;
        try {
            const data = await AuthService.me(t);
            updateUser(data);
        } catch (e) {
            console.warn('refreshUser falhou:', e);
        }
    }, [token, updateUser]);

    return (
        <AuthContext.Provider value={{
            user, token, login, register, logout, updateUser, refreshUser, setLoyaltyMember
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used inside <AuthProvider>');
    return context;
}