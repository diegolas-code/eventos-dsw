import { api } from './api';

/** Obtiene los datos de un usuario específico por su ID */
export async function getUsuarioById(id: string) {
  const response = await api.get(`/usuarios/${id}`);
  return response.data.data;
}

/** Registra un nuevo usuario en el sistema */
export async function createUsuario(usuarioData: {
  email: string;
  nombreMostrar: string;
  rol?: string;
}) {
  const response = await api.post('/usuarios', usuarioData);
  return response.data.data;
}

/** Modifica los datos o el rol de un usuario existente */
export async function patchUsuario(
  id: string,
  usuarioData: { nombreMostrar?: string; rol?: string }
) {
  const response = await api.patch(`/usuarios/${id}`, usuarioData);
  return response.data.data;
}
