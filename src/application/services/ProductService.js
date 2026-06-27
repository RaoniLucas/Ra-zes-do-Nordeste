import { apiClient } from '../../infrastructure/api/apiClient';

export const ProductService = {
    getAll: (params = {}) => {
        const query = new URLSearchParams(params).toString();
        const url = `/products${query ? '?' + query : ''}`;
        console.log('🔗 ProductService.getAll - url:', url); // LOG TEMPORÁRIO
        return apiClient.get(url);
    },
    getById: (id) => {
        console.log('🔗 ProductService.getById - id:', id); // LOG TEMPORÁRIO
        return apiClient.get(`/products/${id}`);
    },
    getBySeason: (season) => {
        console.log('🔗 ProductService.getBySeason - season:', season); // LOG TEMPORÁRIO
        return apiClient.get(`/products/seasonal/${season}`);
    },
    getStock: (productId, unitId) => {
        console.log('🔗 ProductService.getStock - productId:', productId, 'unitId:', unitId); // LOG TEMPORÁRIO
        return apiClient.get(`/products/${productId}/stock?unitId=${unitId}`);
    },
    getSuggestions: (productId) => {
        console.log('🔗 ProductService.getSuggestions - productId:', productId); // LOG TEMPORÁRIO
        return apiClient.get(`/products/${productId}/suggestions`);
    },
};