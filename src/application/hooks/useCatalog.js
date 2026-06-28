import { useState, useEffect } from 'react';
import { UnitService } from '../services/UnitService';
import { ProductService } from '../services/ProductService';
import { groupByCategory } from '../../shared/helpers/groupByCategory';

export function useCatalog(userLocation) {
    const [state, setState] = useState({ categories: [], loading: true, error: null });

    useEffect(() => {
        let cancelled = false;
        async function fetchData() {
            try {
                setState(prev => ({ ...prev, loading: true, error: null }));

                console.log('useCatalog - userLocation:', userLocation);

                let units = [];
                if (userLocation?.automatico) {
                    units = await UnitService.getNearby({ lat: userLocation.lat, lng: userLocation.lng });
                } else if (userLocation?.cidade && userLocation?.bairro) {
                    units = await UnitService.getNearby({ cidade: userLocation.cidade, bairro: userLocation.bairro });
                }
                if (units.length === 0) units = await UnitService.getAll();

                const unit = units[0] || null;
                console.log('useCatalog - unit:', unit);

                const products = await ProductService.getAll(unit ? { unitId: unit.id } : {});
                console.log('useCatalog - products:', products);

                if (!cancelled) {
                    const categories = groupByCategory(products);
                    console.log('useCatalog - categories:', categories);
                    setState({ categories, loading: false, error: null });
                }
            } catch (err) {
                console.error('useCatalog - error:', err);
                if (!cancelled) setState(prev => ({ ...prev, loading: false, error: err.message }));
            }
        }
        if (userLocation) fetchData();
        return () => { cancelled = true; };
    }, [userLocation]);

    return state;
}