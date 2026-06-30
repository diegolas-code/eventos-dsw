/**
 * Almacenamiento persistente con Prisma.
 *
 * Este archivo centraliza el acceso a la base de Datos (PostgreSQL) a través de Prisma.
 * Actualizado para Phase 0.5 con Enums y relaciones M:N.
 */
import {
  PrismaClient,
  RolUsuario,
  EstadoEvento,
  TipoEntidad,
  CategoriaEvento,
} from '@prisma/client';
import type {
  CreateEventoInput,
  CreateComentarioInput,
  CreateUsuarioInput,
  CreatePerfilEntidadInput,
} from './dtos.js';

// Instanciamos el cliente de Prisma
const prisma = new PrismaClient();

// Re-exportamos los enums para uso en toda la aplicación
export { RolUsuario, EstadoEvento, TipoEntidad };

/**
 * Interfaz que define la estructura de un Evento en el sistema (Formato CamelCase para el API).
 */
export interface Evento {
  id: string;
  creadoPorUsuarioId: string | null;
  titulo: string;
  descripcion: string | null;
  iniciaEn: string;
  categoria: string;
  terminaEn: string | null;
  estado: EstadoEvento;
  entidadLugarId: string | null;
  posibleDuplicado: boolean;
  imagenUrl: string | null;
  creadoEn: string;
  actualizadoEn: string;
  lugar: string | null;
  // Incluimos artistas si vienen en la query
  artistas?: PerfilEntidadBrief[];
  imagenes?: EventoImagen[];
}

export interface EventoImagen {
  id: string;
  url: string;
  orden: number;
}

/**
 * Versión simplificada de perfil de entidad para listados de artistas en eventos.
 */
export interface PerfilEntidadBrief {
  id: string;
  nombre: string;
  tipo: TipoEntidad;
  imagenUrl: string | null;
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
 * Interfaz que define la estructura de un Usuario
 */
export interface Usuario {
  id: string;
  email: string;
  nombreMostrar: string;
  rol: RolUsuario;
  creadoEn: string;
  actualizadoEn: string;
  perfiles?: PerfilEntidad[];
}

export interface PerfilEntidad {
  id: string;
  usuarioId: string | null;
  nombre: string;
  tipo: TipoEntidad;
  descripcion: string | null;
  direccion: string | null;
  gmapsUrl: string | null;
  imagenUrl: string | null;
  reclamado: boolean;
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
  categoria: e.categoria,
  descripcion: e.descripcion,
  iniciaEn: e.inicia_en.toISOString(),
  terminaEn: e.termina_en ? e.termina_en.toISOString() : null,
  estado: e.estado as EstadoEvento,
  entidadLugarId: e.entidad_lugar_id,
  posibleDuplicado: e.posible_duplicado,
  imagenUrl: e.imagen_url,
  imagenes: e.imagenes,
  lugar: e.lugar_manual,
  creadoEn: e.creado_en.toISOString(),
  actualizadoEn: e.actualizado_en.toISOString(),
  // Si la consulta incluyó la relación artistas (EventoArtista -> PerfilEntidad)
  artistas: e.artistas?.map((ea: any) => ({
    id: ea.artista.id,
    nombre: ea.artista.nombre,
    tipo: ea.artista.tipo,
    imagenUrl: ea.artista.imagen_url,
  })),
});

const mapComentario = (c: any): Comentario => ({
  id: c.id,
  eventoId: c.evento_id,
  usuarioId: c.usuario_id,
  padreId: c.padre_id,
  cuerpo: c.cuerpo,
  creadoEn: c.creado_en.toISOString(),
  actualizadoEn: c.actualizado_en.toISOString(),
});

const mapUsuario = (u: any): Usuario => ({
  id: u.id,
  email: u.email,
  nombreMostrar: u.nombre_mostrar,
  rol: u.rol as RolUsuario,
  creadoEn: u.creado_en.toISOString(),
  actualizadoEn: u.actualizado_en.toISOString(),
  perfiles: u.perfiles ? u.perfiles.map(mapPerfilEntidad) : undefined,
});

const mapPerfilEntidad = (p: any): PerfilEntidad => ({
  id: p.id,
  usuarioId: p.usuario_id,
  nombre: p.nombre,
  tipo: p.tipo as TipoEntidad,
  descripcion: p.descripcion,
  direccion: p.direccion,
  gmapsUrl: p.gmaps_url,
  imagenUrl: p.imagen_url,
  reclamado: p.reclamado,
  creadoEn: p.creado_en.toISOString(),
  actualizadoEn: p.actualizado_en.toISOString(),
});

// --- MÉTODOS DE EVENTOS ---

/** Lista todos los eventos registrados con sus artistas */
export const listEventos = async (usuarioId?: string, entidadId?: string): Promise<Evento[]> => {
  const data = await prisma.evento.findMany({
    where: {
      estado: 'PUBLICADO',
      ...(entidadId
        ? {
            OR: [
              { entidad_lugar_id: entidadId },
              {
                artistas: {
                  some: {
                    artista_id: entidadId,
                  },
                },
              },
            ],
          }
        : {}),
    },
    include: {
      artistas: {
        include: { artista: true },
      },
      imagenes: true,

      asistentes: usuarioId
        ? {
            where: {
              usuario_id: usuarioId,
            },
            select: {
              usuario_id: true,
            },
          }
        : false,
    },
    orderBy: { inicia_en: 'asc' },
  });

  return data.map(e => ({
    ...mapEvento(e),
    isAsistiendo: usuarioId ? e.asistentes.length > 0 : false,
  }));
};
/** Obtiene un evento específico por su ID */
export const getEvento = async (eventoId: string): Promise<Evento | null> => {
  const data = await prisma.evento.findUnique({
    where: { id: eventoId },

    include: {
      artistas: {
        include: {
          artista: true,
        },
      },

      imagenes: true,
    },
  });
  return data ? mapEvento(data) : null;
};

/** Crea un nuevo evento en la base de datos */
export const createEvento = async (
  input: CreateEventoInput & {
    artistasIds?: string[];
    galeria?: string[];
  }
): Promise<Evento> => {
  const data = await prisma.evento.create({
    data: {
      titulo: input.titulo,
      descripcion: input.descripcion ?? null,
      imagen_url: input.imagenUrl ?? null,
      lugar_manual: input.lugar ?? null,
      categoria: input.categoria ?? CategoriaEvento.OTRO,
      inicia_en: new Date(input.iniciaEn),
      termina_en: input.terminaEn ? new Date(input.terminaEn) : null,
      entidad_lugar_id: input.entidadLugarId ?? null,
      creado_por_usuario_id: input.creadoPorUsuarioId ?? null,
      estado: EstadoEvento.PENDIENTE,

      artistas: input.artistasIds
        ? {
            create: input.artistasIds.map(id => ({
              artista: {
                connect: { id },
              },
            })),
          }
        : undefined,

      imagenes: input.galeria?.length
        ? {
            create: input.galeria.map((url, index) => ({
              url,
              orden: index,
            })),
          }
        : undefined,
    },

    include: {
      artistas: {
        include: {
          artista: true,
        },
      },
      imagenes: true,
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
        // Manejo de artistas en update se puede expandir según necesidad
      },
      include: {
        artistas: {
          include: { artista: true },
        },
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

// --- MÉTODOS DE USUARIOS ---

/** Lista todos los usuarios registrados */
export const listUsuarios = async (): Promise<Usuario[]> => {
  const data = await prisma.usuario.findMany({
    orderBy: { creado_en: 'desc' },
  });
  return data.map(mapUsuario);
};

/** Obtiene un usuario específico por su ID */
export const getUsuario = async (usuarioId: string): Promise<Usuario | null> => {
  const data = await prisma.usuario.findUnique({
    where: { id: usuarioId },
    include: { perfiles: true },
  });
  return data ? mapUsuario(data) : null;
};

/** Crea un usuario en la base de datos */
export const createUsuario = async (input: CreateUsuarioInput): Promise<Usuario> => {
  const data = await prisma.usuario.create({
    data: {
      email: input.email,
      nombre_mostrar: input.nombreMostrar,
      rol: (input.rol as RolUsuario) ?? RolUsuario.miembro,
    },
  });
  return mapUsuario(data);
};

/** Actualiza datos del perfil de un usuario */
export const updateUsuario = async (usuarioId: string, patch: any): Promise<Usuario | null> => {
  try {
    const data = await prisma.usuario.update({
      where: { id: usuarioId },
      data: {
        nombre_mostrar: patch.nombreMostrar,
        rol: patch.rol as RolUsuario,
      },
    });
    return mapUsuario(data);
  } catch {
    return null;
  }
};

/** Elimina un usuario del sistema */
export const deleteUsuario = async (usuarioId: string): Promise<boolean> => {
  try {
    await prisma.usuario.delete({ where: { id: usuarioId } });
    return true;
  } catch {
    return false;
  }
};

// --- MÉTODOS DE Perfil Entidad ---

/** Obtiene el perfil de entidad asociado a un usuario específico */
export const getPerfilByUsuario = async (usuarioId: string): Promise<PerfilEntidad | null> => {
  const data = await prisma.perfilEntidad.findFirst({
    where: { usuario_id: usuarioId },
  });
  return data ? mapPerfilEntidad(data) : null;
};

/** Crea nuevo perfil de entidad */
export const CreatePerfilEntidad = async (
  input: CreatePerfilEntidadInput
): Promise<PerfilEntidad> => {
  const data = await prisma.perfilEntidad.create({
    data: {
      usuario_id: input.usuarioId ?? null,
      nombre: input.nombre,
      tipo: input.tipo,
      descripcion: input.descripcion ?? null,
      direccion: input.direccion ?? null,
      gmaps_url: input.gmapsUrl ?? null,
      imagen_url: input.imagenUrl ?? null,
      reclamado: !!input.usuarioId,
    },
  });
  return mapPerfilEntidad(data);
};

// --- SEEDING / DATOS DE PRUEBA ---

/**
 * Carga datos iniciales en la BD real con el nuevo esquema.
 */
export const seedDemoData = async (): Promise<void> => {
  const count = await prisma.evento.count();
  if (count > 0) return;

  console.log('🌱 Sembrando datos iniciales en la DB (Phase 0.5)...');

  // Creamos un usuario admin por defecto
  const admin = await prisma.usuario.create({
    data: {
      email: 'admin@eventosdsw.com',
      nombre_mostrar: 'Administrador',
      rol: RolUsuario.admin,
    },
  });

  // Creamos un lugar de prueba
  const club = await prisma.perfilEntidad.create({
    data: {
      nombre: 'Club de Prueba',
      tipo: TipoEntidad.LUGAR,
      direccion: 'Calle Falsa 123',
      reclamado: true,
    },
  });

  // Creamos un artista de prueba
  const banda = await prisma.perfilEntidad.create({
    data: {
      nombre: 'La Banda Refactor',
      tipo: TipoEntidad.ARTISTA,
      reclamado: true,
    },
  });

  const evento = await prisma.evento.create({
    data: {
      titulo: 'Evento Inicial Phase 0.5',
      descripcion: 'Estrenando el sistema de muchos-a-muchos y Enums.',
      inicia_en: new Date(),
      estado: EstadoEvento.PUBLICADO,
      entidad_lugar_id: club.id,
      creado_por_usuario_id: admin.id,
      artistas: {
        create: [{ artista: { connect: { id: banda.id } } }],
      },
    },
    include: {
      artistas: {
        include: { artista: true },
      },
    },
  });

  await prisma.comentario.create({
    data: {
      evento_id: evento.id,
      cuerpo: '¡Primer comentario en el nuevo esquema recursivo!',
      usuario_id: admin.id,
    },
  });

  console.log('✅ Datos iniciales sembrados con éxito.');
};

/**
 * Marca asistencia a un evento.
 */
export async function asistirEvento(usuarioId: string, eventoId: string) {
  return prisma.usuarioEvento.upsert({
    where: {
      usuario_id_evento_id: {
        usuario_id: usuarioId,
        evento_id: eventoId,
      },
    },
    update: {},
    create: {
      usuario_id: usuarioId,
      evento_id: eventoId,
    },
  });
}
/**
 * Cancela asistencia.
 */
export async function cancelarAsistencia(usuarioId: string, eventoId: string) {
  return prisma.usuarioEvento.delete({
    where: {
      usuario_id_evento_id: {
        usuario_id: usuarioId,
        evento_id: eventoId,
      },
    },
  });
}

/**
 * Obtiene todos los eventos a los que asistirá un usuario.
 */
export async function obtenerEventosAsistire(usuarioId: string) {
  return prisma.usuarioEvento.findMany({
    where: {
      usuario_id: usuarioId,
    },
    include: {
      evento: {
        include: {
          imagenes: true,
          artistas: {
            include: {
              artista: true,
            },
          },
          lugar: true,
        },
      },
    },
    orderBy: {
      creado_en: 'desc',
    },
  });
}

/**
 * Verifica si un usuario asistirá a un evento.
 */
export async function usuarioAsistiraEvento(usuarioId: string, eventoId: string) {
  const asistencia = await prisma.usuarioEvento.findUnique({
    where: {
      usuario_id_evento_id: {
        usuario_id: usuarioId,
        evento_id: eventoId,
      },
    },
  });

  return !!asistencia;
}

/**
 * Cantidad de asistentes de un evento.
 */
export async function contarAsistentes(eventoId: string) {
  return prisma.usuarioEvento.count({
    where: {
      evento_id: eventoId,
    },
  });
}
