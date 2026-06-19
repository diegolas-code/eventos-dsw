type EventCardProps = {
  event: {
    id: string;
    titulo: string;
    descripcion?: string;
    iniciaEn?: string;
  };
};

export default function EventCard({
  event,
}: EventCardProps) {
  return (
    <div
      className="
        bg-white
        rounded-xl
        shadow-md
        p-5
        hover:shadow-xl
        transition
      "
    >
      <h2 className="text-2xl font-bold mb-3">
        {event.titulo}
      </h2>

      <p className="text-zinc-600 mb-4">
        {event.descripcion || "Sin descripción"}
      </p>

      {event.iniciaEn && (
        <p className="text-sm text-zinc-500">
          {" "}
          {new Date(event.iniciaEn).toLocaleString()}
        </p>
      )}
    </div>
  );
}