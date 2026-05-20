/**
 * Router de Perfiles de Entidad.
 * Maneja la lógica para perfiles de Artistas y Lugares
 */
import { Router } from 'express';
import type { Request as ExRequest } from 'express-serve-static-core';
import type { Response as ExpressResponse } from 'express';
import type { CreatePerfilEntidadInput } from '../dtos.js';
import { CreatePerfilEntidad, getPerfilByUsuario } from '../store.js';

type Req = ExRequest<any, any, any>;
type ReqPostPerfil = ExRequest<any, any, CreatePerfilEntidadInput>;

const router = Router();

/** GET api/v1/perfiles/usuario/:usuarioId - Obtener perfil por ID de usuario */
router.get('/usuario/:usuarioId', async (request: Req, response: ExpressResponse) => {
  const perfil = await getPerfilByUsuario(request.params.usuarioId);
  if (!perfil) {
    response.status(404).json({ error: 'El usuario no tiene perfil de entidad creado' });
    return;
  }
  response.json({ data: perfil });
});

/** POST /api/v1/perfiles - Crear un perfil de entidad */
router.post('/', async (request: ReqPostPerfil, response: ExpressResponse) => {
  const { usuarioId, nombre, tipo } = request.body ?? ({} as CreatePerfilEntidadInput);

  if (
    typeof usuarioId !== 'string' ||
    usuarioId.trim().length === 0 ||
    typeof nombre !== 'string' ||
    nombre.trim().length === 0 ||
    typeof tipo !== 'string' ||
    (tipo !== 'artista' && tipo !== 'lugar')
  ) {
    response.status(404).json({ error: 'usuarioId, nombre y tipo son obligatorios' });
    return;
  }

  const nuevoPerfil = await CreatePerfilEntidad(request.body);
  response.status(201).json({ data: nuevoPerfil });
});

export default router;
