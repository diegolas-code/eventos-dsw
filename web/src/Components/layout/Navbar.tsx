import { Link } from "react-router-dom";

export default function Navbar() {
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
        <h1 className="text-2xl font-bold">
          Cartelera
        </h1>

        {/* Links */}
        <div className="flex items-center gap-6">
          <Link
            to="/"
            className="
              text-zinc-700
              hover:text-violet-600
              transition
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
            "
          >
            Crear Evento
          </Link>

          <Link
            to="/perfil"
            className="
              text-zinc-700
              hover:text-violet-600
              transition
            "
          >
            Perfil
          </Link>

          {/* CTA */}
          <button
            className="
              bg-violet-600
              hover:bg-violet-700
              transition
              text-white
              px-5
              py-2
              rounded-xl
            "
          >
            Explorar
          </button>
        </div>
      </div>
    </nav>
  );
}