import './AccountGateModal.css';

export default function AccountGateModal({ onLogin, onRegister, onClose }) {
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal animate-in" onClick={(e) => e.stopPropagation()}>
                <header className="modal-header">
                    <h2>Faça login para continuar</h2>
                    <button className="btn-close" onClick={onClose}>✕</button>
                </header>
                <p>Escolha uma opção para fazer o seu pedido:</p>
                <button onClick={onLogin}>Eu já tenho uma conta</button>
                <button onClick={onRegister}>Crie uma conta</button>
            </div>
        </div>
    );
}