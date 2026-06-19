import { Link } from 'react-router-dom';
import { useState } from "react";
import { Menu, X } from "lucide-react";


export default function Navbar() {
  const [open, setOpen] = useState(false);

  const role = localStorage.getItem('demo_session_rol');

  const isModeratorOrAdmin =
    role === 'moderador' ||
    role === 'admin';

  return (
    <nav
      className="
        bg-white/95
        backdrop-blur-md
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
          px-4
          md:px-6
          py-4
        "
      >
        <div
          className="
            flex
            items-center
            justify-between
          "
        >
          <Link
            to="/"
            className="
              text-2xl
              font-bold
              bg-gradient-to-r
              from-violet-600
              to-pink-500
              bg-clip-text
              text-transparent
            "
          >
            Cartelera
          </Link>

          {/* Desktop */}
          <div
            className="
              hidden
              md:flex
              items-center
              gap-8
            "
          >
            <Link
              to="/"
              className="
                text-zinc-700
                hover:text-violet-600
                transition
                font-medium
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
                font-medium
              "
            >
              Crear Evento
            </Link>

            {isModeratorOrAdmin && (
              <Link
                to="/moderacion"
                className="
                  flex
                  items-center
                  gap-2
                  text-violet-600
                  font-semibold
                "
              >
                <span
                  className="
                    w-2
                    h-2
                    rounded-full
                    bg-pink-500
                    animate-pulse
                  "
                />
                Moderación
              </Link>
            )}

            <Link
              to="/perfil"
              className="
                text-zinc-700
                hover:text-violet-600
                transition
                font-medium
              "
            >
              Perfil
            </Link>

            <Link
              to="/"
              className="
                bg-violet-600
                hover:bg-violet-700
                transition
                text-white
                px-5
                py-2
                rounded-xl
                font-semibold
              "
            >
              Explorar
            </Link>
          </div>

          {/* Mobile Button */}
          <button
            onClick={() =>
              setOpen(!open)
            }
            className="
              md:hidden
              p-2
              rounded-lg
              hover:bg-zinc-100
            "
          >
            {open ? (
              <X size={28} />
            ) : (
              <Menu size={28} />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        <div
          className={`
            md:hidden
            overflow-hidden
            transition-all
            duration-300
            ${
              open
                ? "max-h-[500px] opacity-100 mt-5"
                : "max-h-0 opacity-0"
            }
          `}
        >
          <div
            className="
              flex
              flex-col
              gap-3
              pb-4
            "
          >
            <Link
              to="/"
              onClick={() =>
                setOpen(false)
              }
              className="
                p-3
                rounded-xl
                hover:bg-zinc-100
              "
            >
              Inicio
            </Link>

            <Link
              to="/crear-evento"
              onClick={() =>
                setOpen(false)
              }
              className="
                p-3
                rounded-xl
                hover:bg-zinc-100
              "
            >
              Crear Evento
            </Link>

            {isModeratorOrAdmin && (
              <Link
                to="/moderacion"
                onClick={() =>
                  setOpen(false)
                }
                className="
                  p-3
                  rounded-xl
                  bg-violet-50
                  text-violet-700
                  font-semibold
                "
              >
                Moderación
              </Link>
            )}

            <Link
              to="/perfil"
              onClick={() =>
                setOpen(false)
              }
              className="
                p-3
                rounded-xl
                hover:bg-zinc-100
              "
            >
              Perfil
            </Link>

            <Link
              to="/"
              onClick={() =>
                setOpen(false)
              }
              className="
                mt-2
                bg-violet-600
                text-white
                py-3
                rounded-xl
                text-center
                font-semibold
              "
            >
              Explorar eventos
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}