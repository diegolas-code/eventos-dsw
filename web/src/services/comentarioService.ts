import { api } from './api';

/** Obtiene todos los comentarios de un evento específico */
export async function getComentariosByEvento(eventoId: string) {
  const response = await api.get(`/eventos/${eventoId}/comentarios`);
  return response.data.data;
}

/** Publica un comentario en un evento (soporta respuestas recursivas si se envía padreId) */
export async function createComentario(
  eventoId: string,
  comentarioData: { contenido: string; usuarioId: string; padreId?: string }
) {
  const response = await api.post(`/eventos/${eventoId}/comentarios`, {
    contenido: comentarioData.contenido,
    usuario_id: comentarioData.usuarioId,
    padre_id: comentarioData.padreId || null,
  });
  return response.data.data;
}
