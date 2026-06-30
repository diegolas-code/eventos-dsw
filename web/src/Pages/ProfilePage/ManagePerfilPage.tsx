import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createPerfilEntidad, updatePerfilEntidad } from '../../services/perfilService';

interface ManagePerfilPageProps {
  perfilInicial?: {
    id: string;
    nombre: string;
    descripcion: string;
    direccion?: string;
    gmapsUrl?: string;
    imagenUrl?: string;
    tipo?: 'ARTISTA' | 'LUGAR';
  };
  onBack: () => void;
}

export default function ManagePerfilPage({ perfilInicial, onBack }: ManagePerfilPageProps) {
  const queryClient = useQueryClient();

  const [nombre, setNombre] = useState(perfilInicial?.nombre ?? '');
  const [tipo, setTipo] = useState<'ARTISTA' | 'LUGAR'>(perfilInicial?.tipo ?? 'ARTISTA');
  const [descripcion, setDescripcion] = useState(perfilInicial?.descripcion ?? '');
  const [direccion, setDireccion] = useState(perfilInicial?.direccion ?? '');
  const [gmapsUrl, setGmapsUrl] = useState(perfilInicial?.gmapsUrl ?? '');
  const [imagenUrl, setImagenUrl] = useState(perfilInicial?.imagenUrl ?? '');

  const usuarioId = localStorage.getItem('demo_session_id') || undefined;

  const mutation = useMutation({
    mutationFn: (data: any) => {
      if (perfilInicial?.id) {
        return updatePerfilEntidad(perfilInicial?.id, data);
      } else {
        return createPerfilEntidad({
          usuarioId,
          nombre: data.nombre,
          tipo: data.tipo,
          descripcion: data.descripcion,
          direccion: data.direccion,
          gmapsUrl: data.gmapsUrl,
          imagenUrl: data.imagenUrl,
        });
      }
    },
    onSuccess: () => {
      //Invalida consultas para refrescar datos publicos en app
      queryClient.invalidateQueries({ queryKey: ['usuario-actual'] });
      alert(perfilInicial ? '¡Perfil actualizado con éxito!' : '¡Perfil creado con éxito!');
      onBack();
    },
    onError: () => {
      alert('Hubo un error al guardar los cambios del perfil.');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) return alert('El nombre es obligatorio');

    mutation.mutate({
      nombre,
      tipo,
      descripcion,
      direccion,
      gmapsUrl,
      imagenUrl,
    });
  };

  return (
    <div className="max-w-2xl w-full mx-auto bg-white border border-zinc-200 p-8 rounded-[32px] shadow-md my-6">
      <div className="flex justify-between items-center mb-6 pb-4 border-b border-zinc-100">
        <h2 className="text-3xl font-bold text-zinc-900">
          {perfilInicial ? 'Editar Perfil de Entidad' : 'Crear Perfil de Entidad'}
        </h2>
        <button
          onClick={onBack}
          className="bg-zinc-100 hover:bg-zinc-200 text-zinc-700 px-4 py-2 rounded-xl text-sm font-medium transition-colors"
        >
          Volver
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {!perfilInicial && (
          <div>
            <label className="block text-sm font-semibold text-zinc-700 mb-1">
              Tipo de Entidad *
            </label>
            <select
              value={tipo}
              onChange={e => setTipo(e.target.value as 'ARTISTA' | 'LUGAR')}
              className="w-full px-4 py-3 rounded-xl border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-violet-500 text-zinc-900 bg-white"
              required
            >
              <option value="ARTISTA">Artista / Banda</option>
              <option value="LUGAR">Lugar / Centro Cultural / Teatro</option>
            </select>
          </div>
        )}

        <div>
          <label className="block text-sm font-semibold text-zinc-700 mb-1">
            Nombre de la Entidad *
          </label>
          <input
            type="text"
            value={nombre}
            onChange={e => setNombre(e.target.value)}
            placeholder="Ej. Banda de Rock, Teatro Municipal..."
            className="w-full px-4 py-3 rounded-xl border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-violet-500 text-zinc-900"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-zinc-700 mb-1">Descripción</label>
          <textarea
            value={descripcion}
            onChange={e => setDescripcion(e.target.value)}
            placeholder="Contale a tu público quién sos o qué ofrece tu espacio..."
            rows={4}
            className="w-full px-4 py-3 rounded-xl border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-violet-500 text-zinc-900"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-zinc-700 mb-1">
            Dirección Física (Si aplica)
          </label>
          <input
            type="text"
            value={direccion}
            onChange={e => setDireccion(e.target.value)}
            placeholder="Ej. Av. Colón 1234, Mar del Plata"
            className="w-full px-4 py-3 rounded-xl border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-violet-500 text-zinc-900"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-zinc-700 mb-1">
            URL de Google Maps
          </label>
          <input
            type="url"
            value={gmapsUrl}
            onChange={e => setGmapsUrl(e.target.value)}
            placeholder="https://maps.google.com/..."
            className="w-full px-4 py-3 rounded-xl border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-violet-500 text-zinc-900"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-zinc-700 mb-1">
            URL de la Imagen de Perfil
          </label>
          <input
            type="url"
            value={imagenUrl}
            onChange={e => setImagenUrl(e.target.value)}
            placeholder="https://cloudinary.com/foto.jpg"
            className="w-full px-4 py-3 rounded-xl border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-violet-500 text-zinc-900"
          />
        </div>

        <button
          type="submit"
          disabled={mutation.isPending}
          className="w-full bg-violet-600 hover:bg-violet-700 text-white font-medium py-3 rounded-xl transition-colors shadow-sm disabled:bg-violet-400"
        >
          {mutation.isPending ? 'Guardando cambios...' : 'Guardar Perfil'}
        </button>
      </form>
    </div>
  );
}
