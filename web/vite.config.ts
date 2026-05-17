/**
 * Configuración de Vite.
 * Vite es la herramienta que compila y sirve nuestro Frontend rápidamente.
 */
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173, // Puerto por defecto del Frontend
    proxy: {
      /**
       * Configuración del Proxy:
       * Todas las peticiones que empiecen por /api serán redirigidas al Backend (puerto 3001).
       * Esto evita problemas de CORS y facilita el desarrollo.
       */
      '/api': 'http://localhost:3001',
    },
  },
});
