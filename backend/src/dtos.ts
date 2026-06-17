/**
 * Data Transfer Objects (DTOs).
 *
 * Estas interfaces definen la "forma" de los datos que esperamos recibir
 * en el cuerpo (body) de las peticiones HTTP.
 * Actualizado para Phase 0.5 con Enums de Prisma.
 */
import { CategoriaEvento, RolUsuario, TipoEntidad } from '@prisma/client';

/** Datos necesarios para crear un nuevo Evento */
export type CreateEventoInput = {
  titulo: string;
  descripcion?: string;
  iniciaEn: string; // Se espera formato ISO 8601
  terminaEn?: string | null;
    categoria?: CategoriaEvento;
  lugar?:string | null;
  entidadLugarId?: string | null;
  creadoPorUsuarioId?: string | null;
  artistasIds?: string[]; // IDs para la relación muchos-a-muchos
  
    imagenUrl?: string;
};

/** Datos necesarios para crear un nuevo Comentario */
export type CreateComentarioInput = {
  cuerpo: string;
  usuarioId?: string | null;
  padreId?: string | null;
};

/** Datos permitidos para actualizar un Comentario */
export type PatchComentarioInput = {
  cuerpo: string;
};

/** Datos necesarios para registrar un nuevo Usuario */
export type CreateUsuarioInput = {
  email: string;
  nombreMostrar: string;
  rol?: RolUsuario;
};

/** Datos permitidos para actualizar el perfil de un Usuario */
export type PatchUsuarioInput = {
  nombreMostrar?: string;
  rol?: RolUsuario;
};

/** Datos necesarios para crear un Perfil de Entidad */
export type CreatePerfilEntidadInput = {
  usuarioId?: string; // Opcional para perfiles no reclamados
  nombre: string;
  tipo: TipoEntidad;
  descripcion?: string;
  direccion?: string;
  imagenUrl?:string;
  gmapsUrl?: string;
};
