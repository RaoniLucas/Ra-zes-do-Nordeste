import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useLocation } from '@/presentation/contexts/LocationContext';
import { useScrollLock } from '@/shared/hooks/useScrollLock';
import './LocationSetupModal.css';

function LocationSetupContent({ onComplete, onSkip }) {
    const { detectLocation, setLocationByCep, isLoading, error } = useLocation();
    const [cep, setCep] = useState('');
    const [visible, setVisible] = useState(false);
    const [mode, setMode] = useState('choice');

    useScrollLock(true);

    useEffect(() => {
        requestAnimationFrame(() => setVisible(true));
    }, []);

    const handleDetectLocation = async () => {
        await detectLocation();
        onComplete();
    };

    const handleCepSubmit = async (e) => {
        e.preventDefault();
        if (cep.length !== 8) {
            alert('Digite um CEP válido com 8 dígitos');
            return;
        }
        await setLocationByCep(cep);
        onComplete();
    };

    const handleClose = () => {
        setVisible(false);
        setTimeout(onSkip, 260);
    };

    return (
        <div className={`location-setup-overlay ${visible ? 'visible' : ''}`}>
            <div className={`location-setup-modal ${visible ? 'visible' : ''}`} onClick={(e) => e.stopPropagation()}>
                <div className="location-setup-header">
                    <h2>Onde você está?</h2>
                    <button className="location-setup-close" onClick={handleClose}>X</button>
                </div>

                {error && (
                    <div className="location-setup-error">
                        {error}
                    </div>
                )}

                {mode === 'choice' && (
                    <div className="location-setup-choice">
                        <p>Para oferecer o melhor cardápio, precisamos saber sua localização.</p>
                        <button
                            className="location-setup-btn-primary"
                            onClick={handleDetectLocation}
                            disabled={isLoading}
                        >
                            {isLoading ? 'Detectando...' : 'Usar localização automática'}
                        </button>
                        <button
                            className="location-setup-btn-secondary"
                            onClick={() => setMode('manual')}
                            disabled={isLoading}
                        >
                            Inserir CEP manualmente
                        </button>
                        <button
                            className="location-setup-btn-skip"
                            onClick={handleClose}
                            disabled={isLoading}
                        >
                            Pular por enquanto
                        </button>
                    </div>
                )}

                {mode === 'manual' && (
                    <form className="location-setup-form" onSubmit={handleCepSubmit}>
                        <label>
                            Digite seu CEP
                            <input
                                type="text"
                                value={cep}
                                onChange={(e) => setCep(e.target.value.replace(/\D/g, ''))}
                                placeholder="Ex: 51021000"
                                maxLength="8"
                                disabled={isLoading}
                                autoFocus
                            />
                        </label>
                        <div className="location-setup-actions">
                            <button type="button" className="location-setup-btn-secondary" onClick={() => setMode('choice')}>
                                Voltar
                            </button>
                            <button type="submit" className="location-setup-btn-primary" disabled={isLoading || cep.length !== 8}>
                                {isLoading ? 'Buscando...' : 'Confirmar'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}

export default function LocationSetupModal({ onComplete, onSkip }) {
    return createPortal(
        <LocationSetupContent onComplete={onComplete} onSkip={onSkip} />,
        document.body
    );
}