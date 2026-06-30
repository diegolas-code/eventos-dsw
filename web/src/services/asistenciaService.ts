import api from './api';

export async function asistirEvento(eventoId: string) {
  const res = await api.post(`/asistencias/${eventoId}`);
  return res.data;
}

export async function cancelarAsistencia(eventoId: string) {
  const res = await api.delete(`/asistencias/${eventoId}`);
  return res.data;
}

export async function getMisEventos() {
  const res = await api.get(`/asistencias/mis-eventos`);
  return res.data.data;
}
