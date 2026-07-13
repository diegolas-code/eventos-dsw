import { Router } from 'express';
import type { Request, Response } from 'express';
import { PrismaClient, EstadoEvento, TipoAccionModeracion } from '@prisma/client';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();
const prisma = new PrismaClient();

// GET /api/v1/moderacion/pendientes
router.get(
  '/pendientes',
  requireAuth,
  requireRole(['moderador', 'admin']),
  async (req: Request, res: Response) => {
    try {
      const pendientes = await prisma.evento.findMany({
  where: {
    estado: EstadoEvento.PENDIENTE,
  },
  include: {
    lugar: true,
    artistas: {
      include: {
        artista: true,
      },
    },
    imagenes: true,
  },
});
const data = pendientes.map(e => ({
  id: e.id,
  titulo: e.titulo,
  descripcion: e.descripcion,
  iniciaEn: e.inicia_en.toISOString(),
  terminaEn: e.termina_en?.toISOString() ?? null,
  imagenUrl: e.imagen_url,
  lugar: e.lugar_manual,
  creadoPorUsuarioId: e.creado_por_usuario_id,
  imagenes: e.imagenes,
}));

res.json({ data });
    } catch (err) {
      console.error('Error al listar eventos pendientes:', err);
      res.status(500).json({ error: 'Error al listar eventos pendientes' });
    }
  }
);

// POST /api/v1/moderacion/acciones
router.post(
  '/acciones',
  requireAuth,
  requireRole(['moderador', 'admin']),
  async (req: Request, res: Response) => {
    const { eventoId, accion, nota } = (req.body ?? {}) as {
      eventoId?: string;
      accion?: string;
      nota?: string;
    };
    const user = (req as any).user;

    if (!eventoId || !accion) {
      res.status(400).json({ error: 'eventoId y accion son obligatorios.' });
      return;
    }

    if (accion !== 'APROBAR' && accion !== 'RECHAZAR' && accion !== 'ARCHIVAR') {
      res.status(400).json({ error: 'Accion inválida. Debe ser APROBAR, RECHAZAR o ARCHIVAR.' });
      return;
    }

    const nuevoEstado: EstadoEvento =
      accion === 'APROBAR'
        ? EstadoEvento.PUBLICADO
        : accion === 'RECHAZAR'
          ? EstadoEvento.RECHAZADO
          : EstadoEvento.ARCHIVADO;

    const tipoAccion: TipoAccionModeracion =
      accion === 'APROBAR'
        ? TipoAccionModeracion.APROBAR
        : accion === 'RECHAZAR'
          ? TipoAccionModeracion.RECHAZAR
          : TipoAccionModeracion.ARCHIVAR;

    try {
      await prisma.$transaction(async tx => {
        // 1. Update event state
        await tx.evento.update({
          where: { id: eventoId },
          data: { estado: nuevoEstado },
        });

        // 2. Record audit log
        await tx.accionModeracion.create({
          data: {
            evento_id: eventoId,
            moderador_id: user.id,
            tipo_accion: tipoAccion,
            nota: typeof nota === 'string' ? nota : null,
          },
        });
      });

      res.json({ message: 'Moderación aplicada correctamente.' });
    } catch (err) {
      console.error('Error al procesar la acción de moderación:', err);
      res.status(500).json({ error: 'Error al procesar la acción de moderación.' });
    }
  }
);

export default router;
