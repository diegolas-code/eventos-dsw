import { useState, useEffect } from 'react';
import { api } from '../../services/api';

interface ProfileViewProps {
  userEmail: string;
  usuarioData: any;
  onLogout: () => void;
  onUsuarioActualizado: () => void; // Refresca userQuery
  onCreatePerfilClick: () => void;
  highlightBanner?: boolean;
}

export default function ProfileView({
  userEmail,
  usuarioData,
  onLogout,
  onUsuarioActualizado,
  onCreatePerfilClick,
  highlightBanner,
}: ProfileViewProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [nombre, setNombre] = useState(usuarioData?.nombreMostrar || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (usuarioData) {
      setNombre(usuarioData.nombreMostrar || '');
    }
  }, [usuarioData]);

  const handleGuardarCambios = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Actualiza cuenta personal usando el id del backend
      await api.patch(`/usuarios/${usuarioData?.id}`, { nombreMostrar: nombre });

      setIsEditing(false);
      onUsuarioActualizado(); // Refresca datos en pantalla
    } catch (err: any) {
      console.error(err);
      setError('No se pudieron guardar los cambios. Intenta de nuevo');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl w-full mx-auto bg-white border border-zinc-200 p-8 rounded-[32px] shadow-md">
      {/* Encabezado */}
      <div className="flex justify-between items-center mb-6 pb-4 border-b border-zinc-100">
        <h2 className="text-3xl font-bold text-zinc-900">Mi Perfil</h2>
        <button
          onClick={onLogout}
          className="bg-zinc-100 hover:bg-zinc-200 text-zinc-700 px-5 py-2.5 rounded-2xl text-sm font-medium transition-colors"
        >
          Cerrar Sesión
        </button>
      </div>

      <div className="space-y-6">
        {/* Sección Datos de Cuenta Personal */}
        <div className="bg-zinc-50 p-6 rounded-2xl border border-zinc-200 space-y-5 mb-6">
          <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider">
            Datos de la Cuenta
          </h3>

          <div>
            <p className="text-xs text-zinc-500 font-medium">Email institucional / personal</p>
            <p className="text-base text-zinc-900 font-semibold mt-0.5">{userEmail}</p>
          </div>

          <div className="border-t border-zinc-200 pt-4">
            {isEditing ? (
              <form onSubmit={handleGuardarCambios} className="space-y-3">
                <div>
                  <label className="text-xs text-zinc-500 font-medium block mb-1">
                    Nombre Completo
                  </label>
                  <input
                    type="text"
                    value={nombre}
                    onChange={e => setNombre(e.target.value)}
                    className="w-full bg-white border border-zinc-300 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-violet-500 transition-colors"
                    placeholder="Tu nombre completo"
                    required
                  />
                </div>

                {error && <p className="text-xs text-red-500">{error}</p>}

                <div className="flex gap-2 pt-1">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-violet-600 hover:bg-violet-700 text-white font-medium text-xs px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                  >
                    {isSubmitting ? 'Guardando...' : 'Guardar'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      setNombre(usuarioData?.nombre_mostrar || usuarioData?.nombre || '');
                    }}
                    className="bg-zinc-200 hover:bg-zinc-300 text-zinc-700 font-medium text-xs px-4 py-2 rounded-lg transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            ) : (
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-xs text-zinc-500 font-medium">Nombre de Usuario</p>
                  <p className="text-base text-zinc-900 font-semibold mt-0.5">
                    {usuarioData?.nombreMostrar || (
                      <span className="text-zinc-400 italic font-normal">Sin asignar</span>
                    )}
                  </p>
                </div>
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-xs text-violet-600 font-bold hover:underline mb-0.5"
                >
                  Editar nombre
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Sección Crear Perfil de Entidad (Solo se muestra condicionalmente) */}
        {(!usuarioData?.perfiles || usuarioData.perfiles.length === 0) && (
          <div
            id="banner-comercial"
            className={`p-8 rounded-[24px] border text-center transition-all duration-500 ${
              highlightBanner
                ? 'bg-violet-100 border-violet-500 border-2 scale-[1.02] ring-4 ring-violet-200 animate-pulse'
                : 'bg-zinc-50 border-dashed border-zinc-300'
            }`}
          >
            {highlightBanner && (
              <span className="inline-block bg-violet-600 text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full mb-3 animate-bounce">
                Requerido para crear eventos
              </span>
            )}

            <h3 className="text-lg font-bold text-zinc-800 mb-2">
              ¿Sos artista o dueño de un lugar?
            </h3>
            <p className="text-sm text-zinc-500 max-w-sm mx-auto mb-5">
              Crea tu perfil de entidad ahora para empezar a gestionar y publicar tus propios
              eventos en la cartelera.
            </p>
            <button
              onClick={onCreatePerfilClick}
              className="bg-violet-600 hover:bg-violet-700 text-white font-medium text-sm px-6 py-3 rounded-xl transition-colors shadow-sm"
            >
              Crear Perfil de Entidad
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
