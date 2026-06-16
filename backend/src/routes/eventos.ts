/**
 * Router de Eventos.
 * Define los endpoints para el CRUD de eventos y la gestión de sus comentarios.
 */
import { Router } from 'express';
import type { Request as ExRequest } from 'express-serve-static-core';

import type { CreateEventoInput, CreateComentarioInput } from '../dtos.js';
import upload from "../middleware/upload.js";
import cloudinary from "../config/cloudinary.js";
import type { Request } from "express";
import type { Response as ExpressResponse } from "express";


interface MulterRequest extends Request {
  file?: Express.Multer.File;
}



// Alias para facilitar el tipado de Express con nuestros DTOs
type Req = ExRequest<any, any, any>;
type ReqCreateEvento = ExRequest<Record<string, any>, any, CreateEventoInput>;
type ReqCreateComentario = ExRequest<{ id: string }, any, CreateComentarioInput>;

import {
  createComentario,
  createEvento,
  deleteEvento,
  getEvento,
  listComentariosByEvento,
  listEventos,
  updateEvento,
} from '../store.js';

const router = Router();

/**
 * GET /api/v1/eventos
 * Retorna la lista de todos los eventos.
 */
router.get('/', async (_request: Req, response: ExpressResponse) => {
  response.json({ data: await listEventos() });
});

/**
 * POST /api/v1/eventos
 * Crea un nuevo evento. Valida campos obligatorios básicos.
 */
router.post(
  '/',
  upload.single('image'),
  async (
    request: MulterRequest,
    response: ExpressResponse
  ) => {
    const body = request.body as CreateEventoInput;

    if (
      typeof body.titulo !== 'string' ||
      typeof body.iniciaEn !== 'string'
    ) {
      response.status(400).json({
        error: 'titulo e iniciaEn son obligatorios',
      });
      return;
    }

    let imagenUrl: string | undefined;

    try {
      if (request.file) {
        const result = await new Promise<any>(
          (resolve, reject) => {
            cloudinary.uploader
              .upload_stream(
                {
                  folder: 'eventos-dsw',
                },
                (error, result) => {
                  if (error) {
                    reject(error);
                    return;
                  }

                  resolve(result);
                }
              )
              .end(request.file!.buffer);
          }
        );

        imagenUrl = result.secure_url;
      }

      const evento = await createEvento({
        titulo: body.titulo,
        descripcion: body.descripcion,
        iniciaEn: body.iniciaEn,
        lugar: body.lugar,
        terminaEn: body.terminaEn,
        entidadLugarId: body.entidadLugarId,
        creadoPorUsuarioId: body.creadoPorUsuarioId,
        artistasIds: body.artistasIds,
        imagenUrl,
      });

      response.status(201).json({
        data: evento,
      });
    } catch (error) {
      console.error(error);

      response.status(500).json({
        error: 'Error creando evento',
      });
    }
  }
);
/**
 * GET /api/v1/eventos/:id
 * Obtiene el detalle de un evento por su ID.
 */
router.get('/:id', async (request: Req, response: ExpressResponse) => {
  const evento = await getEvento(request.params.id);

  if (!evento) {
    response.status(404).json({ error: 'Evento no encontrado' });
    return;
  }

  response.json({ data: evento });
});

/**
 * PATCH /api/v1/eventos/:id
 * Actualización parcial de un evento.
 */
router.patch('/:id', async (request: Req, response: ExpressResponse) => {
  const patch = await updateEvento(request.params.id, request.body ?? {});

  if (!patch) {
    response.status(404).json({ error: 'Evento no encontrado' });
    return;
  }

  response.json({ data: patch });
});

/**
 * DELETE /api/v1/eventos/:id
 * Elimina un evento.
 */
router.delete('/:id', async (request: Req, response: ExpressResponse) => {
  const deleted = await deleteEvento(request.params.id);

  if (!deleted) {
    response.status(404).json({ error: 'Evento no encontrado' });
    return;
  }

  response.status(204).send();
});

// --- SUB-RECURSO: COMENTARIOS ---

/**
 * GET /api/v1/eventos/:id/comentarios
 * Lista los comentarios de un evento específico.
 */
router.get('/:id/comentarios', async (request: Req, response: ExpressResponse) => {
  response.json({ data: await listComentariosByEvento(request.params.id) });
});

/**
 * POST /api/v1/eventos/:id/comentarios
 * Crea un comentario vinculado a un evento.
 */
router.post('/:id/comentarios', async (request: ReqCreateComentario, response: ExpressResponse) => {
  const { cuerpo, usuarioId, padreId } = request.body ?? ({} as CreateComentarioInput);

  if (typeof cuerpo !== 'string' || cuerpo.trim().length === 0) {
    response.status(400).json({ error: 'cuerpo es obligatorio' });
    return;
  }

  const comentario = await createComentario(request.params.id, {
    cuerpo,
    usuarioId: typeof usuarioId === 'string' ? usuarioId : undefined,
    padreId: typeof padreId === 'string' ? padreId : undefined,
  });

  if (!comentario) {
    response.status(404).json({ error: 'Evento no encontrado' });
    return;
  }

  response.status(201).json({ data: comentario });
});

export default router;
