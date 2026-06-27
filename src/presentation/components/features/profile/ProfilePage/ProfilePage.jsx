import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '@/presentation/contexts/AuthContext';
import { useLocation } from '@/presentation/contexts/LocationContext';
import { useScrollLock } from '@/shared/hooks/useScrollLock';
import { AuthService } from '@/application/services/AuthService';
import './ProfilePage.css';

function ProfilePageContent({ onClose, onLogout }) {
    const { user, token, updateUser } = useAuth();
    const {
        userLocation,
        userAddress,
        selectedUnit,
        availableUnits,
        selectUnit,
        detectLocation,
        setLocationByCep,
        updateUserAddress,
        isLoading: locationLoading
    } = useLocation();

    const [visible, setVisible] = useState(false);
    const [nome, setNome] = useState(user?.nome || '');
    const [email, setEmail] = useState(user?.email || '');
    const [cep, setCep] = useState('');
    const [rua, setRua] = useState('');
    const [bairro, setBairro] = useState('');
    const [cidade, setCidade] = useState('');
    const [estado, setEstado] = useState('');
    const [showCepInput, setShowCepInput] = useState(false);
    const [saving, setSaving] = useState(false);
    const [savingAddress, setSavingAddress] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [addressSuccess, setAddressSuccess] = useState('');

    useScrollLock(true);

    useEffect(() => {
        requestAnimationFrame(() => setVisible(true));
    }, []);

    // Preencher campos de endereço quando userAddress mudar
    useEffect(() => {
        if (userAddress) {
            setCep(userAddress.cep || '');
            setRua(userAddress.logradouro || userAddress.rua || '');
            setBairro(userAddress.bairro || '');
            setCidade(userAddress.cidade || '');
            setEstado(userAddress.estado || '');
        }
    }, [userAddress]);

    const handleClose = () => {
        setVisible(false);
        setTimeout(onClose, 280);
    };

    const handleSave = async () => {
        setError('');
        setSuccess('');
        setSaving(true);
        try {
            const updated = await AuthService.updateProfile({ nome, email }, token);
            updateUser(updated);
            setSuccess('Perfil atualizado com sucesso!');
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.message || 'Falha ao salvar');
        } finally {
            setSaving(false);
        }
    };

    const handleSaveAddress = async () => {
        setError('');
        setAddressSuccess('');
        setSavingAddress(true);
        try {
            const addressData = {
                cep,
                logradouro: rua,
                bairro,
                cidade,
                estado,
            };
            updateUserAddress(addressData);

            // Também atualizar a localização do usuário no contexto
            const locationData = {
                cep,
                cidade,
                bairro,
                logradouro: rua,
                estado,
                automatico: false,
            };
            // Se tiver CEP, buscar unidades próximas
            if (cep && cep.length === 8) {
                await setLocationByCep(cep);
            }

            setAddressSuccess('Endereço atualizado com sucesso!');
            setTimeout(() => setAddressSuccess(''), 3000);
        } catch (err) {
            setError(err.message || 'Falha ao salvar endereço');
        } finally {
            setSavingAddress(false);
        }
    };

    const handleDetectLocation = async () => {
        setError('');
        setSuccess('');
        try {
            await detectLocation();
            setSuccess('Localizacao atualizada com sucesso!');
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError('Falha ao detectar localizacao');
        }
    };

    const handleCepBlur = async () => {
        if (cep && cep.length === 8) {
            try {
                // Buscar endereço via CEP
                const addressData = await fetch(`https://viacep.com.br/ws/${cep}/json/`).then(res => res.json());
                if (!addressData.erro) {
                    setRua(addressData.logradouro || '');
                    setBairro(addressData.bairro || '');
                    setCidade(addressData.localidade || '');
                    setEstado(addressData.uf || '');
                }
            } catch (err) {
                console.warn('Erro ao buscar CEP:', err);
            }
        }
    };

    const formatUserAddress = () => {
        if (!userAddress) return 'Nao definido';
        const parts = [];
        if (userAddress.logradouro) parts.push(userAddress.logradouro);
        if (userAddress.bairro) parts.push(userAddress.bairro);
        if (userAddress.cidade) parts.push(userAddress.cidade);
        if (userAddress.estado) parts.push(userAddress.estado);
        if (userAddress.cep) parts.push('CEP: ' + userAddress.cep);
        return parts.length > 0 ? parts.join(', ') : 'Nao definido';
    };

    return (
        <div className={`profile-overlay ${visible ? 'visible' : ''}`} onClick={handleClose}>
            <div className={`profile-page ${visible ? 'visible' : ''}`} onClick={(e) => e.stopPropagation()}>
                <div className="profile-header">
                    <h1 className="profile-title">Meu Perfil</h1>
                    <button className="profile-close" onClick={handleClose}>X</button>
                </div>

                <div className="profile-body">
                    <div className="profile-avatar-section">
                        <div className="avatar-upload">
                            <span className="avatar-placeholder">👤</span>
                        </div>
                    </div>

                    <div className="points-card">
                        <h3>{user?.pontos || 0} pts</h3>
                        <p style={{ fontSize: '0.8rem', opacity: 0.7 }}>Teto: 1000 pts</p>
                    </div>

                    {error && <div className="profile-error">{error}</div>}
                    {success && <div className="profile-success">{success}</div>}
                    {addressSuccess && <div className="profile-success">{addressSuccess}</div>}

                    <div className="profile-fields">
                        <h2 className="profile-section-title">Informacoes Pessoais</h2>

                        <label className="profile-label">
                            Nome
                            <input type="text" value={nome} onChange={(e) => setNome(e.target.value)} disabled={saving} />
                        </label>

                        <label className="profile-label">
                            Email
                            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} disabled={saving} />
                        </label>

                        <button className="profile-save-btn" onClick={handleSave} disabled={saving}>
                            {saving ? 'Salvando...' : 'Salvar alteracoes'}
                        </button>
                    </div>

                    <div className="profile-location-section">
                        <h2 className="profile-section-title">Endereco do Usuario</h2>

                        <div className="profile-location-display" style={{ marginBottom: '12px' }}>
                            <span className="location-label">Endereco atual:</span>
                            <span className="location-value">{formatUserAddress()}</span>
                        </div>

                        <div className="profile-address-form">
                            <label className="profile-label">
                                CEP
                                <input
                                    type="text"
                                    value={cep}
                                    onChange={(e) => setCep(e.target.value.replace(/\D/g, '').slice(0, 8))}
                                    onBlur={handleCepBlur}
                                    placeholder="Digite o CEP"
                                    maxLength="8"
                                    disabled={savingAddress}
                                />
                            </label>

                            <label className="profile-label">
                                Rua
                                <input
                                    type="text"
                                    value={rua}
                                    onChange={(e) => setRua(e.target.value)}
                                    placeholder="Nome da rua"
                                    disabled={savingAddress}
                                />
                            </label>

                            <label className="profile-label">
                                Bairro
                                <input
                                    type="text"
                                    value={bairro}
                                    onChange={(e) => setBairro(e.target.value)}
                                    placeholder="Bairro"
                                    disabled={savingAddress}
                                />
                            </label>

                            <div className="profile-address-row">
                                <label className="profile-label" style={{ flex: 2 }}>
                                    Cidade
                                    <input
                                        type="text"
                                        value={cidade}
                                        onChange={(e) => setCidade(e.target.value)}
                                        placeholder="Cidade"
                                        disabled={savingAddress}
                                    />
                                </label>
                                <label className="profile-label" style={{ flex: 1 }}>
                                    Estado
                                    <input
                                        type="text"
                                        value={estado}
                                        onChange={(e) => setEstado(e.target.value.toUpperCase().slice(0, 2))}
                                        placeholder="UF"
                                        maxLength="2"
                                        disabled={savingAddress}
                                    />
                                </label>
                            </div>

                            <button
                                className="profile-save-btn"
                                onClick={handleSaveAddress}
                                disabled={savingAddress || !cep || !rua || !bairro || !cidade || !estado}
                                style={{ marginTop: '8px' }}
                            >
                                {savingAddress ? 'Salvando endereco...' : 'Salvar Endereco'}
                            </button>
                        </div>

                        <div className="profile-location-actions">
                            <button className="location-btn" onClick={handleDetectLocation} disabled={locationLoading}>
                                {locationLoading ? 'Detectando...' : 'Detectar localizacao automatica'}
                            </button>
                        </div>

                        <h2 className="profile-section-title" style={{ marginTop: '16px' }}>Unidade Selecionada</h2>
                        <div className="profile-location-display">
                            <span className="location-label">Unidade:</span>
                            <span className="location-value">{selectedUnit?.nome || 'Nenhuma'}</span>
                        </div>
                        {selectedUnit && (
                            <div className="profile-location-display" style={{ marginTop: '-4px' }}>
                                <span className="location-value" style={{ fontSize: '0.8rem', color: '#888' }}>
                                    {selectedUnit.cidade} - {selectedUnit.bairro}
                                </span>
                            </div>
                        )}

                        {availableUnits.length > 0 && (
                            <div className="profile-units">
                                <h3 className="profile-section-title">Unidades disponiveis na sua regiao</h3>
                                <ul className="profile-unit-list">
                                    {availableUnits.map((unit) => (
                                        <li key={unit.id}>
                                            <button
                                                className={`profile-unit-item ${selectedUnit?.id === unit.id ? 'active' : ''}`}
                                                onClick={() => selectUnit(unit)}
                                            >
                                                <span className="unit-name">{unit.nome}</span>
                                                <span className="unit-address">{unit.cidade} - {unit.bairro}</span>
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>

                    <button className="profile-logout-btn" onClick={onLogout}>
                        Sair da conta
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function ProfilePage({ onClose, onLogout }) {
    return createPortal(
        <ProfilePageContent onClose={onClose} onLogout={onLogout} />,
        document.body
    );
}