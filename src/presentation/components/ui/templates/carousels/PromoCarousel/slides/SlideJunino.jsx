import bandeirolasImg from '@/assets/img/bandeirolas_sao_joao.png';
import pamonhaIcon from '@/assets/img/pamonha_icon.png';
import canjicaIcon from '@/assets/img/canjica_icon.png';
import sarapatelIcon from '@/assets/img/sarapatel_icon.png';
import quentaoIcon from '@/assets/img/quentao_icon.png';
import dishesImg from '@/assets/img/dishes.png';
import './SlideJunino.css';

const DISHES = [
    { name: 'Pamonha', icon: pamonhaIcon },
    { name: 'Canjica', icon: canjicaIcon },
    { name: 'Sarapatel', icon: sarapatelIcon },
    { name: 'Quentão', icon: quentaoIcon },
];

export default function SlideJunino({ onOpenFestivalMenu }) {
    return (
        <div className="slide-junino">
            <img className="bandeirolas-img" src={bandeirolasImg} alt="bandeirolas" />
            <img className="bandeirolas-img" src={bandeirolasImg} alt="bandeirolas" />
            <div className="slide-junino__plaque">
                <div className="slide-junino__plaque-inner">
                    <h2 className="slide-junino__title"><span>Festival Junino</span></h2>
                    <div className="slide-junino__body">
                        <ul className="slide-junino__menu">
                            {DISHES.map((dish) => (
                                <li className="slide-junino__row" key={dish.name}>
                                    <span className="slide-junino__name">{dish.name}</span>
                                    <img src={dish.icon} alt={dish.name} className="slide-junino__icon" width="50" />
                                </li>
                            ))}
                        </ul>
                        <span className="slide-junino__divider" aria-hidden="true" />
                        <div className="slide-junino__side">
                            <span className="side__title">Jantar Personalizado</span>
                            <span className="slide-junino__badge">Combo<br />Especial</span>
                            <span className="slide-junino__price">R$ 59<small>,40</small></span>
                            <img src={dishesImg} width="300" alt="pratos" />
                        </div>
                    </div>
                    <button type="button" className="slide-junino__cta" onClick={onOpenFestivalMenu}>
                        Ver Cardápio do Festival
                    </button>
                </div>
            </div>
        </div>
    );
}