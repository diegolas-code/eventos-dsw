/**
 * Router de Perfiles de Entidad.
 * Maneja la lógica para perfiles de Artistas y Lugares
 */
import { Router } from 'express';
import type { Request as ExRequest } from 'express-serve-static-core';
import type { Response as ExpressResponse } from 'express';
import { TipoEntidad, PrismaClient } from '@prisma/client';
import type { CreatePerfilEntidadInput } from '../dtos.js';
import { CreatePerfilEntidad, getPerfilByUsuario } from '../store.js';
import { requireAuth, type AuthenticatedRequest } from '../middleware/auth.js';

const prisma = new PrismaClient();

type Req = ExRequest<any, any, any>;
type ReqPostPerfil = ExRequest<any, any, CreatePerfilEntidadInput>;

const router = Router();

/** GET api/v1/perfiles/usuario/:usuarioId - Obtener perfil por ID de usuario */
router.get('/usuario/:usuarioId', async (request: Req, response: ExpressResponse) => {
  try {
    const perfil = await getPerfilByUsuario(request.params.usuarioId);
    if (!perfil) {
      return response.status(404).json({ error: 'El usuario no tiene perfil de entidad creado' });
    }
    response.json({ data: perfil });
  } catch {
    response.status(500).json({ error: 'Error al obtener el perfil' });
  }
});

/** POST /api/v1/perfiles - Crear un perfil de entidad */
router.post('/', requireAuth, async (request: ReqPostPerfil, response: ExpressResponse) => {
  try {
    const authUser = (request as any).user;
    const { nombre, tipo } = request.body ?? ({} as CreatePerfilEntidadInput);

    if (
      typeof nombre !== 'string' ||
      nombre.trim().length === 0 ||
      !Object.values(TipoEntidad).includes(tipo)
    ) {
      response.status(400).json({ error: 'nombre y tipo (ARTISTA o LUGAR) son obligatorios' });
      return;
    }

    const nuevoPerfil = await CreatePerfilEntidad({
      ...request.body,
      usuarioId: authUser.id,
    });
    response.status(201).json({ data: nuevoPerfil });
  } catch {
    response.status(500).json({ error: 'Error al crear perfil' });
  }
});

/**
 * POST /api/v1/perfiles/:id/reclamar - Flujo de reclamo de perfil
 */
router.post('/:id/reclamar', requireAuth, async (request: Req, response: ExpressResponse) => {
  try {
    const { id } = request.params;
    const authReq = request as unknown as AuthenticatedRequest;
    const usuarioId = authReq.user?.id;

    if (!usuarioId) {
      return response.status(401).json({ success: false, error: 'Usuario no identificado' });
    }

    const perfilExistente = await prisma.perfilEntidad.findUnique({ where: { id } });
    if (!perfilExistente || perfilExistente.reclamado) {
      return response.status(404).json({
        success: false,
        message: 'El perfil no existe o ya fue reclamado',
      });
    }

    const perfilReclamado = await prisma.perfilEntidad.update({
      where: { id },
      data: {
        usuario_id: usuarioId,
        reclamado: true,
      },
    });

    response.json({ data: perfilReclamado });
  } catch {
    response.status(500).json({ success: false, error: 'Error al procesar el reclamo' });
  }
});

/** PATCH /api/v1/perfiles/:id - Editar los datos del perfil de entidad */
router.patch('/:id', requireAuth, async (request: Req, response: ExpressResponse) => {
  try {
    const { id } = request.params;
    const body = request.body ?? {};

    const authRequest = request as unknown as AuthenticatedRequest;
    const usuarioId = authRequest.user?.id;

    const perfil = await prisma.perfilEntidad.findUnique({ where: { id } });

    if (!perfil) {
      return response.status(404).json({ error: 'Perfil no encontrado' });
    }

    if (perfil.usuario_id !== usuarioId) {
      return response.status(403).json({ error: 'No tenes permisos para editar este perfil' });
    }

    const perfilActualizado = await prisma.perfilEntidad.update({
      where: { id },
      data: {
        nombre: body.nombre,
        descripcion: body.descripcion,
        direccion: body.direccion,
        gmaps_url: body.gmapsUrl,
        imagen_url: body.imagenUrl,
      },
    });

    response.json({ data: perfilActualizado });
  } catch {
    response.status(500).json({ error: 'Error al actualizar el perfil' });
  }
});

export default router;
