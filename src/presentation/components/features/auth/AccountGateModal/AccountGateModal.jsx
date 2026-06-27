import './AccountGateModal.css';

export default function AccountGateModal({ onLogin, onRegister, onClose }) {
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal animate-in" onClick={(e) => e.stopPropagation()}>
                <header className="modal-header">
                    <h2>Sign in to continue</h2>
                    <button className="btn-close" onClick={onClose}>✕</button>
                </header>
                <p>Choose an option to place your order:</p>
                <button onClick={onLogin}>I already have an account</button>
                <button onClick={onRegister}>Create an account</button>
            </div>
        </div>
    );
}