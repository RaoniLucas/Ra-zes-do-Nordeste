import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './presentation/styles/global/index.css';
import App from './App';

async function startApp() {
  if (import.meta.env.DEV) {
    const { worker } = await import('./infrastructure/mocks/browser');
    await worker.start({ onUnhandledRequest: 'bypass' });
  }

  createRoot(document.getElementById('root')).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
}

startApp();