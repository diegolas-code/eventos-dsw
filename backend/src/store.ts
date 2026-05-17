import { randomUUID } from 'node:crypto';

export type EstadoEvento = 'PENDIENTE' | 'PUBLICADO' | 'RECHAZADO' | 'ARCHIVADO';

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

export interface Comentario {
  id: string;
  eventoId: string;
  usuarioId: string | null;
  padreId: string | null;
  cuerpo: string;
  creadoEn: string;
  actualizadoEn: string;
}

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

const eventos = new Map<string, Evento>();
const comentarios = new Map<string, Comentario>();

const now = () => new Date().toISOString();

const cloneEvento = (evento: Evento): Evento => ({ ...evento });

const cloneComentario = (comentario: Comentario): Comentario => ({ ...comentario });

export const listEventos = (): Evento[] => Array.from(eventos.values()).map(cloneEvento);

export const getEvento = (eventoId: string): Evento | null => {
  const evento = eventos.get(eventoId);
  return evento ? cloneEvento(evento) : null;
};

export const createEvento = (input: EventoInput): Evento => {
  const timestamp = now();
  const evento: Evento = {
    id: randomUUID(),
    creadoPorUsuarioId: input.creadoPorUsuarioId ?? null,
    titulo: input.titulo,
    descripcion: input.descripcion ?? null,
    iniciaEn: input.iniciaEn,
    terminaEn: input.terminaEn ?? null,
    estado: 'PENDIENTE',
    entidadLugarId: input.entidadLugarId ?? null,
    posibleDuplicado: false,
    creadoEn: timestamp,
    actualizadoEn: timestamp,
  };

  eventos.set(evento.id, evento);
  return cloneEvento(evento);
};

export const updateEvento = (eventoId: string, patch: EventoPatch): Evento | null => {
  const current = eventos.get(eventoId);
  if (!current) {
    return null;
  }

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

export const deleteEvento = (eventoId: string): boolean => eventos.delete(eventoId);

export const listComentariosByEvento = (eventoId: string): Comentario[] =>
  Array.from(comentarios.values())
    .filter(comentario => comentario.eventoId === eventoId)
    .map(cloneComentario)
    .sort((left, right) => left.creadoEn.localeCompare(right.creadoEn));

export const createComentario = (eventoId: string, input: ComentarioInput): Comentario | null => {
  if (!eventos.has(eventoId)) {
    return null;
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

export const deleteComentario = (comentarioId: string): boolean => comentarios.delete(comentarioId);

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
