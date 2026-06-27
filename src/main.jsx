import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './presentation/styles/global/index.css';
import App from './App';

async function startApp() {
  // Habilitando o MSW tanto em dev quanto em produção para que o projeto funcione no Vercel sem backend real
  const { worker } = await import('./infrastructure/mocks/browser');
  await worker.start({ 
    onUnhandledRequest: 'bypass',
    serviceWorker: {
      url: '/mockServiceWorker.js' // Garante que o caminho esteja correto
    }
  });

  createRoot(document.getElementById('root')).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
}

startApp();
