import './AppModeModal.css';

export default function AppModeModal({ onSelectUserApp, onSelectTotem }) {
    return (
        <div className="modal-overlay">
            <div className="modal animate-in">
                <h2>Como vai usar hoje?</h2>
                <button onClick={onSelectUserApp}>App (Mobile/PC)</button>
                <button onClick={onSelectTotem}>Totem (Loja Física)</button>
            </div>
        </div>
    );
}