import type { Request as ExRequest } from 'express-serve-static-core';
import type { Response, NextFunction } from 'express';
import { verifyJwt, JWT_SECRET } from '../utils/auth.js';
import { RolUsuario } from '@prisma/client';

export interface AuthenticatedRequest extends ExRequest {
  user?: {
    id: string;
    email: string;
    rol: RolUsuario;
  };
}

/**
 * Middleware para validar el token JWT y autenticar la petición.
 */
export function requireAuth(req: ExRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'No autorizado. Token no proporcionado.' });
    return;
  }

  const token = authHeader.split(' ')[1];
  const payload = verifyJwt(token, JWT_SECRET);

  if (!payload) {
    res.status(401).json({ error: 'No autorizado. Token inválido o expirado.' });
    return;
  }

  // Adjuntamos la información del usuario al request
  (req as any).user = {
    id: payload.id,
    email: payload.email,
    rol: payload.rol as RolUsuario,
  };

  next();
}

/**
 * Middleware que procesa el token JWT si está presente, pero no bloquea la petición
 * si no hay token o es inválido (permitiendo acceso a usuarios invitados).
 */
export function optionalAuth(req: ExRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    next();
    return;
  }

  const token = authHeader.split(' ')[1];
  const payload = verifyJwt(token, JWT_SECRET);

  if (payload) {
    (req as any).user = {
      id: payload.id,
      email: payload.email,
      rol: payload.rol as RolUsuario,
    };
  }

  next();
}

/**
 * Middleware para restringir acceso a ciertos roles.
 * Debe ejecutarse después de requireAuth.
 *
 * @param roles Roles permitidos
 */
export function requireRole(roles: RolUsuario[]) {
  return (req: ExRequest, res: Response, next: NextFunction): void => {
    const user = (req as any).user;

    if (!user) {
      res.status(401).json({ error: 'No autorizado. Se requiere autenticación.' });
      return;
    }

    if (!roles.includes(user.rol)) {
      res.status(403).json({ error: 'Prohibido. No tiene permisos suficientes.' });
      return;
    }

    next();
  };
}
