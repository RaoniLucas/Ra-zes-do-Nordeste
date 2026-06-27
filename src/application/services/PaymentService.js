import { apiClient } from '../../infrastructure/api/apiClient';

export const PaymentService = {
    process: (data, token) => apiClient.post('/payment/process', data, token),
};