import { api } from "./api";

export async function getEvents() {
  const response = await api.get("/eventos");

  return response.data;
}