/**
 * Almacenamiento persistente con Prisma.
 *
 * Este archivo centraliza el acceso a la base de Datos (PostgreSQL) a través de Prisma.
 */
import { PrismaClient } from '@prisma/client';
import type { CreateEventoInput, CreateComentarioInput } from './dtos.js';

// Instanciamos el cliente de Prisma
const prisma = new PrismaClient();

// Tipos de estado permitidos para un evento (coinciden con la lógica de negocio)
export type EstadoEvento = 'PENDIENTE' | 'PUBLICADO' | 'RECHAZADO' | 'ARCHIVADO';

/**
 * Interfaz que define la estructura de un Evento en el sistema (Formato CamelCase para el API).
 */
export interface Evento {
  id: string;
  creadoPorUsuarioId: string | null;
  titulo: string;
  descripcion: string | null;
  iniciaEn: string;
  terminaEn: string | null;
  estado: EstadoEvento;
  entidadLugarId: string | null;
  posibleDuplicado: boolean;
  creadoEn: string;
  actualizadoEn: string;
}

/**
 * Interfaz que define la estructura de un Comentario (Formato CamelCase).
 */
export interface Comentario {
  id: string;
  eventoId: string;
  usuarioId: string | null;
  padreId: string | null;
  cuerpo: string;
  creadoEn: string;
  actualizadoEn: string;
}

/**
 * Función mapeadora para convertir el modelo de la BD (snake_case) al formato del API (camelCase).
 */
const mapEvento = (e: any): Evento => ({
  id: e.id,
  creadoPorUsuarioId: e.creado_por_usuario_id,
  titulo: e.titulo,
  descripcion: e.descripcion,
  iniciaEn: e.inicia_en.toISOString(),
  terminaEn: e.termina_en ? e.termina_en.toISOString() : null,
  estado: e.estado as EstadoEvento,
  entidadLugarId: e.entidad_lugar_id,
  posibleDuplicado: e.posible_duplicado,
  creadoEn: e.creado_en.toISOString(),
  actualizadoEn: e.actualizado_en.toISOString(),
});

const mapComentario = (c: any): Comentario => ({
  id: c.id,
  eventoId: c.evento_id,
  usuarioId: c.usuario_id,
  padreId: c.padre_id,
  cuerpo: c.cuerpo,
  creadoEn: c.creado_en.toISOString(),
  actualizadoEn: c.creado_en.toISOString(), // Comentarios no suelen tener updatedAt en el schema actual
});

// --- MÉTODOS DE EVENTOS ---

/** Lista todos los eventos registrados */
export const listEventos = async (): Promise<Evento[]> => {
  const data = await prisma.evento.findMany({
    orderBy: { inicia_en: 'asc' },
  });
  return data.map(mapEvento);
};

/** Obtiene un evento específico por su ID */
export const getEvento = async (eventoId: string): Promise<Evento | null> => {
  const data = await prisma.evento.findUnique({
    where: { id: eventoId },
  });
  return data ? mapEvento(data) : null;
};

/** Crea un nuevo evento en la base de datos */
export const createEvento = async (input: CreateEventoInput): Promise<Evento> => {
  const data = await prisma.evento.create({
    data: {
      titulo: input.titulo,
      descripcion: input.descripcion ?? null,
      inicia_en: new Date(input.iniciaEn),
      termina_en: input.terminaEn ? new Date(input.terminaEn) : null,
      entidad_lugar_id: input.entidadLugarId ?? null,
      creado_por_usuario_id: input.creadoPorUsuarioId ?? null,
      estado: 'PENDIENTE',
    },
  });
  return mapEvento(data);
};

/** Actualiza campos específicos de un evento */
export const updateEvento = async (eventoId: string, patch: any): Promise<Evento | null> => {
  try {
    const data = await prisma.evento.update({
      where: { id: eventoId },
      data: {
        titulo: patch.titulo,
        descripcion: patch.descripcion,
        inicia_en: patch.iniciaEn ? new Date(patch.iniciaEn) : undefined,
        termina_en: patch.terminaEn ? new Date(patch.terminaEn) : undefined,
        entidad_lugar_id: patch.entidadLugarId,
        estado: patch.estado,
        posible_duplicado: patch.posibleDuplicado,
      },
    });
    return mapEvento(data);
  } catch {
    return null;
  }
};

/** Elimina un evento */
export const deleteEvento = async (eventoId: string): Promise<boolean> => {
  try {
    await prisma.evento.delete({ where: { id: eventoId } });
    return true;
  } catch {
    return false;
  }
};

// --- MÉTODOS DE COMENTARIOS ---

/** Lista comentarios vinculados a un evento específico */
export const listComentariosByEvento = async (eventoId: string): Promise<Comentario[]> => {
  const data = await prisma.comentario.findMany({
    where: { evento_id: eventoId },
    orderBy: { creado_en: 'asc' },
  });
  return data.map(mapComentario);
};

/** Obtiene un comentario específico por su ID */
export const getComentario = async (comentarioId: string): Promise<Comentario | null> => {
  const data = await prisma.comentario.findUnique({
    where: { id: comentarioId },
  });
  return data ? mapComentario(data) : null;
};

/** Crea un comentario para un evento existente */
export const createComentario = async (
  eventoId: string,
  input: CreateComentarioInput
): Promise<Comentario | null> => {
  try {
    const data = await prisma.comentario.create({
      data: {
        evento_id: eventoId,
        cuerpo: input.cuerpo,
        usuario_id: input.usuarioId ?? null,
        padre_id: input.padreId ?? null,
      },
    });
    return mapComentario(data);
  } catch {
    return null;
  }
};

/** Actualiza el texto de un comentario */
export const updateComentario = async (
  comentarioId: string,
  cuerpo: string
): Promise<Comentario | null> => {
  try {
    const data = await prisma.comentario.update({
      where: { id: comentarioId },
      data: { cuerpo },
    });
    return mapComentario(data);
  } catch {
    return null;
  }
};

/** Elimina un comentario */
export const deleteComentario = async (comentarioId: string): Promise<boolean> => {
  try {
    await prisma.comentario.delete({ where: { id: comentarioId } });
    return true;
  } catch {
    return false;
  }
};

// --- SEEDING / DATOS DE PRUEBA ---

/**
 * Carga datos iniciales en la BD real.
 */
export const seedDemoData = async (): Promise<void> => {
  const count = await prisma.evento.count();
  if (count > 0) return;

  console.log('🌱 Sembrando datos iniciales en la DB...');

  const evento = await prisma.evento.create({
    data: {
      titulo: 'Evento Inicial Supabase',
      descripcion: 'Este evento ya viene de la base de datos real.',
      inicia_en: new Date(),
      estado: 'PUBLICADO',
    },
  });

  await prisma.comentario.create({
    data: {
      evento_id: evento.id,
      cuerpo: '¡Primer comentario persistente!',
    },
  });
};
