/**
 * Punto de entrada principal de la aplicación Frontend (React).
 * Aquí se inicializa el DOM de React y se monta el componente raíz <App />.
 */
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

// Importación de estilos globales básicos
import './styles.css';

/**
 * Buscamos el elemento 'root' en el index.html y renderizamos nuestra aplicación.
 * El uso de <React.StrictMode> ayuda a identificar problemas potenciales durante el desarrollo.
 */
createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
