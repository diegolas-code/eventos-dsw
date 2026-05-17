import { Router } from 'express';
import { deleteComentario, updateComentario } from '../store.js';

const router = Router();

router.patch('/:id', (request, response) => {
  const { cuerpo } = request.body ?? {};

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

router.delete('/:id', (request, response) => {
  const deleted = deleteComentario(request.params.id);

  if (!deleted) {
    response.status(404).json({ error: 'Comentario no encontrado' });
    return;
  }

  response.status(204).send();
});

export default router;
