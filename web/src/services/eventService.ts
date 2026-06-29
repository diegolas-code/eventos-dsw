import  api  from './api';

export async function getEvents() {
  const response = await api.get('/eventos');

  return response.data.data;
}
export async function getEventById(id: string) {
  const response = await api.get(`/eventos/${id}`);

  return response.data.data;
}
export async function createEvent(formData: FormData) {
  const response = await api.post('/eventos', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data.data;
}

export async function getCategorias() {
  const response = await api.get(
    "/eventos/categorias/listado"
  );

  return response.data.data;
}