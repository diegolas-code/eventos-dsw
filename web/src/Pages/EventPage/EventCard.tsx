import { Link } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { asistirEvento, cancelarAsistencia } from '../../services/asistenciaService';

type EventCardProps = {
  event: {
    id: string;
    titulo: string;
    descripcion?: string;
    iniciaEn?: string;
    imagenUrl?: string;
    categoria?: string;
    lugar?: string;
    isAsistiendo?: boolean;
  };
};

export default function EventCard({ event }: EventCardProps) {
  const queryClient = useQueryClient();

  const asistir = useMutation({
    mutationFn: asistirEvento,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });

  const cancelar = useMutation({
    mutationFn: cancelarAsistencia,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });

  const handleAsistencia = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (event.isAsistiendo) {
      cancelar.mutate(event.id);
    } else {
      asistir.mutate(event.id);
    }
  };

  return (
    <Link to={`/evento/${event.id}`}>
      <div className="bg-white rounded-xl shadow-md p-5 hover:shadow-xl transition cursor-pointer">
        {event.categoria && (
          <span className="inline-block mb-3 px-3 py-1 bg-violet-100 text-violet-700 rounded-full text-xs font-semibold">
            {event.categoria}
          </span>
        )}

        {event.imagenUrl && (
          <img src={event.imagenUrl} alt={event.titulo} className="w-full h-56 object-cover" />
        )}

        <h2 className="text-2xl font-bold mb-3">{event.titulo}</h2>

        <p className="text-zinc-600 mb-4">{event.descripcion || 'Sin descripción'}</p>

        {event.lugar && <p className="text-sm text-zinc-500 mb-1">📍 {event.lugar}</p>}

        {event.iniciaEn && (
          <p className="text-sm text-zinc-500">📅 {new Date(event.iniciaEn).toLocaleString()}</p>
        )}

        {/* BOTÓN */}

        <button
          onClick={handleAsistencia}
          disabled={asistir.isPending || cancelar.isPending}
          className={`
    mt-4
    px-4
    py-2
    rounded-full
    text-sm
    font-medium
    transition
    duration-200
    border
    ${
      event.isAsistiendo
        ? 'bg-red-500 text-white border-red-500 hover:bg-red-600'
        : 'bg-white text-green-600 border-green-500 hover:bg-green-50'
    }
    disabled:opacity-50
    disabled:cursor-not-allowed
  `}
        >
          {asistir.isPending || cancelar.isPending
            ? 'Procesando...'
            : event.isAsistiendo
              ? 'Cancelar asistencia'
              : 'Asistir'}
        </button>
      </div>
    </Link>
  );
}
