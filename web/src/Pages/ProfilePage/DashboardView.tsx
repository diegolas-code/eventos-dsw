import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import api from '../../services/api';
import { cancelarAsistencia } from '../../services/asistenciaService';

interface DashboardViewProps {
  usuarioData: any;
  onEditarPerfilClick: () => void;
}

export default function DashboardView({
  usuarioData,
  onEditarPerfilClick,
}: DashboardViewProps) {
  const queryClient = useQueryClient();

  const esEntidad = usuarioData?.perfiles && usuarioData.perfiles.length > 0;
  const perfilId = esEntidad ? usuarioData.perfiles[0].id : null;

  const {
    data: eventos,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['dashboard-eventos', usuarioData?.id],
    queryFn: async () => {
      try {
        if (esEntidad) {
          const response = await api.get('/eventos', {
            params: { entidadId: perfilId },
          });

          return (response.data.data || []).map((e: any) => ({
            id: e.id,
            titulo: e.titulo,
            imagen_url: e.imagenUrl || e.imagen_url || '',
            inicia_en: e.iniciaEn || e.inicia_en,
          }));
        }

        const response = await api.get('/asistencias/mis-eventos');

        return (response.data.data || [])
          .filter((item: any) => item && item.evento)
          .map((item: any) => ({
            id: item.evento.id,
            titulo: item.evento.titulo,
            imagen_url: item.evento.imagen_url || item.evento.imagenUrl || '',
            inicia_en: item.evento.inicia_en || item.evento.iniciaEn,
          }));
      } catch (err) {
        console.error(err);
        throw err;
      }
    },
    enabled: !!usuarioData?.id,
  });

  const cancelar = useMutation({
    mutationFn: cancelarAsistencia,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['dashboard-eventos', usuarioData?.id],
      });

      queryClient.invalidateQueries({
        queryKey: ['events'],
      });

      queryClient.invalidateQueries({
        queryKey: ['event'],
      });
    },
  });

  const handleCancelarAsistencia = (eventoId: string) => {
    if (!window.confirm('¿Cancelar asistencia a este evento?')) return;

    cancelar.mutate(eventoId);
  };

  const handleEliminarEvento = async (eventoId: string) => {
    if (window.confirm('¿Estás seguro de que querés eliminar este evento?')) {
      try {
        await api.delete(`/eventos/${eventoId}`);

        alert('Evento eliminado con éxito');

        queryClient.invalidateQueries({
          queryKey: ['dashboard-eventos', usuarioData?.id],
        });
      } catch (err) {
        console.error(err);
        alert('No se pudo eliminar el evento');
      }
    }
  };

  return (
    <div className="max-w-4xl w-full mx-auto bg-white border border-zinc-200 p-8 rounded-[32px] shadow-md mt-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-4 border-b border-zinc-100">
        <div>
          <h2 className="text-2xl font-bold text-zinc-900">
            {esEntidad
              ? `Panel de ${usuarioData.perfiles[0].nombre}`
              : 'Mi Agenda de Eventos'}
          </h2>

          <p className="text-xs text-zinc-500 mt-0.5">
            {esEntidad
              ? 'Gestioná tus publicaciones y datos comerciales.'
              : 'Eventos a los que planeás asistir.'}
          </p>
        </div>

        {esEntidad && (
          <button
            onClick={onEditarPerfilClick}
            className="bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-bold px-4 py-2 rounded-xl transition-colors"
          >
            Editar Datos del Perfil
          </button>
        )}
      </div>

      {isLoading ? (
        <p className="text-sm text-zinc-500">Cargando eventos...</p>
      ) : error ? (
        <p className="text-sm text-red-500">
          Error al cargar la lista de eventos.
        </p>
      ) : eventos?.length === 0 || !eventos ? (
        <div className="text-center py-10 bg-zinc-50 rounded-2xl border border-dashed border-zinc-200">
          <p className="text-sm text-zinc-500">
            {esEntidad
              ? 'Aún no publicaste ningún evento.'
              : 'Todavía no guardaste ningún evento en tu agenda.'}
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {eventos.map((evento: any) => (
            <div
              key={evento.id}
              className="flex justify-between items-center bg-zinc-50 p-4 rounded-2xl border border-zinc-100 hover:border-zinc-200 transition-all"
            >
              <div className="flex items-center gap-4">
                {evento.imagen_url && (
                  <img
                    src={evento.imagen_url}
                    alt={evento.titulo}
                    className="w-16 h-16 object-cover rounded-xl bg-zinc-200"
                  />
                )}

                <div>
                  <h4 className="font-bold text-zinc-900 text-base">
                    {evento.titulo}
                  </h4>

                  <p className="text-xs text-zinc-500 mt-0.5">
                    {new Date(evento.inicia_en).toLocaleDateString('es-AR', {
                      day: '2-digit',
                      month: 'long',
                    })}
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                {esEntidad ? (
                  <>
                    <button
                      onClick={() =>
                        alert(
                          `Redireccionar a edición de evento ${evento.id}`
                        )
                      }
                      className="bg-white hover:bg-zinc-100 border border-zinc-200 text-zinc-700 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
                    >
                      Editar
                    </button>

                    <button
                      onClick={() => handleEliminarEvento(evento.id)}
                      className="bg-red-50 hover:bg-red-100 text-red-600 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
                    >
                      Eliminar
                    </button>
                  </>
                ) : (
                 <div className="flex items-center gap-2">
  <span className="bg-violet-50 text-violet-700 text-xs font-bold px-3 py-1.5 rounded-full">
    ✓ Agendado
  </span>

  <button
    onClick={() => handleCancelarAsistencia(evento.id)}
    disabled={cancelar.isPending}
    className="
      bg-red-50
      hover:bg-red-100
      text-red-600
      text-xs
      font-semibold
      px-3
      py-1.5
      rounded-lg
      transition-colors
      disabled:opacity-50
    "
  >
    Cancelar asistencia
  </button>
</div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}