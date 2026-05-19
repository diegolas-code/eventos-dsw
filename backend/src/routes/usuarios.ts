/**
 * Router de Usuarios
 * Define los endpoint para el CRUD básico de perfiles de usuario.
 */
import { Router } from 'express';
import type { Request as ExRequest } from 'express-serve-static-core';
import type { Response as ExpressResponse } from 'express';
import type { CreateUsuarioInput, PatchUsuarioInput } from '../dtos.js';
import { listUsuarios, getUsuario, createUsuario, updateUsuario, deleteUsuario } from '../store.js';

// Tipado básico para las peticiones de la API
type Req = ExRequest<any, any, any>;
type ReqPostUsuario = ExRequest<any, any, CreateUsuarioInput>;
type ReqPatchUsuario = ExRequest<{ id: string }, any, PatchUsuarioInput>;

const router = Router();

/**
 * GET /api/v1/usuarios
 * Retorna la lista de todos los usuarios registrados.
 */
router.get('/', async (_request: Req, response: ExpressResponse) => {
  const usuarios = await listUsuarios();
  response.json({ data: usuarios });
});

/**
 * GET /api/v1/usuarios/:id
 * Obtiene el detalle de un usuario específico por su ID.
 */
router.get('/:id', async (request: Req, response: ExpressResponse) => {
  const usuario = await getUsuario(request.params.id);
  if (!usuario) {
    response.status(404).json({ error: 'Usuario no encontrado' });
    return;
  }
  response.json({ data: usuario });
});

/** POST /api/v1/usuarios - Crear/Registrar */
router.post('/', async (request: ReqPostUsuario, response: ExpressResponse) => {
  const { email, nombreMostrar, rol } = request.body ?? ({} as CreateUsuarioInput);
  if (
    typeof email !== 'string' ||
    email.trim().length === 0 ||
    typeof nombreMostrar !== 'string' ||
    nombreMostrar.trim().length === 0
  ) {
    response.status(400).json({ error: 'Email y nombreMostrar son obligatorios.' });
    return;
  }
  const nuevoUsuario = await createUsuario({
    email,
    nombreMostrar,
    rol: typeof rol === 'string' ? rol : undefined,
  });

  response.status(201).json({ data: nuevoUsuario });
});

/** PATCH /api/v1/usuarios/:id - Modificar perfil */
router.patch('/:id', async (request: ReqPatchUsuario, response: ExpressResponse) => {
  const usuarioActualizado = await updateUsuario(request.params.id, request.body);
  if (!usuarioActualizado) {
    response.status(404).json({ error: 'Usuario no encontrado o error al actualizar' });
    return;
  }
  response.json({ data: usuarioActualizado });
});

/** DELETE /api/v1/usuarios/:id - Borrar usuario */
router.delete('/:id', async (request: Req, response: ExpressResponse) => {
  const exito = await deleteUsuario(request.params.id);
  if (!exito) {
    response.status(404).json({ error: 'Usuario no encontrado ' });
    return;
  }
  response.json({ message: 'Usuario eliminado correctamente' });
});

export default router;
