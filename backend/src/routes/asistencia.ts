import { Router } from 'express';
import type { Response } from 'express';
import type { Request as ExRequest } from 'express-serve-static-core';

import { requireAuth } from '../middleware/auth.js';

import { asistirEvento, cancelarAsistencia, obtenerEventosAsistire } from '../store.js';

const router = Router();

interface AuthRequest extends ExRequest {
  user?: {
    id: string;
    email: string;
    rol: string;
  };
}

/*
 * POST /api/v1/asistencias/:eventoId
 * Marca asistencia al evento.
 */
router.post('/:eventoId', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const usuarioId = req.user!.id;
    const eventoId = req.params.eventoId;

    if (Array.isArray(eventoId)) {
      return res.status(400).json({ error: 'eventoId inválido' });
    }

    const asistencia = await asistirEvento(usuarioId, eventoId);

    res.status(201).json({
      data: asistencia,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: 'Error registrando asistencia',
    });
  }
});

/*
 * DELETE /api/v1/asistencias/:eventoId
 * Cancela asistencia.
 */
router.delete('/:eventoId', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const usuarioId = req.user!.id;
    const eventoId = Array.isArray(req.params.eventoId)
      ? req.params.eventoId[0]
      : req.params.eventoId;

    await cancelarAsistencia(usuarioId, eventoId);
    res.json({
      message: 'Asistencia cancelada correctamente',
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: 'Error cancelando asistencia',
    });
  }
});

/*
 * GET /api/v1/asistencias/mis-eventos
 * Obtiene los eventos a los que asistirá el usuario.
 */
router.get('/mis-eventos', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const usuarioId = req.user!.id;

    const eventos = await obtenerEventosAsistire(usuarioId);

    res.json({
      data: eventos,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: 'Error obteniendo eventos',
    });
  }
});

export default router;
