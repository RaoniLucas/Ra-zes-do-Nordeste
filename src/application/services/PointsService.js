import { apiClient } from '../../infrastructure/api/apiClient';

export const PointsService = {
    add: (amount, token) => apiClient.post('/user/points/add', { amount }, token),
};