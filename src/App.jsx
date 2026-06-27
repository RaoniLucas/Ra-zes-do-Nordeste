
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider, useAuth } from './presentation/contexts/AuthContext';
import { CartProvider } from './presentation/contexts/CartContext';
import { UnitProvider } from './presentation/contexts/UnitContext';
import { NotificationsProvider } from './presentation/contexts/NotificationsContext';
import { LocationProvider } from './presentation/contexts/LocationContext';
import './presentation/styles/global/App.css';
import HomePage from './presentation/pages/home/HomePage';

function AppWithAuth() {
  const { user, token } = useAuth();
  return (
    <NotificationsProvider userId={user?.id} token={token}>
      <LocationProvider>
        <UnitProvider>
          <CartProvider>
            <HomePage />
          </CartProvider>
        </UnitProvider>
      </LocationProvider>
    </NotificationsProvider>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppWithAuth />
      </AuthProvider>
    </BrowserRouter>
  );
}