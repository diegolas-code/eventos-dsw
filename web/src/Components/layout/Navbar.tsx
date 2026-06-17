import { Link } from 'react-router-dom';

export default function Navbar() {
  const role = localStorage.getItem('demo_session_rol');
  const isModeratorOrAdmin = role === 'moderador' || role === 'admin';

  return (
    <nav
      className="
        bg-white
        border-b
        sticky
        top-0
        z-50
      "
    >
      <div
        className="
          max-w-7xl
          mx-auto
          px-6
          py-4
          flex
          items-center
          justify-between
        "
      >
        {/* Logo */}
        <Link
          to="/"
          className="text-2xl font-bold bg-gradient-to-r from-violet-600 to-pink-500 bg-clip-text text-transparent"
        >
          Cartelera
        </Link>

        {/* Links */}
        <div className="flex items-center gap-6">
          <Link
            to="/"
            className="
              text-zinc-700
              hover:text-violet-600
              transition
              font-semibold
            "
          >
            Inicio
          </Link>

          <Link
            to="/crear-evento"
            className="
              text-zinc-700
              hover:text-violet-600
              transition
              font-semibold
            "
          >
            Crear Evento
          </Link>

          {isModeratorOrAdmin && (
            <Link
              to="/moderacion"
              className="
                text-violet-600
                hover:text-violet-700
                transition
                font-bold
                flex
                items-center
                gap-1
              "
            >
              <span className="inline-block w-2 h-2 rounded-full bg-pink-500 animate-pulse"></span>
              Moderación
            </Link>
          )}

          <Link
            to="/perfil"
            className="
              text-zinc-700
              hover:text-violet-600
              transition
              font-semibold
            "
          >
            Perfil
          </Link>
        </div>
      </div>
    </nav>
  );
}
