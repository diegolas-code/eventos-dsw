export type CreateEventoInput = {
  titulo: string;
  descripcion?: string;
  iniciaEn: string;
  terminaEn?: string | null;
  entidadLugarId?: string | null;
  creadoPorUsuarioId?: string | null;
};

export type CreateComentarioInput = {
  cuerpo: string;
  usuarioId?: string | null;
  padreId?: string | null;
};

export type PatchComentarioInput = {
  cuerpo: string;
};
