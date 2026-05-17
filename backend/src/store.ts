/**
 * Almacenamiento temporal en memoria.
 *
 * IMPORTANTE: Actualmente este archivo actúa como nuestra "Base de Datos" temporal.
 * Los datos se pierden cada vez que el servidor se reinicia.
 * En la siguiente fase, reemplazaremos esta lógica por llamadas a Prisma + PostgreSQL.
 */
import { randomUUID } from 'node:crypto';

// Tipos de estado permitidos para un evento.
export type EstadoEvento = 'PENDIENTE' | 'PUBLICADO' | 'RECHAZADO' | 'ARCHIVADO';

/**
 * Interfaz que define la estructura de un Evento en el sistema.
 */
export interface Evento {
  id: string;
  creadoPorUsuarioId: string | null;
  titulo: string;
  descripcion: string | null;
  iniciaEn: string; // ISO string de fecha/hora
  terminaEn: string | null;
  estado: EstadoEvento;
  entidadLugarId: string | null;
  posibleDuplicado: boolean;
  creadoEn: string;
  actualizadoEn: string;
}

/**
 * Interfaz que define la estructura de un Comentario.
 */
export interface Comentario {
  id: string;
  eventoId: string;
  usuarioId: string | null;
  padreId: string | null; // Para hilos de comentarios (respuestas)
  cuerpo: string;
  creadoEn: string;
  actualizadoEn: string;
}

// Tipos para los datos que recibimos desde la API (Inputs)
type EventoInput = {
  titulo: string;
  descripcion?: string;
  iniciaEn: string;
  terminaEn?: string | null;
  entidadLugarId?: string | null;
  creadoPorUsuarioId?: string | null;
};

type EventoPatch = Partial<
  Pick<EventoInput, 'titulo' | 'descripcion' | 'iniciaEn' | 'terminaEn' | 'entidadLugarId'>
> & {
  estado?: EstadoEvento;
  posibleDuplicado?: boolean;
};

type ComentarioInput = {
  cuerpo: string;
  usuarioId?: string | null;
  padreId?: string | null;
};

// Mapas para almacenar los datos (id -> objeto)
const eventos = new Map<string, Evento>();
const comentarios = new Map<string, Comentario>();

// Función auxiliar para generar timestamps uniformes
const now = () => new Date().toISOString();

/**
 * Clonamos los objetos antes de devolverlos para evitar que modificaciones
 * accidentales fuera del "store" afecten a los datos guardados (inmutabilidad).
 */
const cloneEvento = (evento: Evento): Evento => ({ ...evento });
const cloneComentario = (comentario: Comentario): Comentario => ({ ...comentario });

// --- MÉTODOS DE EVENTOS ---

/** Lista todos los eventos registrados */
export const listEventos = (): Evento[] => Array.from(eventos.values()).map(cloneEvento);

/** Obtiene un evento específico por su ID */
export const getEvento = (eventoId: string): Evento | null => {
  const evento = eventos.get(eventoId);
  return evento ? cloneEvento(evento) : null;
};

/** Crea un nuevo evento con estado inicial PENDIENTE */
export const createEvento = (input: EventoInput): Evento => {
  const timestamp = now();
  const evento: Evento = {
    id: randomUUID(),
    creadoPorUsuarioId: input.creadoPorUsuarioId ?? null,
    titulo: input.titulo,
    descripcion: input.descripcion ?? null,
    iniciaEn: input.iniciaEn,
    terminaEn: input.terminaEn ?? null,
    estado: 'PENDIENTE', // Por defecto, todo evento requiere moderación
    entidadLugarId: input.entidadLugarId ?? null,
    posibleDuplicado: false,
    creadoEn: timestamp,
    actualizadoEn: timestamp,
  };

  eventos.set(evento.id, evento);
  return cloneEvento(evento);
};

/** Actualiza campos específicos de un evento */
export const updateEvento = (eventoId: string, patch: EventoPatch): Evento | null => {
  const current = eventos.get(eventoId);
  if (!current) {
    return null;
  }

  // Combinamos los datos actuales con los nuevos
  const updated: Evento = {
    ...current,
    ...patch,
    descripcion:
      patch.descripcion !== undefined ? (patch.descripcion ?? null) : current.descripcion,
    terminaEn: patch.terminaEn !== undefined ? (patch.terminaEn ?? null) : current.terminaEn,
    entidadLugarId:
      patch.entidadLugarId !== undefined ? (patch.entidadLugarId ?? null) : current.entidadLugarId,
    actualizadoEn: now(),
  };

  eventos.set(eventoId, updated);
  return cloneEvento(updated);
};

/** Elimina un evento (esta acción es definitiva en este modelo) */
export const deleteEvento = (eventoId: string): boolean => eventos.delete(eventoId);

// --- MÉTODOS DE COMENTARIOS ---

/** Lista comentarios vinculados a un evento específico, ordenados por fecha */
export const listComentariosByEvento = (eventoId: string): Comentario[] =>
  Array.from(comentarios.values())
    .filter(comentario => comentario.eventoId === eventoId)
    .map(cloneComentario)
    .sort((left, right) => left.creadoEn.localeCompare(right.creadoEn));

/** Crea un comentario para un evento existente */
export const createComentario = (eventoId: string, input: ComentarioInput): Comentario | null => {
  if (!eventos.has(eventoId)) {
    return null; // No podemos comentar eventos que no existen
  }

  const timestamp = now();
  const comentario: Comentario = {
    id: randomUUID(),
    eventoId,
    usuarioId: input.usuarioId ?? null,
    padreId: input.padreId ?? null,
    cuerpo: input.cuerpo,
    creadoEn: timestamp,
    actualizadoEn: timestamp,
  };

  comentarios.set(comentario.id, comentario);
  return cloneComentario(comentario);
};

/** Actualiza el texto de un comentario */
export const updateComentario = (comentarioId: string, cuerpo: string): Comentario | null => {
  const current = comentarios.get(comentarioId);
  if (!current) {
    return null;
  }

  const updated: Comentario = {
    ...current,
    cuerpo,
    actualizadoEn: now(),
  };

  comentarios.set(comentarioId, updated);
  return cloneComentario(updated);
};

/** Elimina un comentario */
export const deleteComentario = (comentarioId: string): boolean => comentarios.delete(comentarioId);

// --- SEEDING / DATOS DE PRUEBA ---

/**
 * Carga datos iniciales si la lista está vacía.
 * Útil para que los desarrolladores vean algo al entrar por primera vez.
 */
export const seedDemoData = (): void => {
  if (eventos.size > 0) {
    return;
  }

  const evento = createEvento({
    titulo: 'Concierto de prueba',
    descripcion: 'Evento inicial para validar la API.',
    iniciaEn: new Date().toISOString(),
    terminaEn: null,
    entidadLugarId: 'lugar-demo',
    creadoPorUsuarioId: 'usuario-demo',
  });

  createComentario(evento.id, {
    cuerpo: 'Primer comentario de demo.',
    usuarioId: 'usuario-demo',
  });
};
