import './LgpdConsent.css';

export default function LgpdConsent({ onAccept }) {
    return (
        <div className="lgpd-overlay">
            <h1>Raízes do Nordeste</h1>
            <div className="lgpd-modal">
                <h2>Privacidade e Cookies</h2>
                <p>
                    A Raízes do Nordeste utiliza cookies para melhorar sua experiência.
                    Seus dados pessoais são protegidos conforme a LGPD.
                </p>
                <button onClick={onAccept}>Aceitar e Continuar</button>
                <a href="/politica-privacidade">Ler política completa</a>
            </div>
        </div>
    );
}