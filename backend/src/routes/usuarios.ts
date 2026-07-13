/**
 * Router de Usuarios
 * Define los endpoint para el CRUD básico de perfiles de usuario.
 */
import { Router } from 'express';
import type { Request as ExRequest } from 'express-serve-static-core';
import type { Response as ExpressResponse } from 'express';
import { RolUsuario } from '@prisma/client';
import type { CreateUsuarioInput, PatchUsuarioInput } from '../dtos.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import {
  listUsuarios,
  getUsuario,
  createUsuario,
  updateUsuario,
  deleteUsuario,
  cambiarClaveUsuario,
} from '../store.js';

// Tipado básico para las peticiones de la API
type Req = ExRequest<any, any, any>;
type ReqPostUsuario = ExRequest<any, any, CreateUsuarioInput>;
type ReqPatchUsuario = ExRequest<{ id: string }, any, PatchUsuarioInput>;

const router = Router();

/**
 * GET /api/v1/usuarios
 * Retorna la lista de todos los usuarios registrados.
 */
router.get(
  '/',
  requireAuth,
  requireRole([RolUsuario.admin]),
  async (_request: Req, response: ExpressResponse) => {
    const usuarios = await listUsuarios();
    response.json({ data: usuarios });
  }
);

/**
 * GET /api/v1/usuarios/:id
 * Obtiene el detalle de un usuario específico por su ID.
 */
router.get('/:id', requireAuth, async (request: Req, response: ExpressResponse) => {
  const authUser = (request as any).user;
  if (
    authUser.id !== request.params.id &&
    authUser.rol !== RolUsuario.admin &&
    authUser.rol !== RolUsuario.moderador
  ) {
    response.status(403).json({ error: 'Prohibido. No tienes permisos para ver este usuario.' });
    return;
  }
  const usuario = await getUsuario(request.params.id);
  if (!usuario) {
    response.status(404).json({ error: 'Usuario no encontrado' });
    return;
  }
  response.json({ data: usuario });
});

/** POST /api/v1/usuarios - Crear/Registrar */
router.post(
  '/',
  requireAuth,
  requireRole([RolUsuario.admin]),
  async (request: ReqPostUsuario, response: ExpressResponse) => {
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

    // Validación estricta del Enum de Roles
    if (rol && !Object.values(RolUsuario).includes(rol)) {
      response.status(400).json({ error: 'El rol proporcionado no es válido.' });
      return;
    }

    const nuevoUsuario = await createUsuario({
      email,
      nombreMostrar,
      rol: rol ?? RolUsuario.miembro,
    });

    response.status(201).json({ data: nuevoUsuario });
  }
);

/** PATCH /api/v1/usuarios/:id - Modificar perfil */
router.patch('/:id', requireAuth, async (request: ReqPatchUsuario, response: ExpressResponse) => {
  const authUser = (request as any).user;
  if (authUser.id !== request.params.id && authUser.rol !== RolUsuario.admin) {
    response
      .status(403)
      .json({ error: 'Prohibido. No tienes permisos para actualizar este usuario.' });
    return;
  }
  const usuarioActualizado = await updateUsuario(request.params.id, request.body);
  if (!usuarioActualizado) {
    response.status(404).json({ error: 'Usuario no encontrado o error al actualizar' });
    return;
  }
  response.json({ data: usuarioActualizado });
});

/** DELETE /api/v1/usuarios/:id - Borrar usuario */
router.delete('/:id', requireAuth, async (request: Req, response: ExpressResponse) => {
  const authUser = (request as any).user;
  if (authUser.id !== request.params.id && authUser.rol !== RolUsuario.admin) {
    response
      .status(403)
      .json({ error: 'Prohibido. No tienes permisos para eliminar este usuario.' });
    return;
  }
  const exito = await deleteUsuario(request.params.id);
  if (!exito) {
    response.status(404).json({ error: 'Usuario no encontrado ' });
    return;
  }
  response.json({ message: 'Usuario eliminado correctamente' });
});

/** POST /api/v1/usuarios/:id/cambiar-clave - Cambiar contraseña del usuario */
router.post('/:id/cambiar-clave', requireAuth, async (request: Req, response: ExpressResponse) => {
  const { id } = request.params;
  const { claveActual, nuevaClave } = request.body ?? {};

  // Validar que el usuario autenticado sólo pueda cambiarse la clave a sí mismo
  const authUser = (request as any).user;
  if (authUser.id !== id) {
    response.status(403).json({ error: 'Prohibido. No podés cambiar la clave de otro usuario.' });
    return;
  }

  if (!claveActual || !nuevaClave) {
    response.status(400).json({ error: 'La clave actual y la nueva clave son obligatorias.' });
    return;
  }

  if (nuevaClave.length < 6) {
    response.status(400).json({ error: 'La nueva clave debe tener al menos 6 caracteres.' });
    return;
  }

  try {
    const exito = await cambiarClaveUsuario(id, claveActual, nuevaClave);
    if (!exito) {
      response.status(400).json({ error: 'La clave actual ingresada es incorrecta.' });
      return;
    }
    response.json({ message: 'Contraseña actualizada correctamente.' });
  } catch (error) {
    console.error('Error en endpoint cambiar-clave:', error);
    response
      .status(500)
      .json({ error: 'Error interno del servidor al procesar la actualización.' });
  }
});

export default router;
