import api  from './api';

export interface PendingEvent {
  id: string;
  titulo: string;
  descripcion: string | null;
  iniciaEn: string;
  terminaEn: string | null;
  imagenUrl: string | null;
  lugar: string | null;
  creadoPorUsuarioId: string | null;
}

export async function getPendingEvents(): Promise<PendingEvent[]> {
  const response = await api.get('/moderacion/pendientes');
  return response.data.data;
}

export async function applyModerationAction(
  eventoId: string,
  accion: 'APROBAR' | 'RECHAZAR' | 'ARCHIVAR',
  nota?: string
): Promise<{ message: string }> {
  const response = await api.post('/moderacion/acciones', {
    eventoId,
    accion,
    nota,
  });
  return response.data;
}
