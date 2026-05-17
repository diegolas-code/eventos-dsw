import { useQuery } from "@tanstack/react-query";

import MainLayout from "../../Components/layout/MainLayout";

import { getEvents } from "../../services/eventService";

export default function HomePage() {
  const { data, isLoading } = useQuery({
    queryKey: ["events"],
    queryFn: getEvents,
  });

  return (
    <MainLayout>
      <h1 className="text-4xl font-bold mb-6">
        Eventos
      </h1>

      {isLoading && <p>Cargando...</p>}

      {data?.map((event: any) => (
        <div
          key={event.id}
          className="bg-white p-4 rounded mb-4"
        >
          <h2 className="text-2xl font-bold">
            {event.titulo}
          </h2>

          <p>{event.descripcion}</p>
        </div>
      ))}
    </MainLayout>
  );
}