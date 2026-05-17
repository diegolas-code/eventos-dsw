/**
 * Router de Eventos.
 * Define los endpoints para el CRUD de eventos y la gestión de sus comentarios.
 */
import { Router } from 'express';
import type { Request as ExRequest } from 'express-serve-static-core';
import type { Response as ExpressResponse } from 'express';
import type { CreateEventoInput, CreateComentarioInput } from '../dtos.js';

// Alias para facilitar el tipado de Express con nuestros DTOs
type Req = ExRequest<any, any, any>;
type ReqCreateEvento = ExRequest<Record<string, any>, any, CreateEventoInput>;
type ReqCreateComentario = ExRequest<{ id: string }, any, CreateComentarioInput>;

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

/**
 * GET /api/v1/eventos
 * Retorna la lista de todos los eventos.
 */
router.get('/', (_request: Req, response: ExpressResponse) => {
  response.json({ data: listEventos() });
});

/**
 * POST /api/v1/eventos
 * Crea un nuevo evento. Valida campos obligatorios básicos.
 */
router.post('/', (request: ReqCreateEvento, response: ExpressResponse) => {
  const { titulo, descripcion, iniciaEn, terminaEn, entidadLugarId, creadoPorUsuarioId } =
    request.body ?? ({} as CreateEventoInput);

  // Validación básica manual (en el futuro podemos usar Zod o Joi)
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

/**
 * GET /api/v1/eventos/:id
 * Obtiene el detalle de un evento por su ID.
 */
router.get('/:id', (request: Req, response: ExpressResponse) => {
  const evento = getEvento(request.params.id);

  if (!evento) {
    response.status(404).json({ error: 'Evento no encontrado' });
    return;
  }

  response.json({ data: evento });
});

/**
 * PATCH /api/v1/eventos/:id
 * Actualización parcial de un evento.
 */
router.patch('/:id', (request: Req, response: ExpressResponse) => {
  const patch = updateEvento(request.params.id, request.body ?? {});

  if (!patch) {
    response.status(404).json({ error: 'Evento no encontrado' });
    return;
  }

  response.json({ data: patch });
});

/**
 * DELETE /api/v1/eventos/:id
 * Elimina un evento.
 */
router.delete('/:id', (request: Req, response: ExpressResponse) => {
  const deleted = deleteEvento(request.params.id);

  if (!deleted) {
    response.status(404).json({ error: 'Evento no encontrado' });
    return;
  }

  response.status(204).send();
});

// --- SUB-RECURSO: COMENTARIOS ---

/**
 * GET /api/v1/eventos/:id/comentarios
 * Lista los comentarios de un evento específico.
 */
router.get('/:id/comentarios', (request: Req, response: ExpressResponse) => {
  response.json({ data: listComentariosByEvento(request.params.id) });
});

/**
 * POST /api/v1/eventos/:id/comentarios
 * Crea un comentario vinculado a un evento.
 */
router.post('/:id/comentarios', (request: ReqCreateComentario, response: ExpressResponse) => {
  const { cuerpo, usuarioId, padreId } = request.body ?? ({} as CreateComentarioInput);

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
