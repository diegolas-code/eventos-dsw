import { Router } from 'express';
import type { Response as ExpressResponse } from 'express';
import type { Request as ExRequest } from 'express-serve-static-core';
import { PrismaClient } from '@prisma/client';
import { randomUUID } from 'crypto';
import { hashPassword, comparePassword, signJwt, JWT_SECRET } from '../utils/auth.js';
import { enviarMail } from '../services/email.service.js';

const router = Router();
const prisma = new PrismaClient();

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

    const nuevoUsuario = await prisma.usuario.create({
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

    const contrasenaHash = usuario.contrasena_hash;
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

/**
 * POST /api/v1/auth/forgot-password
 * Genera un token temporal y envía el email de recuperación.
 */
router.post('/forgot-password', async (req: ExRequest, res: ExpressResponse) => {
  const { email } = req.body ?? {};
  if (!email) {
    res.status(400).json({ error: 'El email es obligatorio.' });
    return;
  }

  try {
    const usuario = await prisma.usuario.findUnique({ where: { email } });
    if (!usuario) {
      // Retornamos 200 por seguridad (no revelar existencia de emails)
      res.json({
        message: 'Si el correo está registrado, recibirás un enlace de recuperación.',
      });
      return;
    }

    const token = randomUUID();
    const expira = new Date();
    expira.setHours(expira.getHours() + 1); // 1 hora de vigencia

    await prisma.usuario.update({
      where: { id: usuario.id },
      data: {
        token_recuperacion: token,
        token_recuperacion_expira: expira,
      },
    });

    // Fallback seguro en consola por si falla SMTP en local
    console.log(`[RECOVERY] Token para ${email}: ${token}`);
    console.log(`[RECOVERY] Link: http://localhost:5173/restablecer-clave?token=${token}`);

    try {
      await enviarMail({
        to: email,
        subject: 'Recuperación de Contraseña - Eventos DSW',
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
            <h2 style="color: #6d28d9;">Restablecer contraseña</h2>
            <p>Recibimos una solicitud para restablecer tu contraseña. Haz clic en el siguiente enlace para continuar:</p>
            <p style="margin: 24px 0;">
              <a href="http://localhost:5173/restablecer-clave?token=${token}" style="background-color: #6d28d9; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Restablecer mi contraseña</a>
            </p>
            <p style="color: #666; font-size: 12px;">Este enlace es válido por 1 hora. Si no solicitaste esto, puedes ignorar este correo.</p>
          </div>
        `,
      });
    } catch (mailError) {
      console.warn('❌ Error al enviar el correo, pero el token fue generado:', mailError);
    }

    res.json({ message: 'Si el correo está registrado, recibirás un enlace de recuperación.' });
  } catch (error) {
    console.error('Error en forgot-password:', error);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
});

/**
 * POST /api/v1/auth/reset-password
 * Valida el token y cambia la contraseña.
 */
router.post('/reset-password', async (req: ExRequest, res: ExpressResponse) => {
  const { token, nuevaClave } = req.body ?? {};

  if (!token || !nuevaClave) {
    res.status(400).json({ error: 'El token y la nueva contraseña son obligatorios.' });
    return;
  }

  if (nuevaClave.length < 6) {
    res.status(400).json({ error: 'La nueva contraseña debe tener al menos 6 caracteres.' });
    return;
  }

  try {
    const usuario = await prisma.usuario.findFirst({
      where: {
        token_recuperacion: token,
        token_recuperacion_expira: { gte: new Date() },
      },
    });

    if (!usuario) {
      res.status(400).json({ error: 'El token es inválido o ha expirado.' });
      return;
    }

    const hashedPassword = await hashPassword(nuevaClave);

    await prisma.usuario.update({
      where: { id: usuario.id },
      data: {
        contrasena_hash: hashedPassword,
        token_recuperacion: null,
        token_recuperacion_expira: null,
      },
    });

    res.json({ message: 'Contraseña restablecida con éxito.' });
  } catch (error) {
    console.error('Error en reset-password:', error);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
});

export default router;
