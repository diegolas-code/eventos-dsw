/**
 * Data Transfer Objects (DTOs).
 *
 * Estas interfaces definen la "forma" de los datos que esperamos recibir
 * en el cuerpo (body) de las peticiones HTTP. Ayudan a que TypeScript
 * valide que no falten campos obligatorios.
 */

/** Datos necesarios para crear un nuevo Evento */
export type CreateEventoInput = {
  titulo: string;
  descripcion?: string;
  iniciaEn: string; // Se espera formato ISO 8601
  terminaEn?: string | null;
  entidadLugarId?: string | null;
  creadoPorUsuarioId?: string | null;
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
