import { apiClient } from '../../infrastructure/api/apiClient';

export const NotificationService = {
    getMy: (token) => apiClient.get('/user/notifications', null, token),
};