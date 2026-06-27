import { apiClient } from '../../infrastructure/api/apiClient';

export const AuthService = {
    login: (email, password) => {
        console.log('AuthService.login - dados enviados:', { email, password });
        return apiClient.post('/auth/login', { email, password });
    },
    register: (nome, email, password, telefone) => {
        console.log('AuthService.register - dados:', { nome, email, password, telefone });
        return apiClient.post('/auth/register', { nome, email, password, telefone });
    },
    me: (token) => apiClient.get('/auth/me', token),
    updateProfile: (data, token) => apiClient.patch('/auth/profile', data, token),
    setLoyaltyMember: (isMember, token) =>
        apiClient.post('/user/loyalty', { isMember }, token),
};