import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="w-full border-b bg-black text-white p-4 flex gap-6">
      <Link to="/">Inicio</Link>

      <Link to="/crear-evento">
        Crear Evento
      </Link>

      <Link to="/perfil">
        Perfil
      </Link>
    </nav>
  );
}