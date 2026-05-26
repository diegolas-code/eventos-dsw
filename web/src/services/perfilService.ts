import { api } from './api';

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
