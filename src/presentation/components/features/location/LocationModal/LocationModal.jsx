import { useState } from 'react';
import './LocationModal.css';

const estados = ['PE', 'BA', 'CE', 'PB'];
const cidadesPorEstado = {
    PE: ['Recife', 'Olinda', 'Jaboatao dos Guararapes', 'Caruaru', 'Petrolina'],
    BA: ['Salvador', 'Feira de Santana', 'Vitoria da Conquista'],
    CE: ['Fortaleza', 'Caucaia', 'Juazeiro do Norte'],
    PB: ['Joao Pessoa', 'Campina Grande'],
};

export default function LocationModal({ onSuccess }) {
    const [modo, setModo] = useState('escolha');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [estado, setEstado] = useState('');
    const [cidade, setCidade] = useState('');
    const [bairro, setBairro] = useState('');
    const [rua, setRua] = useState('');
    const [numero, setNumero] = useState('');

    const salvarLocalizacao = (dados) => {
        localStorage.setItem('user_location', JSON.stringify(dados));
        onSuccess(dados);
    };

    const handleAutoLocation = () => {
        setLoading(true);
        setError('');
        if (!navigator.geolocation) {
            setError('Geolocalizacao nao suportada');
            setLoading(false);
            return;
        }
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                salvarLocalizacao({
                    lat: pos.coords.latitude,
                    lng: pos.coords.longitude,
                    automatico: true,
                });
                setLoading(false);
            },
            () => {
                setError('Nao foi possivel obter localizacao. Use o modo manual.');
                setLoading(false);
                setModo('manual');
            },
            { timeout: 10000 },
        );
    };

    const handleManualSubmit = (e) => {
        e.preventDefault();
        if (!estado || !cidade || !bairro || !rua || !numero) {
            setError('Preencha todos os campos');
            return;
        }
        salvarLocalizacao({
            estado,
            cidade,
            bairro,
            rua,
            numero,
            automatico: false,
        });
    };

    if (modo === 'escolha') {
        return (
            <div className="modal-overlay">
                <div className="modal animate-in">
                    <h2>Onde voce esta?</h2>
                    <p>
                        Precisamos da sua localizacao para mostrar o cardapio disponivel
                        proximo a voce.
                    </p>
                    {error && <p className="error">{error}</p>}
                    <button onClick={handleAutoLocation} disabled={loading}>
                        {loading ? 'Buscando...' : 'Usar localizacao automatica'}
                    </button>
                    <button onClick={() => setModo('manual')}>Inserir manualmente</button>
                </div>
            </div>
        );
    }

    return (
        <div className="modal-overlay">
            <div className="modal animate-in">
                <h2>Informe seu Endereco</h2>
                <form onSubmit={handleManualSubmit}>
                    {error && <p className="error">{error}</p>}
                    <label>
                        Estado
                        <select
                            value={estado}
                            onChange={(e) => {
                                setEstado(e.target.value);
                                setCidade('');
                            }}
                        >
                            <option value="">Selecione</option>
                            {estados.map((uf) => (
                                <option key={uf} value={uf}>
                                    {uf}
                                </option>
                            ))}
                        </select>
                    </label>
                    {estado && (
                        <label>
                            Cidade
                            <select
                                value={cidade}
                                onChange={(e) => setCidade(e.target.value)}
                            >
                                <option value="">Selecione</option>
                                {(cidadesPorEstado[estado] || []).map((c) => (
                                    <option key={c} value={c}>
                                        {c}
                                    </option>
                                ))}
                            </select>
                        </label>
                    )}
                    <label>
                        Bairro{' '}
                        <input
                            value={bairro}
                            onChange={(e) => setBairro(e.target.value)}
                            placeholder="Ex: Boa Viagem"
                        />
                    </label>
                    <label>
                        Rua{' '}
                        <input
                            value={rua}
                            onChange={(e) => setRua(e.target.value)}
                            placeholder="Ex: Av. Conselheiro Agostinho"
                        />
                    </label>
                    <label>
                        Numero{' '}
                        <input
                            value={numero}
                            onChange={(e) => setNumero(e.target.value)}
                            placeholder="Ex: 123"
                        />
                    </label>
                    <button type="submit">Confirmar Localizacao</button>
                </form>
                <button onClick={() => setModo('escolha')}>Voltar</button>
            </div>
        </div>
    );
}