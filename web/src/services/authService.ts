import api from './api';

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    nombreMostrar: string;
    rol: string;
  };
  token: string;
}

/**
 * Registra un nuevo usuario con credenciales locales en la API.
 */
export async function register(userData: {
  email: string;
  password?: string;
  nombreMostrar: string;
}): Promise<AuthResponse> {
  const response = await api.post('/auth/register', userData);
  return response.data.data;
}

/**
 * Inicia sesión con credenciales locales en la API.
 */
export async function login(credentials: {
  email: string;
  password?: string;
}): Promise<AuthResponse> {
  const response = await api.post('/auth/login', credentials);
  return response.data.data;
}
