import cors from 'cors';
import express from 'express';
import comentariosRouter from './routes/comentarios.js';
import eventosRouter from './routes/eventos.js';
import { seedDemoData } from './store.js';

export const createApp = () => {
  seedDemoData();

  const app = express();

  app.use(cors());
  app.use(express.json());

  app.get('/health', (_request, response) => {
    response.json({ status: 'ok' });
  });

  app.use('/api/v1/eventos', eventosRouter);
  app.use('/api/v1/comentarios', comentariosRouter);

  app.use((_request, response) => {
    response.status(404).json({ error: 'Ruta no encontrada' });
  });

  return app;
};
