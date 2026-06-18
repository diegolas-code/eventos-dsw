import { Link } from 'react-router-dom';

type EventCardProps = {
  event: {
    id: string;
    titulo: string;
    descripcion?: string;
    iniciaEn?: string;
    imagenUrl?: string;
    categoria?: string;
    lugar?: string;
  };
};

export default function EventCard({ event }: EventCardProps) {
  return (
    <Link to={`/evento/${event.id}`}>
      <div
        className="
          bg-white
          rounded-xl
          shadow-md
          p-5
          hover:shadow-xl
          transition
          cursor-pointer
        "
      >
{event.categoria && (
  <span
    className="
      inline-block
      mb-3
      px-3
      py-1
      bg-violet-100
      text-violet-700
      rounded-full
      text-xs
      font-semibold
    "
  >
    {event.categoria}
  </span>
)}

        {event.imagenUrl && (
          <img
            src={event.imagenUrl}
            alt={event.titulo}
            className="
          w-full
          h-56
          object-cover
        "
          />
        )}
        <h2 className="text-2xl font-bold mb-3">{event.titulo}</h2>

        <p className="text-zinc-600 mb-4">{event.descripcion || 'Sin descripción'}</p>
{event.lugar && (
  <p className="text-sm text-zinc-500 mb-1">
    📍 {event.lugar}
  </p>
)}
        {event.iniciaEn && (
          <p className="text-sm text-zinc-500">📅 {new Date(event.iniciaEn).toLocaleString()}</p>
        )}
      </div>
    </Link>
  );
}
