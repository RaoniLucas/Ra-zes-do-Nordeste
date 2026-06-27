const BASE_URL = '/api';

async function handleResponse(response) {
    console.log('Resposta recebida - status:', response.status);

    if (!response.ok) {
        let errorMessage = `Erro ${response.status}`;
        try {
            const errorData = await response.json();
            console.error('Erro da API:', errorData);
            errorMessage = errorData.error || errorMessage;
        } catch (e) {
            console.error('Erro ao parsear resposta:', e);
        }
        throw new Error(errorMessage);
    }

    const data = await response.json();
    console.log('Dados recebidos:', data);
    return data;
}

export const apiClient = {
    get: (endpoint, token) => {
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        console.log(`GET ${BASE_URL}${endpoint}`);
        return fetch(`${BASE_URL}${endpoint}`, { headers }).then(handleResponse);
    },
    post: (endpoint, body, token) => {
        const headers = {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        };
        console.log(`POST ${BASE_URL}${endpoint}`, body);
        return fetch(`${BASE_URL}${endpoint}`, {
            method: 'POST',
            headers,
            body: JSON.stringify(body),
        }).then(handleResponse);
    },
    patch: (endpoint, body, token) => {
        const headers = {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        };
        console.log(`PATCH ${BASE_URL}${endpoint}`, body);
        return fetch(`${BASE_URL}${endpoint}`, {
            method: 'PATCH',
            headers,
            body: JSON.stringify(body),
        }).then(handleResponse);
    },
};