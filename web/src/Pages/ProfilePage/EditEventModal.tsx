import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X } from 'lucide-react';
import api from '../../services/api';

interface EditEventModalProps {
  evento: any;
  onClose: () => void;
  usuarioId: string;
}

export default function EditEventModal({ evento, onClose, usuarioId }: EditEventModalProps) {
  const queryClient = useQueryClient();
  const [titulo, setTitulo] = useState(evento.titulo);
  const [descripcion, setDescripcion] = useState(evento.descripcion || '');

  const mutation = useMutation({
    mutationFn: async (data: { titulo: string; descripcion: string }) => {
      await api.patch(`/eventos/${evento.id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['event', evento.id] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-eventos', usuarioId] });
      onClose();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!titulo.trim()) return alert('El título es obligatorio');
    mutation.mutate({
      titulo: titulo.trim(),
      descripcion: descripcion.trim(),
    });
  };

  return (
    <div className="fixed inset-0 bg-zinc-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 transition-all duration-300">
      <div className="bg-white max-w-lg w-full rounded-[32px] border border-zinc-200 shadow-2xl p-8 relative animate-in fade-in zoom-in duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          type="button"
          className="absolute top-6 right-6 p-2 rounded-full hover:bg-zinc-100 text-zinc-400 hover:text-zinc-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <div className="mb-6">
          <h3 className="text-2xl font-bold text-zinc-900">Editar Detalles del Evento</h3>
          <p className="text-xs text-zinc-500 mt-1">
            Realizá los cambios necesarios en tu publicación.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-zinc-700 mb-1.5">
              Título del Evento *
            </label>
            <input
              type="text"
              value={titulo}
              onChange={e => setTitulo(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 text-zinc-900 text-sm transition-all"
              placeholder="Ej. Concierto Acústico..."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-zinc-700 mb-1.5">Descripción</label>
            <textarea
              value={descripcion}
              onChange={e => setDescripcion(e.target.value)}
              rows={4}
              className="w-full px-4 py-3 rounded-xl border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 text-zinc-900 text-sm transition-all"
              placeholder="Contale a tu público los detalles de este evento..."
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-zinc-200 text-zinc-700 font-medium hover:bg-zinc-50 transition-colors text-sm"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={mutation.isPending}
              className="px-6 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-medium shadow-sm transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {mutation.isPending ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
