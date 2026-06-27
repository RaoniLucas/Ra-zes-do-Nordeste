import { apiClient } from '../../infrastructure/api/apiClient';

export const LocationService = {
    getByCep: async (cep) => {
        try {
            const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
            const data = await response.json();
            if (data.erro) {
                throw new Error('CEP nao encontrado');
            }
            return {
                cep: data.cep,
                logradouro: data.logradouro,
                bairro: data.bairro,
                cidade: data.localidade,
                estado: data.uf,
            };
        } catch (error) {
            console.error('Erro ao buscar CEP:', error);
            throw new Error('Nao foi possivel validar o CEP');
        }
    },

    getAddressByCoords: async (lat, lng) => {
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1&accept-language=pt`
            );
            const data = await response.json();

            if (!data || !data.address) {
                throw new Error('Endereco nao encontrado');
            }

            const address = data.address;
            return {
                logradouro: address.road || address.street || '',
                bairro: address.suburb || address.neighbourhood || address.district || '',
                cidade: address.city || address.town || address.village || '',
                estado: address.state || '',
                cep: address.postcode || '',
            };
        } catch (error) {
            console.error('Erro ao buscar endereco por coordenadas:', error);
            throw new Error('Nao foi possivel obter o endereco');
        }
    },

    getUnitsByLocation: async (locationData) => {
        try {
            let units = [];

            console.log('Buscando unidades para:', locationData);

            if (locationData.lat && locationData.lng) {
                units = await apiClient.get(`/units/nearby?lat=${locationData.lat}&lng=${locationData.lng}`);
            } else if (locationData.cidade && locationData.bairro) {
                units = await apiClient.get(`/units/nearby?cidade=${locationData.cidade}&bairro=${locationData.bairro}`);
            } else if (locationData.cidade) {
                const allUnits = await apiClient.get('/units');
                units = allUnits.filter(u => u.cidade === locationData.cidade);
            }

            console.log('Unidades encontradas:', units);
            return units;
        } catch (error) {
            console.error('Erro ao buscar unidades:', error);
            return [];
        }
    },

    getNearestUnit: (units, locationData) => {
        if (!units || units.length === 0) {
            console.log('Nenhuma unidade disponivel');
            return null;
        }

        console.log('Calculando unidade mais proxima para:', locationData);

        if (locationData.lat && locationData.lng) {
            const toRad = (deg) => deg * (Math.PI / 180);
            const R = 6371;

            const unitsWithDistance = units.map(unit => {
                const dLat = toRad(unit.lat - locationData.lat);
                const dLng = toRad(unit.lng - locationData.lng);
                const a = Math.sin(dLat / 2) ** 2 +
                    Math.cos(toRad(locationData.lat)) * Math.cos(toRad(unit.lat)) * Math.sin(dLng / 2) ** 2;
                const distance = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
                return { ...unit, distance };
            });

            unitsWithDistance.sort((a, b) => a.distance - b.distance);
            console.log('Unidade mais proxima:', unitsWithDistance[0]);
            return unitsWithDistance[0];
        }

        return units[0];
    },

    calculateDistance: (lat1, lng1, lat2, lng2) => {
        const toRad = (deg) => deg * (Math.PI / 180);
        const R = 6371;
        const dLat = toRad(lat2 - lat1);
        const dLng = toRad(lng2 - lng1);
        const a = Math.sin(dLat / 2) ** 2 +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
        return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    },
};