import { api } from "./api";

export async function getEvents() {
  const response = await api.get("/eventos");

  return response.data.data;
}
export async function getEventById(id: string) {
  const response = await api.get(`/eventos/${id}`);

  return response.data.data;
}