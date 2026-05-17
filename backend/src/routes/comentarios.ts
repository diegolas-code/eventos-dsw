import { Router } from 'express';
import type { Request as ExRequest } from 'express-serve-static-core';
import type { Response as ExpressResponse } from 'express';
import type { PatchComentarioInput } from '../dtos.js';
type Req = ExRequest<any, any, any>;
type ReqPatchComentario = ExRequest<{ id: string }, any, PatchComentarioInput>;
import { deleteComentario, updateComentario } from '../store.js';

const router = Router();

router.patch('/:id', (request: ReqPatchComentario, response: ExpressResponse) => {
  const { cuerpo } = request.body ?? ({} as PatchComentarioInput);

  if (typeof cuerpo !== 'string' || cuerpo.trim().length === 0) {
    response.status(400).json({ error: 'cuerpo es obligatorio' });
    return;
  }

  const comentario = updateComentario(request.params.id, cuerpo);

  if (!comentario) {
    response.status(404).json({ error: 'Comentario no encontrado' });
    return;
  }

  response.json({ data: comentario });
});

router.delete('/:id', (request: Req, response: ExpressResponse) => {
  const deleted = deleteComentario(request.params.id);

  if (!deleted) {
    response.status(404).json({ error: 'Comentario no encontrado' });
    return;
  }

  response.status(204).send();
});

export default router;
