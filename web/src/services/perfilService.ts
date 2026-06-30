import api from './api';

export interface UpdatePerfilInput {
  nombre?: string;
  descripcion?: string;
  direccion?: string;
  gmapsUrl?: string;
  imagenUrl?: string;
}

/** Busca el perfil de entidad (artista/lugar) vinculado a un ID de usuario */
export async function getPerfilByUsuario(usuarioId: string) {
  const response = await api.get(`/perfiles/usuario/${usuarioId}`);
  return response.data.data;
}

/** Crea un nuevo perfil de entidad */
export async function createPerfilEntidad(perfilData: {
  usuarioId?: string;
  nombre: string;
  tipo: 'ARTISTA' | 'LUGAR';
  descripcion?: string;
  direccion?: string;
  gmapsUrl?: string;
  imagenUrl?: string;
}) {
  const response = await api.post('/perfiles', perfilData);
  return response.data.data;
}

/**
 * Reclama un peril de entidad existente vinculándolo al usuario logueado
 * POST /api/v1/perfiles/:id/reclamar
 */
export async function reclamarPerfilEntidad(perfilId: string) {
  const response = await api.post(`/perfiles/${perfilId}/reclamar`);
  return response.data;
}

/**
 * Actualiza los datos de un perfil de entidad existente (Editar perfil)
 * PATCH /api/v1/perfiles/:id
 */
export async function updatePerfilEntidad(perfilId: string, perfilData: UpdatePerfilInput) {
  const response = await api.patch(`/perfiles/${perfilId}`, perfilData);
  return response.data.data;
}
