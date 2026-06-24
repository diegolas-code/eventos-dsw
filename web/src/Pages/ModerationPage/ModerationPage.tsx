import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Check,
  X,
  Archive,
  Calendar,
  MapPin,
  User,
  MessageSquare,
  AlertCircle,
  Inbox,
  Loader2,
  Clock,
} from 'lucide-react';
import MainLayout from '../../Components/layout/MainLayout';
import { getPendingEvents, applyModerationAction } from '../../services/moderationService';

export default function ModerationPage() {
  const queryClient = useQueryClient();
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [actionError, setActionError] = useState<string | null>(null);

  // 1. Fetch pending events
  const {
    data: pendingEvents,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['pendingEvents'],
    queryFn: getPendingEvents,
  });

  // 2. Mutation for moderation actions
  const moderationMutation = useMutation({
    mutationFn: ({
      eventoId,
      accion,
      nota,
    }: {
      eventoId: string;
      accion: 'APROBAR' | 'RECHAZAR' | 'ARCHIVAR';
      nota?: string;
    }) => applyModerationAction(eventoId, accion, nota),
    onSuccess: (_, variables) => {
      // Invalidate query to refresh pending list
      queryClient.invalidateQueries({ queryKey: ['pendingEvents'] });
      // Invalidate general public events to ensure listings stay updated
      queryClient.invalidateQueries({ queryKey: ['events'] });
      // Clear note for this event
      setNotes(prev => {
        const next = { ...prev };
        delete next[variables.eventoId];
        return next;
      });
      setActionError(null);
    },
    onError: (err: any) => {
      console.error(err);
      setActionError(err.response?.data?.error ?? 'Ocurrió un error al procesar la moderación.');
    },
  });

  const handleAction = (eventoId: string, accion: 'APROBAR' | 'RECHAZAR' | 'ARCHIVAR') => {
    const nota = notes[eventoId]?.trim();
    moderationMutation.mutate({ eventoId, accion, nota: nota || undefined });
  };

  const handleNoteChange = (eventoId: string, value: string) => {
    setNotes(prev => ({ ...prev, [eventoId]: value }));
  };

  const formatDate = (dateString: string) => {
    try {
      const d = new Date(dateString);
      return d.toLocaleDateString('es-AR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateString;
    }
  };

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto py-8 px-4">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
          <div>
            <h1 className="text-4xl font-extrabold text-zinc-900 tracking-tight flex items-center gap-3">
              Panel de Moderación
              {pendingEvents && pendingEvents.length > 0 && (
                <span className="inline-flex items-center justify-center bg-pink-500 text-white text-sm font-bold px-3 py-1 rounded-full animate-bounce">
                  {pendingEvents.length}
                </span>
              )}
            </h1>
            <p className="text-zinc-500 mt-2 text-lg">
              Revisá, aprobá o rechazá las nuevas publicaciones sugeridas por la comunidad.
            </p>
          </div>
          <div className="flex items-center gap-2 bg-zinc-50 border border-zinc-200 px-4 py-2 rounded-2xl text-sm text-zinc-600 font-medium self-start">
            <Clock className="w-4 h-4 text-violet-600 animate-pulse" />
            Pendientes de revisión
          </div>
        </div>

        {/* Global Action Error */}
        {actionError && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-2xl mb-6 flex items-start gap-3 shadow-sm animate-shake">
            <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-bold">Error de moderación</p>
              <p className="text-sm">{actionError}</p>
            </div>
          </div>
        )}

        {/* Main Listing States */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-12 h-12 text-violet-600 animate-spin mb-4" />
            <p className="text-zinc-500 font-medium">Cargando publicaciones pendientes...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-100 text-red-600 p-8 rounded-[32px] text-center shadow-md">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">Error al cargar pendientes</h3>
            <p className="text-zinc-600 mb-2">
              {(error as any).response?.data?.error ??
                (error as any).message ??
                'No se pudieron cargar los eventos pendientes.'}
            </p>
            {(error as any).response?.status && (
              <p className="text-xs text-zinc-400">
                Código de estado: {(error as any).response.status}
              </p>
            )}
          </div>
        ) : pendingEvents && pendingEvents.length === 0 ? (
          <div className="bg-white border border-zinc-200 rounded-[32px] p-16 text-center shadow-sm max-w-2xl mx-auto flex flex-col items-center">
            <div className="w-20 h-20 bg-violet-50 rounded-full flex items-center justify-center mb-6 text-violet-600">
              <Inbox className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-bold text-zinc-900 mb-2">¡Todo al día!</h3>
            <p className="text-zinc-500 max-w-sm">
              No hay eventos pendientes de moderación en este momento. Buen trabajo manteniendo la
              cartelera al día.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8">
            {pendingEvents?.map(event => {
              const isMutatingThis =
                moderationMutation.isPending && moderationMutation.variables?.eventoId === event.id;

              return (
                <div
                  key={event.id}
                  className={`bg-white border border-zinc-200 rounded-[32px] overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col lg:flex-row relative ${
                    isMutatingThis ? 'opacity-60 pointer-events-none' : ''
                  }`}
                >
                  {isMutatingThis && (
                    <div className="absolute inset-0 bg-white/40 backdrop-blur-[1px] z-10 flex items-center justify-center">
                      <Loader2 className="w-10 h-10 text-violet-600 animate-spin" />
                    </div>
                  )}

                  {/* Left Column: Poster Image */}
                  <div className="w-full lg:w-1/3 min-h-[220px] bg-zinc-100 relative flex-shrink-0">
                    {event.imagenUrl ? (
                      <img
                        src={event.imagenUrl}
                        alt={event.titulo}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-violet-100 to-pink-50 flex items-center justify-center p-6 text-center">
                        <div>
                          <Clock className="w-12 h-12 text-violet-400 mx-auto mb-2 opacity-60" />
                          <span className="text-sm font-semibold text-violet-600/70">
                            Sin póster de evento
                          </span>
                        </div>
                      </div>
                    )}
                    <span className="absolute top-4 left-4 bg-zinc-900/80 backdrop-blur-md text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                      Pendiente
                    </span>
                  </div>

                  {/* Right Column: Details & Actions */}
                  <div className="p-8 flex-1 flex flex-col justify-between">
                    <div>
                      {/* Meta info */}
                      <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-500 font-semibold mb-3">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                          {formatDate(event.iniciaEn)}
                        </span>
                        {event.lugar && (
                          <span className="flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-zinc-400" />
                            {event.lugar}
                          </span>
                        )}
                        {event.creadoPorUsuarioId && (
                          <span className="flex items-center gap-1.5">
                            <User className="w-3.5 h-3.5 text-zinc-400" />
                            ID Creador: {event.creadoPorUsuarioId.substring(0, 8)}...
                          </span>
                        )}
                      </div>

                      {/* Title & Description */}
                      <h2 className="text-2xl font-bold text-zinc-900 mb-3 hover:text-violet-600 transition-colors">
                        {event.titulo}
                      </h2>
                      <p className="text-zinc-600 text-sm leading-relaxed mb-6 whitespace-pre-line">
                        {event.descripcion || 'Sin descripción provista.'}
                      </p>
                    </div>

                    {/* Moderation Controls */}
                    <div className="border-t border-zinc-100 pt-6 mt-4">
                      {/* Notes Box */}
                      <div className="mb-4">
                        <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                          <MessageSquare className="w-3.5 h-3.5" />
                          Nota / Razón de la decisión (opcional)
                        </label>
                        <textarea
                          rows={2}
                          value={notes[event.id] || ''}
                          onChange={e => handleNoteChange(event.id, e.target.value)}
                          placeholder="Escribí notas para el registro de auditoría (ej: por qué se rechaza o aprueba)..."
                          className="w-full px-4 py-2 border border-zinc-200 rounded-2xl text-sm text-black outline-none focus:border-violet-500 transition-colors resize-none placeholder-zinc-400"
                        />
                      </div>

                      {/* Action buttons */}
                      <div className="flex flex-wrap items-center gap-3 justify-end">
                        <button
                          onClick={() => handleAction(event.id, 'ARCHIVAR')}
                          className="px-5 py-2.5 rounded-2xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-semibold text-sm transition-all duration-200 flex items-center gap-2 cursor-pointer border border-zinc-200 hover:border-zinc-300"
                        >
                          <Archive className="w-4 h-4 text-zinc-500" />
                          Archivar
                        </button>
                        <button
                          onClick={() => handleAction(event.id, 'RECHAZAR')}
                          className="px-5 py-2.5 rounded-2xl bg-red-50 hover:bg-red-100 text-red-700 font-semibold text-sm transition-all duration-200 flex items-center gap-2 cursor-pointer border border-red-200 hover:border-red-300"
                        >
                          <X className="w-4 h-4 text-red-500" />
                          Rechazar
                        </button>
                        <button
                          onClick={() => handleAction(event.id, 'APROBAR')}
                          className="px-5 py-2.5 rounded-2xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-sm transition-all duration-200 flex items-center gap-2 cursor-pointer border border-emerald-200 hover:border-emerald-300"
                        >
                          <Check className="w-4 h-4 text-emerald-500" />
                          Aprobar y Publicar
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
