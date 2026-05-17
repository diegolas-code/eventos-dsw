import { Router } from 'express';
import type { Request as ExRequest, Response } from 'express-serve-static-core';
import type { Response as ExpressResponse } from 'express';
type Req = ExRequest<any, any, any>;
import {
  createComentario,
  createEvento,
  deleteEvento,
  getEvento,
  listComentariosByEvento,
  listEventos,
  updateEvento,
} from '../store.js';

const router = Router();

router.get('/', (_request: Request, response: Response) => {
  response.json({ data: listEventos() });
});

router.post('/', (request: Req, response: ExpressResponse) => {
  const { titulo, descripcion, iniciaEn, terminaEn, entidadLugarId, creadoPorUsuarioId } =
    request.body ?? {};

  if (typeof titulo !== 'string' || typeof iniciaEn !== 'string') {
    response.status(400).json({ error: 'titulo e iniciaEn son obligatorios' });
    return;
  }

  const evento = createEvento({
    titulo,
    descripcion: typeof descripcion === 'string' ? descripcion : undefined,
    iniciaEn,
    terminaEn: typeof terminaEn === 'string' || terminaEn === null ? terminaEn : undefined,
    entidadLugarId: typeof entidadLugarId === 'string' ? entidadLugarId : undefined,
    creadoPorUsuarioId: typeof creadoPorUsuarioId === 'string' ? creadoPorUsuarioId : undefined,
  });

  response.status(201).json({ data: evento });
});

router.get('/:id', (request: Req, response: ExpressResponse) => {
  const evento = getEvento(request.params.id);

  if (!evento) {
    response.status(404).json({ error: 'Evento no encontrado' });
    return;
  }

  response.json({ data: evento });
});

router.patch('/:id', (request: Req, response: ExpressResponse) => {
  const patch = updateEvento(request.params.id, request.body ?? {});

  if (!patch) {
    response.status(404).json({ error: 'Evento no encontrado' });
    return;
  }

  response.json({ data: patch });
});

router.delete('/:id', (request: Req, response: ExpressResponse) => {
  const deleted = deleteEvento(request.params.id);

  if (!deleted) {
    response.status(404).json({ error: 'Evento no encontrado' });
    return;
  }

  response.status(204).send();
});

router.get('/:id/comentarios', (request: Req, response: ExpressResponse) => {
  response.json({ data: listComentariosByEvento(request.params.id) });
});

router.post('/:id/comentarios', (request: Req, response: ExpressResponse) => {
  const { cuerpo, usuarioId, padreId } = request.body ?? {};

  if (typeof cuerpo !== 'string' || cuerpo.trim().length === 0) {
    response.status(400).json({ error: 'cuerpo es obligatorio' });
    return;
  }

  const comentario = createComentario(request.params.id, {
    cuerpo,
    usuarioId: typeof usuarioId === 'string' ? usuarioId : undefined,
    padreId: typeof padreId === 'string' ? padreId : undefined,
  });

  if (!comentario) {
    response.status(404).json({ error: 'Evento no encontrado' });
    return;
  }

  response.status(201).json({ data: comentario });
});

export default router;
