import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { LocationService } from '@/application/services/LocationService';

const LocationContext = createContext(null);

export function LocationProvider({ children }) {
    const [userLocation, setUserLocation] = useState(null);
    const [userAddress, setUserAddress] = useState(null);
    const [availableUnits, setAvailableUnits] = useState([]);
    const [selectedUnit, setSelectedUnit] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const detectLocation = useCallback(async () => {
        console.log('Iniciando deteccao de localizacao...');
        setIsLoading(true);
        setError(null);

        try {
            if (!navigator.geolocation) {
                setError('Seu navegador nao suporta geolocalizacao.');
                setIsLoading(false);
                return;
            }

            console.log('Solicitando posicao GPS...');

            const position = await new Promise((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject, {
                    enableHighAccuracy: true,
                    timeout: 15000,
                    maximumAge: 60000
                });
            });

            console.log('Posicao obtida:', position.coords);

            const locationData = {
                lat: position.coords.latitude,
                lng: position.coords.longitude,
                automatico: true
            };

            setUserLocation(locationData);

            try {
                const addressInfo = await LocationService.getAddressByCoords(
                    position.coords.latitude,
                    position.coords.longitude
                );
                console.log('Endereco obtido:', addressInfo);
                setUserAddress(addressInfo);
                localStorage.setItem('user_address', JSON.stringify(addressInfo));
            } catch (addrError) {
                console.warn('Nao foi possivel obter endereco:', addrError);
                setUserAddress(null);
            }

            const units = await LocationService.getUnitsByLocation(locationData);
            console.log('Unidades encontradas:', units);

            if (units.length === 0) {
                setError('Nenhuma unidade encontrada proxima a sua localizacao.');
                setIsLoading(false);
                return;
            }

            const nearest = LocationService.getNearestUnit(units, locationData);
            console.log('Unidade mais proxima:', nearest);

            setAvailableUnits(units);
            setSelectedUnit(nearest);

            localStorage.setItem('user_location', JSON.stringify(locationData));
            localStorage.setItem('selected_unit', JSON.stringify(nearest));

        } catch (err) {
            console.error('Erro na deteccao:', err);
            if (err.code === 1) {
                setError('Permissao de localizacao negada. Insira seu CEP manualmente.');
            } else if (err.code === 2) {
                setError('Sinal de GPS fraco. Insira seu CEP manualmente.');
            } else if (err.code === 3) {
                setError('Tempo limite excedido. Insira seu CEP manualmente.');
            } else {
                setError(err.message || 'Erro ao detectar localizacao');
            }
        } finally {
            setIsLoading(false);
        }
    }, []);

    const setLocationByCep = useCallback(async (cep) => {
        console.log('Buscando localizacao por CEP:', cep);
        setIsLoading(true);
        setError(null);

        try {
            const addressData = await LocationService.getByCep(cep);
            console.log('Endereco encontrado:', addressData);

            const addressInfo = {
                cep: addressData.cep,
                logradouro: addressData.logradouro,
                bairro: addressData.bairro,
                cidade: addressData.cidade,
                estado: addressData.estado,
            };
            setUserAddress(addressInfo);

            const locationData = {
                cep: addressData.cep,
                cidade: addressData.cidade,
                bairro: addressData.bairro,
                logradouro: addressData.logradouro,
                estado: addressData.estado,
                automatico: false
            };
            setUserLocation(locationData);

            const units = await LocationService.getUnitsByLocation(locationData);
            console.log('Unidades encontradas:', units);

            if (units.length === 0) {
                setError('Nenhuma unidade encontrada na sua regiao.');
                setIsLoading(false);
                return;
            }

            const nearest = LocationService.getNearestUnit(units, locationData);
            setAvailableUnits(units);
            setSelectedUnit(nearest);

            localStorage.setItem('user_location', JSON.stringify(locationData));
            localStorage.setItem('user_address', JSON.stringify(addressInfo));
            localStorage.setItem('selected_unit', JSON.stringify(nearest));

        } catch (err) {
            console.error('Erro ao buscar CEP:', err);
            setError(err.message || 'Erro ao buscar localizacao pelo CEP');
        } finally {
            setIsLoading(false);
        }
    }, []);

    const selectUnit = useCallback((unit) => {
        console.log('Selecionando unidade:', unit);
        setSelectedUnit(unit);
        localStorage.setItem('selected_unit', JSON.stringify(unit));
    }, []);

    const updateUserAddress = useCallback((addressData) => {
        console.log('Atualizando endereco:', addressData);
        setUserAddress(addressData);
        localStorage.setItem('user_address', JSON.stringify(addressData));
    }, []);

    const getDeliveryFee = useCallback(() => {
        if (!userLocation || !selectedUnit) return 5;

        if (userLocation.lat && userLocation.lng && selectedUnit.lat && selectedUnit.lng) {
            const distance = LocationService.calculateDistance(
                userLocation.lat,
                userLocation.lng,
                selectedUnit.lat,
                selectedUnit.lng
            );

            if (distance <= 3) return 5;
            if (distance <= 7) return 8;
            return 12;
        }

        return 5;
    }, [userLocation, selectedUnit]);

    const clearLocation = useCallback(() => {
        setUserLocation(null);
        setUserAddress(null);
        setAvailableUnits([]);
        setSelectedUnit(null);
        localStorage.removeItem('user_location');
        localStorage.removeItem('user_address');
        localStorage.removeItem('selected_unit');
    }, []);

    useEffect(() => {
        const savedLocation = localStorage.getItem('user_location');
        const savedAddress = localStorage.getItem('user_address');
        const savedUnit = localStorage.getItem('selected_unit');

        if (savedUnit) {
            try {
                setSelectedUnit(JSON.parse(savedUnit));
            } catch {
                localStorage.removeItem('selected_unit');
            }
        }

        if (savedAddress) {
            try {
                setUserAddress(JSON.parse(savedAddress));
            } catch {
                localStorage.removeItem('user_address');
            }
        }

        if (savedLocation) {
            try {
                setUserLocation(JSON.parse(savedLocation));
            } catch {
                localStorage.removeItem('user_location');
            }
        }
    }, []);

    return (
        <LocationContext.Provider value={{
            userLocation,
            userAddress,
            availableUnits,
            selectedUnit,
            isLoading,
            error,
            detectLocation,
            setLocationByCep,
            selectUnit,
            updateUserAddress,
            clearLocation,
            getDeliveryFee,
        }}>
            {children}
        </LocationContext.Provider>
    );
}

export function useLocation() {
    const context = useContext(LocationContext);
    if (!context) {
        throw new Error('useLocation deve ser usado dentro de LocationProvider');
    }
    return context;
}