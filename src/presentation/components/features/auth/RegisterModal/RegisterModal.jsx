import { useState } from 'react';
import { useAuth } from '@/presentation/contexts/AuthContext';
import LocationSetupModal from '../LocationSetupModal/LocationSetupModal';
import './RegisterModal.css';

export default function RegisterModal({ onSuccess, onSwitchToLogin, onClose }) {
    const { register } = useAuth();
    const [nome, setNome] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showLocationSetup, setShowLocationSetup] = useState(false);
    const [registeredUser, setRegisteredUser] = useState(null);
    const [telefone, setTelefone] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        console.log('RegisterModal - submit:', { nome, email, password, confirmPassword });

        if (!nome || !email || !password || !confirmPassword || !telefone) {
            setError('Preencha todos os campos');
            return;
        }

        if (password.length < 6) {
            setError('Senha deve ter no minimo 6 caracteres');
            return;
        }

        if (password !== confirmPassword) {
            setError('As senhas nao conferem');
            return;
        }

        setIsLoading(true);
        try {
            const user = await register(nome, email, password, telefone);
            console.log('RegisterModal - sucesso:', user);
            setRegisteredUser(user);
            setShowLocationSetup(true);
        } catch (err) {
            console.error('RegisterModal - erro:', err);
            setError(err.message || 'Erro ao criar conta');
        } finally {
            setIsLoading(false);
        }
    };

    const handleLocationComplete = () => {
        setShowLocationSetup(false);
        onSuccess(registeredUser);
    };

    const handleLocationSkip = () => {
        setShowLocationSetup(false);
        onSuccess(registeredUser);
    };

    return (
        <>
            <div className="modal-overlay" onClick={onClose}>
                <div className="modal animate-in" onClick={(e) => e.stopPropagation()}>
                    <header className="modal-header">
                        <h2>Criar Conta</h2>
                        <button className="btn-close" onClick={onClose}>X</button>
                    </header>
                    <form onSubmit={handleSubmit}>
                        {error && <p className="error">{error}</p>}
                        <label>
                            Nome
                            <input
                                type="text"
                                value={nome}
                                onChange={(e) => setNome(e.target.value)}
                                placeholder="Seu nome"
                                disabled={isLoading}
                                required
                            />
                        </label>
                        <label>
                            Telefone
                            <input
                                type="tel"
                                value={telefone}
                                onChange={(e) => setTelefone(e.target.value)}
                                placeholder="(00) 00000-0000"
                                disabled={isLoading}
                                required
                            />
                        </label>
                        <label>
                            E-mail
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="seu@email.com"
                                disabled={isLoading}
                                required
                            />
                        </label>
                        <label>
                            Senha
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Minimo 6 caracteres"
                                disabled={isLoading}
                                required
                            />
                        </label>
                        <label>
                            Confirmar Senha
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Repita a senha"
                                disabled={isLoading}
                                required
                            />
                        </label>
                        <button type="submit" disabled={isLoading}>
                            {isLoading ? 'Criando conta...' : 'Criar Conta'}
                        </button>
                    </form>
                    <p className="modal-switch">
                        Ja tem conta? <button onClick={onSwitchToLogin}>Fazer login</button>
                    </p>
                </div>
            </div>

            {showLocationSetup && (
                <LocationSetupModal
                    onComplete={handleLocationComplete}
                    onSkip={handleLocationSkip}
                />
            )}
        </>
    );
}
