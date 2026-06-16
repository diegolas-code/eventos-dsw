import { Mail, MapPin, Globe, Music } from 'lucide-react';

export default function Footer() {
  return (
    <footer
      className="
        mt-20
        bg-white
        border-t
      "
    >
      <div
        className="
          max-w-7xl
          mx-auto
          px-6
          py-12
          grid
          grid-cols-1
          md:grid-cols-3
          gap-10
        "
      >
        {/* Branding */}
        <div>
          <h2 className="text-3xl font-bold mb-4">Cartelera</h2>

          <p className="text-zinc-600 leading-relaxed">
            Plataforma para descubrir eventos culturales, recitales y actividades locales en Mar del
            Plata.
          </p>
        </div>

        {/* Navegación */}
        <div>
          <h3 className="font-semibold text-lg mb-4">Navegación</h3>

          <ul className="space-y-3 text-zinc-600">
            <li className="hover:text-violet-600 cursor-pointer transition">Inicio</li>

            <li className="hover:text-violet-600 cursor-pointer transition">Explorar eventos</li>

            <li className="hover:text-violet-600 cursor-pointer transition">Publicar evento</li>

            <li className="hover:text-violet-600 cursor-pointer transition">Perfil</li>
          </ul>
        </div>

        {/* Contacto */}
        <div>
          <h3 className="font-semibold text-lg mb-4">Contacto</h3>

          <div className="space-y-4 text-zinc-600">
            <div className="flex items-center gap-3">
              <Mail size={18} />

              <span>contacto@cartelera.com</span>
            </div>

            <div className="flex items-center gap-3">
              <MapPin size={18} />

              <span>Mar del Plata, Argentina</span>
            </div>

            {/* Redes */}
            <div className="flex gap-4 pt-4">
              <button
                className="
                  p-3
                  rounded-full
                  bg-zinc-100
                  hover:bg-violet-100
                  transition
                "
              >
                <Music size={20} />
              </button>

              <button
                className="
                  p-3
                  rounded-full
                  bg-zinc-100
                  hover:bg-violet-100
                  transition
                "
              >
                <Globe size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom */}
      <div
        className="
          border-t
          py-4
          text-center
          text-sm
          text-zinc-500
        "
      >
        © 2026 Cartelera. Proyecto DSW.
      </div>
    </footer>
  );
}
