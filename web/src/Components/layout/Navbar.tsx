import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="w-full bg-black text-white shadow-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
        
        <h1 className="text-2xl font-bold">
          Eventos DSW
        </h1>

        <div className="flex items-center gap-6">
          <Link
            to="/"
            className="hover:text-zinc-300 transition"
          >
            Inicio
          </Link>

          <Link
            to="/crear-evento"
            className="hover:text-zinc-300 transition"
          >
            Crear Evento
          </Link>

          <Link
            to="/perfil"
            className="hover:text-zinc-300 transition"
          >
            Perfil
          </Link>
        </div>
      </div>
    </nav>
  );
}