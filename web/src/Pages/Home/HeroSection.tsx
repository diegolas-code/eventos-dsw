export default function HeroSection() {
  return (
    <section
      className="
        rounded-[32px]
        p-12
        text-white
        bg-gradient-to-r
        from-violet-600
        to-pink-500
        mb-10
        relative
        overflow-hidden
      "
    >
      <div className="max-w-2xl">
        <p className="mb-4 text-sm font-medium">
           Descubrí lo que pasa en tu ciudad
        </p>

        <h1 className="text-6xl font-bold mb-6">
          Eventos locales
        </h1>

        <p className="text-lg text-white/80 mb-8">
          Explorá conciertos, exposiciones,
          talleres y mucho más.
        </p>

        <input
          type="text"
          placeholder="Buscar eventos..."
          className="
            w-full
            max-w-xl
            px-6
            py-4
            rounded-2xl
            text-black
            outline-none
          "
        />
      </div>
    </section>
  );
}