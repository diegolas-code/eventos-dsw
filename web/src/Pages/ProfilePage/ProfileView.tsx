interface ProfileViewProps {
  userEmail: string;
  onLogout: () => void;
}

export default function ProfileView({ userEmail, onLogout }: ProfileViewProps) {
  return (
    <div className="max-w-2xl w-full mx-auto bg-white border border-zinc-200 p-8 rounded-[32px] shadow-md">
      <div className="flex justify-between items-center mb-6 pb-4 border-b border-zinc-100">
        <h2 className="text-3xl font-bold text-zinc-900">Mi Perfil</h2>
        <button
          onClick={onLogout}
          className="bg-zinc-100 hover:bg-zinc-200 text-zinc-700 px-5 py-2.5 rounded-2xl text-sm font-medium transition-colors"
        >
          Cerrar Sesión
        </button>
      </div>

      <div className="space-y-4">
        <div className="bg-violet-50 p-5 rounded-2xl border border-violet-100">
          <p className="text-xs text-violet-600 uppercase tracking-wider font-bold">Email</p>
          <p className="text-xl text-zinc-900 font-semibold mt-1">{userEmail}</p>
        </div>

        <div className="bg-zinc-50 p-8 rounded-[24px] border border-dashed border-zinc-300 text-center">
          <h3 className="text-lg font-bold text-zinc-800 mb-2">
            ¿Sos artista o dueño de un lugar?
          </h3>
          <p className="text-sm text-zinc-500 max-w-sm mx-auto mb-5">
            Próximamente vas a poder reclamar o crear tu perfil para gestionar tus propios eventos.
          </p>
          <button
            disabled
            className="bg-zinc-200 text-zinc-400 font-medium text-sm px-5 py-2.5 rounded-xl cursor-not-allowed"
          >
            Crear Perfil de Entidad
          </button>
        </div>
      </div>
    </div>
  );
}
