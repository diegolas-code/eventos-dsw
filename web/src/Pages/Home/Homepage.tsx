import { useQuery } from "@tanstack/react-query";

import MainLayout from "../../Components/layout/MainLayout";

import EventGrid from "../../Pages/EventPage/EventGrid";
import HeroSection from "../Home/HeroSection";

import { getEvents } from "../../services/eventService";

export default function HomePage() {
  const {
    data,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["events"],
    queryFn: getEvents,
  });

  return (
    <MainLayout>
      <HeroSection />

      <div className="mb-8 flex gap-3 flex-wrap">
        <button className="bg-violet-600 text-white px-4 py-2 rounded-full">
          Todos
        </button>

        <button className="bg-white px-4 py-2 rounded-full">
          Concierto
        </button>

        <button className="bg-white px-4 py-2 rounded-full">
          Exposición
        </button>

        <button className="bg-white px-4 py-2 rounded-full">
          Taller
        </button>
      </div>

      {isLoading && (
        <p>Cargando eventos...</p>
      )}

      {error && (
        <p className="text-red-500">
          Error cargando eventos
        </p>
      )}

      {data && <EventGrid events={data} />}
    </MainLayout>
  );
}