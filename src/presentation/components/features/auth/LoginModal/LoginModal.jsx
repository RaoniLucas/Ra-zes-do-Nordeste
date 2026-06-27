import { useState } from 'react';
import { useAuth } from '@/presentation/contexts/AuthContext';
import './LoginModal.css';

export default function LoginModal({ onSuccess, onSwitchToRegister, onClose }) {
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        console.log('LoginModal - submit:', { email, password });

        if (!email || !password) {
            setError('Preencha todos os campos');
            return;
        }

        if (password.length < 6) {
            setError('Senha deve ter no minimo 6 caracteres');
            return;
        }

        setIsLoading(true);
        try {
            const user = await login(email, password);
            console.log('LoginModal - sucesso:', user);
            onSuccess(user);
        } catch (err) {
            console.error('LoginModal - erro:', err);
            setError(err.message || 'Erro ao fazer login');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal animate-in" onClick={(e) => e.stopPropagation()}>
                <header className="modal-header">
                    <h2>Entrar</h2>
                    <button className="btn-close" onClick={onClose}>X</button>
                </header>
                <form onSubmit={handleSubmit}>
                    {error && <p className="error">{error}</p>}
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
                            placeholder="Sua senha"
                            disabled={isLoading}
                            required
                        />
                    </label>
                    <button type="submit" disabled={isLoading}>
                        {isLoading ? 'Entrando...' : 'Entrar'}
                    </button>
                </form>
                <p className="modal-switch">
                    Nao tem conta? <button onClick={onSwitchToRegister}>Cadastre-se</button>
                </p>
            </div>
        </div>
    );
}