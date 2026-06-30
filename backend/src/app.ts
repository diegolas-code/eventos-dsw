import cors from 'cors';
import express from 'express';
import type { Request, Response } from 'express';
import comentariosRouter from './routes/comentarios.js';
import eventosRouter from './routes/eventos.js';
import usuariosRouter from './routes/usuarios.js';
import perfilesRouter from './routes/perfiles.js';
import authRouter from './routes/auth.js';
import moderacionRouter from './routes/moderacion.js';
import { seedDemoData } from './store.js';
import asistenciasRouter from './routes/asistencia.js';

export const createApp = () => {
  // Inicializamos datos de prueba de forma asíncrona (no bloqueamos el arranque)
  seedDemoData().catch(err => console.error('❌ Error al sembrar datos:', err));

  const app = express();

  app.use(cors());
  app.use(express.json());

  app.get('/', (_request: Request, response: Response) => {
    // Devuelve JSON con estado y endpoints útiles para integraciones y monitoreo
    response.json({
      status: 'ok',
      endpoints: ['/api/v1/eventos', '/api/v1/comentarios', '/health'],
    });
  });

  app.get('/health', (_request: Request, response: Response) => {
    response.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  app.use('/api/v1/eventos', eventosRouter);
  app.use('/api/v1/comentarios', comentariosRouter);
  app.use('/api/v1/usuarios', usuariosRouter);
  app.use('/api/v1/perfiles', perfilesRouter);
  app.use('/api/v1/auth', authRouter);
  app.use('/api/v1/moderacion', moderacionRouter);
  app.use('/api/v1/asistencias', asistenciasRouter);

  app.use((_request: Request, response: Response) => {
    response.status(404).json({ error: 'La ruta solicitada no existe' });
  });

  return app;
};
