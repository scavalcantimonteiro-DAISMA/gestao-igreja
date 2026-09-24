import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Registra e gerencia Service Worker para suporte PWA com Auto-Update transparente
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        // Verifica atualizações imediatamente ao abrir o app
        registration.update();

        // Checagem periódica em segundo plano (a cada 15 min)
        setInterval(() => {
          registration.update();
        }, 15 * 60 * 1000);

        // Se o usuário alternar para o app ou voltar à aba, verifica imediatamente
        document.addEventListener('visibilitychange', () => {
          if (document.visibilityState === 'visible') {
            registration.update();
          }
        });
      })
      .catch((err) => {
        console.log('SW registration note:', err);
      });

    // Quando uma nova versão do Service Worker for ativada (skipWaiting/clients.claim),
    // a página é atualizada suavemente sem necessidade de desinstalar/reinstalar o PWA
    let refreshing = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!refreshing) {
        refreshing = true;
        window.location.reload();
      }
    });
  });
}
