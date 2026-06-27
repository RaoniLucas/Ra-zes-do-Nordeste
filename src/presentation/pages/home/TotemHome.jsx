import PromoSection from '../sections/PromoSection';
import CatalogSection from '../sections/CatalogSection';
import './TotemHome.css';

export default function TotemHome() {
    return (
        <>
            <header className="app-header">
                <div className="header-left">
                    <span className="logo">Raizes do Nordeste</span>
                </div>
            </header>

            <main className="snap-container">
                <PromoSection isTotem={true} />
                <CatalogSection userLocation={null} isTotem={true} />
            </main>
        </>
    );
}