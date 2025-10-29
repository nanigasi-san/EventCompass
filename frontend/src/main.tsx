import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { DataProvider } from './state/DataProvider';
import './styles.css';

const root = document.getElementById('root');

if (!root) {
  throw new Error('root ノードが見つかりません');
}

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <DataProvider>
      <App />
    </DataProvider>
  </React.StrictMode>
);

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/service-worker.js')
      .catch((error) => console.error('Service Worker の登録に失敗しました', error));
  });
}
