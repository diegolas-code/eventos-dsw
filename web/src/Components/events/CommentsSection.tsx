import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getComentariosByEvento,
  createComentario,
  deleteComentario,
} from '../../services/comentarioService';

interface CommentsSectionProps {
  eventId: string;
}

export default function CommentsSection({ eventId }: CommentsSectionProps) {
  const queryClient = useQueryClient();
  const [cuerpo, setCuerpo] = useState('');

  const currentUserId = localStorage.getItem('demo_session_id');
  const isUserLoggedIn = !!localStorage.getItem('token') && !!currentUserId;

  const {
    data: comments = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['comments', eventId],
    queryFn: () => getComentariosByEvento(eventId),
    enabled: !!eventId,
  });

  const createMutation = useMutation({
    mutationFn: (newCuerpo: string) =>
      createComentario(eventId, {
        cuerpo: newCuerpo,
        usuarioId: currentUserId!,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', eventId] });
      setCuerpo('');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (commentId: string) => deleteComentario(commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', eventId] });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cuerpo.trim() || createMutation.isPending) return;
    createMutation.mutate(cuerpo);
  };

  const handleDelete = (commentId: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este comentario?')) {
      deleteMutation.mutate(commentId);
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    return name.trim().charAt(0).toUpperCase();
  };

  // Helper function to pick a consistent background color for initials
  const getAvatarBg = (name?: string) => {
    const colors = [
      'bg-red-100 text-red-700',
      'bg-blue-100 text-blue-700',
      'bg-green-100 text-green-700',
      'bg-yellow-100 text-yellow-700',
      'bg-purple-100 text-purple-700',
      'bg-pink-100 text-pink-700',
      'bg-indigo-100 text-indigo-700',
    ];
    if (!name) return colors[0];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  return (
    <div className="mt-8 border-t border-zinc-100 pt-8">
      <h2 className="text-2xl font-bold mb-6 text-zinc-800">Comentarios ({comments.length})</h2>

      {/* Formulario para agregar comentario */}
      <div className="mb-8">
        {isUserLoggedIn ? (
          <form onSubmit={handleSubmit} className="space-y-3">
            <textarea
              value={cuerpo}
              onChange={e => setCuerpo(e.target.value)}
              placeholder="Escribe tu comentario..."
              className="w-full p-4 border border-zinc-200 rounded-2xl focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none transition resize-none h-24"
              maxLength={500}
            />
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={!cuerpo.trim() || createMutation.isPending}
                className="px-6 py-2.5 bg-violet-600 hover:bg-violet-700 text-white font-medium rounded-xl transition shadow-sm hover:shadow disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {createMutation.isPending ? 'Publicando...' : 'Comentar'}
              </button>
            </div>
          </form>
        ) : (
          <div className="bg-zinc-50 border border-zinc-100 rounded-2xl p-6 text-center">
            <p className="text-zinc-600">
              Debes iniciar sesión para dejar un comentario en este evento.
            </p>
          </div>
        )}
      </div>

      {/* Listado de comentarios */}
      {isLoading ? (
        <p className="text-zinc-500 text-center py-4">Cargando comentarios...</p>
      ) : isError ? (
        <p className="text-red-500 text-center py-4">Error al cargar los comentarios.</p>
      ) : comments.length === 0 ? (
        <p className="text-zinc-500 text-center py-6">
          Aún no hay comentarios. ¡Sé el primero en comentar!
        </p>
      ) : (
        <div className="space-y-6">
          {comments.map((comment: any) => {
            const authorName = comment.usuario?.nombreMostrar || 'Usuario Anónimo';
            const isOwner = comment.usuarioId === currentUserId;

            return (
              <div
                key={comment.id}
                className="flex gap-4 p-4 rounded-2xl bg-white hover:bg-zinc-50 transition border border-zinc-50"
              >
                {/* Avatar */}
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${getAvatarBg(
                    authorName
                  )}`}
                >
                  {getInitials(authorName)}
                </div>

                {/* Contenido del comentario */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="font-semibold text-zinc-800 text-sm truncate">
                      {authorName}
                    </span>
                    <span className="text-xs text-zinc-400 shrink-0">
                      {new Date(comment.creadoEn).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-zinc-700 text-sm leading-relaxed break-words whitespace-pre-line">
                    {comment.cuerpo}
                  </p>
                </div>

                {/* Acciones */}
                {isOwner && (
                  <div className="shrink-0 flex items-start">
                    <button
                      onClick={() => handleDelete(comment.id)}
                      disabled={deleteMutation.isPending}
                      className="p-1 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                      title="Eliminar comentario"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-5 h-5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                        />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
