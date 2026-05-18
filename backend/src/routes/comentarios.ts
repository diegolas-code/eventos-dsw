/**
 * Router de Comentarios (Independiente).
 * Se encarga de acciones directas sobre comentarios existentes (editar, borrar).
 */
import { Router } from 'express';
import type { Request as ExRequest } from 'express-serve-static-core';
import type { Response as ExpressResponse } from 'express';
import type { PatchComentarioInput } from '../dtos.js';

// Tipado para peticiones que modifican comentarios
type Req = ExRequest<any, any, any>;
type ReqPatchComentario = ExRequest<{ id: string }, any, PatchComentarioInput>;

import { deleteComentario, updateComentario, getComentario } from '../store.js';

const router = Router();

/**
 * GET /api/v1/comentarios/:id
 * Obtiene un comentario específico por su ID.
 */
router.get('/:id', async (request: Req, response: ExpressResponse) => {
  const comentario = await getComentario(request.params.id);

  if (!comentario) {
    response.status(404).json({ error: 'Comentario no encontrado' });
    return;
  }

  response.json({ data: comentario });
});

/**
 * PATCH /api/v1/comentarios/:id
 * Permite editar el texto de un comentario.
 */
router.patch('/:id', async (request: ReqPatchComentario, response: ExpressResponse) => {
  const { cuerpo } = request.body ?? ({} as PatchComentarioInput);

  // Validación: el cuerpo no puede estar vacío
  if (typeof cuerpo !== 'string' || cuerpo.trim().length === 0) {
    response.status(400).json({ error: 'cuerpo es obligatorio' });
    return;
  }

  const comentario = await updateComentario(request.params.id, cuerpo);

  if (!comentario) {
    response.status(404).json({ error: 'Comentario no encontrado' });
    return;
  }

  response.json({ data: comentario });
});

/**
 * DELETE /api/v1/comentarios/:id
 * Elimina un comentario por su ID.
 */
router.delete('/:id', async (request: Req, response: ExpressResponse) => {
  const deleted = await deleteComentario(request.params.id);

  if (!deleted) {
    response.status(404).json({ error: 'Comentario no encontrado' });
    return;
  }

  response.status(204).send();
});

export default router;
