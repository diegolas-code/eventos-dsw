import api from './api';

/** Obtiene todos los comentarios de un evento específico */
export async function getComentariosByEvento(eventoId: string) {
  const response = await api.get(`/eventos/${eventoId}/comentarios`);
  return response.data.data;
}

/** Publica un comentario en un evento */
export async function createComentario(
  eventoId: string,
  comentarioData: { cuerpo: string; usuarioId: string; padreId?: string }
) {
  const response = await api.post(`/eventos/${eventoId}/comentarios`, {
    cuerpo: comentarioData.cuerpo,
    usuarioId: comentarioData.usuarioId,
    padreId: comentarioData.padreId || null,
  });
  return response.data.data;
}

/** Elimina un comentario por su ID */
export async function deleteComentario(id: string) {
  await api.delete(`/comentarios/${id}`);
}
