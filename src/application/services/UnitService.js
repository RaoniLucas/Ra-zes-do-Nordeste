import { apiClient } from '../../infrastructure/api/apiClient';

export const UnitService = {
    getAll: () => apiClient.get('/units'),
    getById: (id) => apiClient.get(`/units/${id}`),
    getNearby: (params) => {
        const query = new URLSearchParams(params).toString();
        return apiClient.get(`/units/nearby${query ? '?' + query : ''}`);
    },
};