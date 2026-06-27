import { useState } from 'react';
import LgpdConsent from '@/presentation/components/features/auth/LgpdConsent';
import LocationModal from '@/presentation/components/features/location/LocationModal';
import AppModeModal from '@/presentation/components/features/mode/AppModeModal';
import UserAppHome from './UserAppHome';
import TotemHome from './TotemHome';

const STEPS = {
    LGPD: 'lgpd',
    LOCATION: 'location',
    MODE: 'mode',
    USER_APP: 'userapp',
    TOTEM: 'totem',
};

export default function HomePage() {
    const [step, setStep] = useState(() => localStorage.getItem('app_step') || STEPS.LGPD);
    const [userLocation, setUserLocation] = useState(() => {
        const saved = localStorage.getItem('user_location');
        return saved ? JSON.parse(saved) : null;
    });

    const goToStep = (newStep) => {
        localStorage.setItem('app_step', newStep);
        setStep(newStep);
    };

    const handleLocationSuccess = (locationData) => {
        localStorage.setItem('user_location', JSON.stringify(locationData));
        setUserLocation(locationData);
        goToStep(STEPS.MODE);
    };

    if (step === STEPS.LGPD) return <LgpdConsent onAccept={() => goToStep(STEPS.LOCATION)} />;
    if (step === STEPS.LOCATION) return <LocationModal onSuccess={handleLocationSuccess} />;
    if (step === STEPS.MODE) return <AppModeModal onSelectUserApp={() => goToStep(STEPS.USER_APP)} onSelectTotem={() => goToStep(STEPS.TOTEM)} />;
    if (step === STEPS.TOTEM) return <TotemHome />;
    return <UserAppHome userLocation={userLocation} />;
}