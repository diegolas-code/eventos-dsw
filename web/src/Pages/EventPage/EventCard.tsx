import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { asistirEvento, cancelarAsistencia } from '../../services/asistenciaService';

type EventCardProps = {
  event: {
    id: string;
    titulo: string;
    descripcion?: string;
    linkEntradas?: string;
    iniciaEn?: string;
    imagenUrl?: string;
    categoria?: string;
    lugar?: string;
    isAsistiendo?: boolean;
  };
};

export default function EventCard({ event }: EventCardProps) {
  const queryClient = useQueryClient();
  const [isAsistiendoLocal, setIsAsistiendoLocal] = useState(!!event.isAsistiendo);

  useEffect(() => {
    setIsAsistiendoLocal(!!event.isAsistiendo);
  }, [event.isAsistiendo]);

  const asistir = useMutation({
    mutationFn: asistirEvento,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['event'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-eventos'] });
    },
    onError: () => {
      setIsAsistiendoLocal(false);
    },
  });

  const cancelar = useMutation({
    mutationFn: cancelarAsistencia,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['event'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-eventos'] });
    },
    onError: () => {
      setIsAsistiendoLocal(true);
    },
  });

  const handleAsistencia = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Toggle local state immediately for optimistic UI feel
    const targetState = !isAsistiendoLocal;
    setIsAsistiendoLocal(targetState);

    if (isAsistiendoLocal) {
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
         
        {event.linkEntradas && (
  <p className="mt-2 text-sm font-medium text-violet-600">
    🎟 Entradas disponibles
  </p>
    )}

        {/* BOTÓN */}

        {!localStorage.getItem('token') ? (
          <button
            disabled
            className="mt-4 px-4 py-2 rounded-full text-xs font-semibold border border-zinc-200 bg-zinc-50 text-zinc-400 cursor-not-allowed opacity-75"
            title="Iniciá sesión para confirmar tu asistencia"
          >
            Iniciá sesión para asistir
          </button>
        ) : (
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
      isAsistiendoLocal
        ? 'bg-red-500 text-white border-red-500 hover:bg-red-600'
        : 'bg-white text-green-600 border-green-500 hover:bg-green-50'
    }
    disabled:opacity-50
    disabled:cursor-not-allowed
  `}
          >
            {isAsistiendoLocal ? 'Cancelar asistencia' : 'Asistir'}
          </button>
        )}
      </div>
    </Link>
  );
}
