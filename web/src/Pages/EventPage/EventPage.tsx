import { useParams } from "react-router-dom";

import { useQuery } from "@tanstack/react-query";

import MainLayout from "../../Components/layout/MainLayout";

import { getEventById } from "../../services/eventService";

export default function EventPage() {
  const { id } = useParams();

  const {
    data,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["event", id],
    queryFn: () => getEventById(id!),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <MainLayout>
        <p>Cargando evento...</p>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <p className="text-red-500">
          Error cargando evento
        </p>
      </MainLayout>
    );
  }

  if (!data) {
    return (
      <MainLayout>
        <p>Evento no encontrado</p>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div
        className="
          bg-white
          rounded-2xl
          shadow-md
          p-8
        "
      >
        <h1 className="text-5xl font-bold mb-6">
          {data.titulo}
        </h1>

        <p className="text-lg text-zinc-700 mb-6">
          {data.descripcion}
        </p>

        {data.iniciaEn && (
          <p className="text-zinc-500">
            📅{" "}
            {new Date(data.iniciaEn).toLocaleString()}
          </p>
        )}
      </div>
    </MainLayout>
  );
}