import cors from 'cors';
import express from 'express';
import type { Request, Response } from 'express';
import comentariosRouter from './routes/comentarios.js';
import eventosRouter from './routes/eventos.js';
import { seedDemoData } from './store.js';

export const createApp = () => {
  seedDemoData();

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
    response.json({ status: 'ok' });
  });

  app.use('/api/v1/eventos', eventosRouter);
  app.use('/api/v1/comentarios', comentariosRouter);

  app.use((_request: Request, response: Response) => {
    response.status(404).json({ error: 'Ruta no encontrada' });
  });

  return app;
};
