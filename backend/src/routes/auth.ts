import { Router } from 'express';
import type { Response as ExpressResponse } from 'express';
import type { Request as ExRequest } from 'express-serve-static-core';
import { PrismaClient } from '@prisma/client';
import { hashPassword, comparePassword, signJwt } from '../utils/auth.js';

const router = Router();
const prisma = new PrismaClient();

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-change-me';
const JWT_EXPIRES_IN = 7 * 24 * 60 * 60; // 7 días en segundos

interface RegisterBody {
  email?: string;
  password?: string;
  nombreMostrar?: string;
}

interface LoginBody {
  email?: string;
  password?: string;
}

type ReqRegister = ExRequest<any, any, RegisterBody>;
type ReqLogin = ExRequest<any, any, LoginBody>;

/**
 * POST /api/v1/auth/register
 * Registra un nuevo usuario con credenciales locales.
 */
router.post('/register', async (req: ReqRegister, res: ExpressResponse) => {
  const { email, password, nombreMostrar } = req.body ?? {};

  if (!email || !password || !nombreMostrar) {
    res.status(400).json({ error: 'Email, password y nombreMostrar son obligatorios.' });
    return;
  }

  try {
    const usuarioExistente = await prisma.usuario.findUnique({ where: { email } });
    if (usuarioExistente) {
      res.status(400).json({ error: 'El email ya está registrado.' });
      return;
    }

    const hashedPassword = await hashPassword(password);

    // Usamos casting a 'any' en el modelo para permitir compilar
    // antes de que se integre el cambio del esquema de Prisma (contrasena_hash)
    const nuevoUsuario = await (prisma.usuario as any).create({
      data: {
        email,
        contrasena_hash: hashedPassword,
        nombre_mostrar: nombreMostrar,
      },
    });

    const token = signJwt(
      { id: nuevoUsuario.id, email: nuevoUsuario.email, rol: nuevoUsuario.rol },
      JWT_SECRET,
      JWT_EXPIRES_IN
    );

    res.status(201).json({
      data: {
        user: {
          id: nuevoUsuario.id,
          email: nuevoUsuario.email,
          nombreMostrar: nuevoUsuario.nombre_mostrar,
          rol: nuevoUsuario.rol,
        },
        token,
      },
    });
  } catch (error) {
    console.error('Error en el registro:', error);
    res.status(500).json({ error: 'Error interno al registrar el usuario.' });
  }
});

/**
 * POST /api/v1/auth/login
 * Autentica credenciales y emite un token JWT.
 */
router.post('/login', async (req: ReqLogin, res: ExpressResponse) => {
  const { email, password } = req.body ?? {};

  if (!email || !password) {
    res.status(400).json({ error: 'Email y password son obligatorios.' });
    return;
  }

  try {
    const usuario = await prisma.usuario.findUnique({ where: { email } });
    if (!usuario) {
      res.status(401).json({ error: 'Credenciales inválidas.' });
      return;
    }

    const contrasenaHash = (usuario as any).contrasena_hash;
    if (!contrasenaHash) {
      res.status(401).json({
        error: 'El usuario no tiene una contraseña establecida en la base de datos.',
      });
      return;
    }

    const passwordMatch = await comparePassword(password, contrasenaHash);
    if (!passwordMatch) {
      res.status(401).json({ error: 'Credenciales inválidas.' });
      return;
    }

    const token = signJwt(
      { id: usuario.id, email: usuario.email, rol: usuario.rol },
      JWT_SECRET,
      JWT_EXPIRES_IN
    );

    res.json({
      data: {
        user: {
          id: usuario.id,
          email: usuario.email,
          nombreMostrar: usuario.nombre_mostrar,
          rol: usuario.rol,
        },
        token,
      },
    });
  } catch (error) {
    console.error('Error en el login:', error);
    res.status(500).json({ error: 'Error interno en el inicio de sesión.' });
  }
});

export default router;
