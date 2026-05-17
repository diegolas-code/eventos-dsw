/**
 * Punto de entrada principal para el servidor del Backend.
 * Aquí configuramos el puerto y ponemos en marcha la aplicación Express.
 */
import { createApp } from './app.js';

// Definimos el puerto: buscamos en variables de entorno (útil para despliegue en Render/Vercel)
// o usamos el 3001 por defecto para desarrollo local (coincide con el proxy del frontend).
const port = Number.parseInt(process.env.PORT ?? '3001', 10);

// Creamos la instancia de la aplicación configurada en app.ts
const app = createApp();

// Iniciamos la escucha de peticiones HTTP
app.listen(port, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${port}`);
  console.log(`✅ Consulta el estado en http://localhost:${port}/health`);
});
