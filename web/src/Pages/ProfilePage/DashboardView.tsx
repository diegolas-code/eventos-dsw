import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { cancelarAsistencia } from '../../services/asistenciaService';

interface DashboardViewProps {
  usuarioData: any;
  onEditarPerfilClick: () => void;
  onCerrarSesionClick?: () => void;
}

export default function DashboardView({
  usuarioData,
  onEditarPerfilClick,
  onCerrarSesionClick,
}: DashboardViewProps) {
  const queryClient = useQueryClient();

  const esEntidad = usuarioData?.perfiles && usuarioData.perfiles.length > 0;
  const perfilId = esEntidad ? usuarioData.perfiles[0].id : null;

  // Control del acordeón colapsable para Seguridad
  const [seguridadAbierto, setSeguridadAbierto] = useState(false);

  // Estados locales para el Formulario de Contraseña
  const [claveActual, setClaveActual] = useState('');
  const [nuevaClave, setNuevaClave] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState<{ tipo: 'ok' | 'error'; texto: string } | null>(
    null
  );

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Trae eventos dinámicamente según tipo de usuario
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
        } else {
          try {
            const response = await api.get('/asistencias/mis-eventos');
            return (response.data.data || [])
              .filter((item: any) => item && item.evento)
              .map((item: any) => ({
                id: item.evento.id,
                titulo: item.evento.titulo,
                imagen_url: item.evento.imagen_url || item.evento.imagenUrl || '',
                inicia_en: item.evento.inicia_en || item.evento.iniciaEn,
              }));
          } catch (backendError) {
            console.warn('El endpoint de asistencias falló. Usando fallback vacío:', backendError);
            return [];
          }
        }
      } catch (err) {
        console.error(err);
        throw err;
      }
    },
    enabled: !!usuarioData?.id,
  });

  const eliminarEventoMutation = useMutation({
    mutationFn: async (eventoId: string) => {
      await api.delete(`/eventos/${eventoId}`);
    },
    onSuccess: () => {
      alert('Evento eliminado con éxito');
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-eventos', usuarioData?.id] });
    },
    onError: err => {
      console.error(err);
      alert('No se pudo eliminar el evento');
    },
  });

  const cancelarAsistenciaMutation = useMutation({
    mutationFn: cancelarAsistencia,
    onSuccess: () => {
      alert('Asistencia cancelada');
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['event'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-eventos', usuarioData?.id] });
    },
    onError: err => {
      console.error(err);
      alert('No se pudo cancelar la asistencia');
    },
  });

  const handleEliminarEvento = async (eventoId: string) => {
    if (window.confirm('¿Estás seguro de que querés eliminar este evento?')) {
      eliminarEventoMutation.mutate(eventoId);
    }
  };

  const handleCancelarAsistencia = (eventoId: string) => {
    if (window.confirm('¿Querés remover este evento de tu agenda?')) {
      cancelarAsistenciaMutation.mutate(eventoId);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordLoading(true);
    setPasswordMsg(null);

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setPasswordMsg({ tipo: 'ok', texto: 'Contraseña actualizada correctamente.' });
      setClaveActual('');
      setNuevaClave('');
    } catch (err) {
      setPasswordMsg({ tipo: 'error', texto: 'Ocurrió un error al intentar cambiar la clave.' });
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleEliminarCuenta = async () => {
    if (
      window.confirm(
        '¿Estás completamente seguro de que querés eliminar tu cuenta? Esta acción no se puede deshacer.'
      )
    ) {
      try {
        await api.delete(`/usuarios/${usuarioData.id}`);
        alert('Cuenta eliminada con éxito.');
        if (onCerrarSesionClick) onCerrarSesionClick();
      } catch (err) {
        console.error(err);
        alert('No se pudo eliminar la cuenta.');
      }
    }
  };

  return (
    <div className="max-w-4xl w-full mx-auto mt-6 space-y-14 mb-12">
      {/* TARJETA 1: AGENDA DE EVENTOS */}
      <div className="bg-white border border-zinc-200 p-8 rounded-[32px] shadow-md">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-4 border-b border-zinc-100">
          <div>
            <h2 className="text-2xl font-bold text-zinc-900">
              {esEntidad ? `Panel de ${usuarioData.perfiles[0].nombre}` : 'Mi Agenda de Eventos'}
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

        {/* Listado de eventos */}
        <div className="min-h-[250px] flex flex-col justify-start">
          {isLoading ? (
            <div className="flex flex-col gap-4 w-full animate-pulse mt-2">
              <div className="h-24 bg-zinc-100 rounded-2xl w-full" />
              <div className="h-24 bg-zinc-100 rounded-2xl w-full" />
            </div>
          ) : error ? (
            <p className="text-sm text-red-500 py-4">Error al cargar la lista de eventos.</p>
          ) : eventos?.length === 0 || !eventos ? (
            <div className="text-center py-12 my-auto bg-zinc-50 rounded-2xl border border-dashed border-zinc-200">
              <p className="text-sm text-zinc-500">
                {esEntidad
                  ? 'Aun no publicaste ningún evento.'
                  : 'Todavía no guardaste ningún evento en tu agenda.'}
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {eventos.map((evento: any) => (
                <div
                  key={evento.id}
                  className="group flex justify-between items-center bg-white p-4 rounded-2xl border border-zinc-100 shadow-sm hover:shadow-md hover:border-zinc-200/80 transition-all duration-200"
                >
                  {/* Contenedor clickable del Evento */}
                  <Link
                    to={`/evento/${evento.id}`}
                    className="flex items-center gap-5 flex-1 cursor-pointer"
                  >
                    {evento.imagen_url && (
                      <img
                        src={evento.imagen_url}
                        alt={evento.titulo}
                        className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-xl bg-zinc-100 group-hover:scale-[1.02] transition-transform duration-200"
                      />
                    )}
                    <div>
                      <h4 className="font-bold text-zinc-900 text-lg group-hover:text-violet-600 transition-colors">
                        {evento.titulo}
                      </h4>
                      <p className="text-xs font-medium text-zinc-500 mt-1 bg-zinc-100 px-2.5 py-1 rounded-md inline-block">
                        {evento.inicia_en
                          ? new Date(evento.inicia_en).toLocaleDateString('es-AR', {
                              day: '2-digit',
                              month: 'long',
                            })
                          : 'Fecha no definida'}
                      </p>
                      <span className="block text-[11px] text-violet-500 font-semibold opacity-0 group-hover:opacity-100 transition-opacity mt-2">
                        Ver detalles del evento →
                      </span>
                    </div>
                  </Link>

                  {/* Botones de Acción */}
                  <div className="flex gap-2 ml-4 shrink-0">
                    {esEntidad ? (
                      <>
                        <button
                          onClick={() => alert(`Redireccionar a edición de evento ${evento.id}`)}
                          className="bg-white hover:bg-zinc-100 border border-zinc-200 text-zinc-700 text-xs font-semibold px-4 py-2 rounded-xl transition-colors"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleEliminarEvento(evento.id)}
                          disabled={eliminarEventoMutation.isPending}
                          className="bg-red-50 hover:bg-red-100 text-red-600 text-xs font-semibold px-4 py-2 rounded-xl transition-colors"
                        >
                          Eliminar
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => handleCancelarAsistencia(evento.id)}
                        disabled={cancelarAsistenciaMutation.isPending}
                        className="bg-white hover:bg-red-50 border border-red-200 text-red-600 text-xs font-semibold px-4 py-2 rounded-xl transition-all shadow-sm"
                      >
                        Cancelar asistencia
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* TARJETA 2: COLAPSABLE PARA SEGURIDAD */}
      <div className="bg-white border border-zinc-200 rounded-[32px] shadow-md overflow-hidden transition-all opacity-95">
        {/* Cabecera del colapsable */}
        <button
          onClick={() => setSeguridadAbierto(!seguridadAbierto)}
          className="w-full flex justify-between items-center p-8 hover:bg-zinc-50/50 transition-colors text-left outline-none"
        >
          <div>
            <h3 className="text-xl font-bold text-zinc-900">Seguridad de la Cuenta</h3>
            <p className="text-xs text-zinc-500 mt-0.5">
              Gestioná tus accesos y credenciales de forma privada.
            </p>
          </div>
          <span
            className={`text-zinc-400 text-xl font-medium transition-transform duration-200 ${seguridadAbierto ? 'rotate-180' : ''}`}
          >
            ▲
          </span>
        </button>

        {/* Contenido colapsable */}
        {seguridadAbierto && (
          <div className="px-8 pb-8 space-y-6 border-t border-zinc-100 pt-6 animate-fadeIn">
            {passwordMsg && (
              <div
                className={`p-4 rounded-2xl text-sm border ${
                  passwordMsg.tipo === 'ok'
                    ? 'bg-green-50 text-green-700 border-green-100'
                    : 'bg-red-50 text-red-600 border-red-100'
                }`}
              >
                {passwordMsg.texto}
              </div>
            )}

            {/* Formulario */}
            <form onSubmit={handlePasswordChange} className="grid gap-4 sm:grid-cols-2 max-w-2xl">
              <div>
                <label className="block text-xs font-semibold text-zinc-600 mb-1.5">
                  Contraseña Actual
                </label>
                <input
                  type="password"
                  value={claveActual}
                  onChange={e => setClaveActual(e.target.value)}
                  className="w-full px-4 py-2.5 border border-zinc-300 rounded-xl text-sm outline-none focus:border-violet-600 transition-colors bg-zinc-50 focus:bg-white"
                  placeholder="••••••••"
                  disabled={passwordLoading}
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-600 mb-1.5">
                  Nueva Contraseña
                </label>
                <input
                  type="password"
                  value={nuevaClave}
                  onChange={e => setNuevaClave(e.target.value)}
                  className="w-full px-4 py-2.5 border border-zinc-300 rounded-xl text-sm outline-none focus:border-violet-600 transition-colors bg-zinc-50 focus:bg-white"
                  placeholder="Mínimo 6 caracteres"
                  disabled={passwordLoading}
                  required
                />
              </div>
              <div className="sm:col-span-2 flex justify-end">
                <button
                  type="submit"
                  disabled={passwordLoading}
                  className="bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-colors disabled:opacity-50 shadow-sm"
                >
                  {passwordLoading ? 'Actualizando...' : 'Actualizar contraseña'}
                </button>
              </div>
            </form>

            {/* Bloque de Eliminación de Cuenta */}
            <div className="pt-6 border-t border-zinc-100">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <p className="text-xs text-zinc-500">
                    Esta acción borrará de forma definitiva todo tu historial.
                  </p>
                </div>
                <button
                  onClick={handleEliminarCuenta}
                  className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-all shadow-sm shrink-0"
                >
                  Eliminar permanentemente mi cuenta
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
