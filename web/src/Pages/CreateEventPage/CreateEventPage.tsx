import { useState } from 'react';
import MainLayout from '../../Components/layout/MainLayout';
import { createEvent, getCategorias } from '../../services/eventService';
import { useQuery } from '@tanstack/react-query';

export default function CreateEventPage() {
  const [titulo, setTitulo] = useState('');
  const [categoria, setCategoria] = useState('OTRO');
  const [descripcion, setDescripcion] = useState('');
  const [linkEntradas, setLinkEntradas] = useState('');
  const [iniciaEn, setIniciaEn] = useState('');
  const [lugar, setLugar] = useState('');
  const [entidadLugarId, setEntidadLugarId] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [gallery, setGallery] = useState<File[]>([]);
  const [galleryPreview, setGalleryPreview] = useState<string[]>([]);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleGalleryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    setGallery(files);

    setGalleryPreview(files.map(file => URL.createObjectURL(file)));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!titulo.trim() || !iniciaEn) {
      return alert('Por favor, completá los campos obligatorios (Título y Fecha/Hora).');
    }
   
    try {
      setLoading(true);

      const formData = new FormData();
      formData.append('titulo', titulo.trim());
      formData.append('categoria', categoria);
      formData.append('linkEntradas', linkEntradas.trim());
      formData.append('descripcion', descripcion.trim());
      formData.append('iniciaEn', new Date(iniciaEn).toISOString());

      if (lugar.trim()) {
        formData.append('lugar', lugar.trim());
      }
      if (entidadLugarId.trim()) {
        formData.append('entidadLugarId', entidadLugarId.trim());
      }
      if (image) {
        formData.append('image', image);
      }

      gallery.forEach(file => {
        formData.append('gallery', file);
      });

      await createEvent(formData);

      alert('¡Evento creado con éxito!');
      setTitulo('');
      setDescripcion('');
      setIniciaEn('');
      setLugar('');
      setLinkEntradas('');
      setEntidadLugarId('');
      setImage(null);
      setPreview(null);
    } catch (error) {
      console.error('Error al crear el evento:', error);
      alert('Hubo un error al procesar la creación del evento.');
    } finally {
      setLoading(false);
    }
  };

  const { data: categorias } = useQuery({
    queryKey: ['categorias'],
    queryFn: getCategorias,
  });

  const categoriaLabels: Record<string, string> = {
    CONCIERTO: 'Concierto',
    EXPOSICION: 'Exposición',
    TALLER: 'Taller',
    FERIA: 'Feria',
    TEATRO: 'Teatro',
    OTRO: 'Otro',
  };
  return (
    <MainLayout>
      <div className="max-w-2xl w-full mx-auto bg-white border border-zinc-200 p-8 rounded-[32px] shadow-md my-10">
        <h1 className="text-2xl font-bold text-zinc-900 mb-2">Publicar un evento</h1>
        <p className="text-sm text-zinc-500 mb-6">
          Completá los datos para registrar la fecha. El evento pasará a revisión por los
          moderadores.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Titulo */}
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-2">
              Título del Evento *
            </label>
            <input
              type="text"
              value={titulo}
              onChange={e => setTitulo(e.target.value)}
              className="w-full px-5 py-3 border border-zinc-300 rounded-2xl text-black outline-none focus:border-violet-600 transition-colors"
              placeholder="Ej: Festival de Rock Local"
              required
            />
          </div>
          <div>
            <label className="block mb-2 font-medium">Categoría</label>
            <select
              value={categoria}
              onChange={e => setCategoria(e.target.value)}
              className="
    w-full
    border
    rounded-xl
    p-3
  "
            >
              {categorias?.map((cat: string) => (
                <option key={cat} value={cat}>
                  {categoriaLabels[cat] ?? cat}
                </option>
              ))}
            </select>
          </div>

          {/* Descripcion */}
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-2">Descripción</label>
            <textarea
              value={descripcion}
              onChange={e => setDescripcion(e.target.value)}
              rows={4}
              className="w-full px-5 py-3 border border-zinc-300 rounded-2xl text-black outline-none focus:border-violet-600 transition-colors"
              placeholder="Contanos de qué trata el evento..."
            />
          </div>
           
         <div>
  <label className="block text-sm font-medium text-zinc-700 mb-2">
    Link de Entradas o Información
  </label>

  <input
    type="text"
    value={linkEntradas}
    onChange={e => setLinkEntradas(e.target.value)}
    placeholder="https://..."
    className="w-full px-5 py-3 border border-zinc-300 rounded-2xl text-black outline-none focus:border-violet-600 transition-colors"
  />

  <p className="text-xs text-zinc-500 mt-1">
    Este enlace aparecerá en el evento y será enviado por correo a quienes confirmen asistencia.
  </p>
  </div>


          {/* Fecha y hora */}
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-2">
              Fecha y Hora de Inicio *
            </label>
            <input
              type="datetime-local"
              value={iniciaEn}
              onChange={e => setIniciaEn(e.target.value)}
              className="w-full px-5 py-3 border border-zinc-300 rounded-2xl text-black outline-none focus:border-violet-600 transition-colors"
              required
            />
          </div>

          {/* Lugar manual */}
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-2">Lugar (Nombre)</label>
            <input
              type="text"
              value={lugar}
              onChange={e => setLugar(e.target.value)}
              className="w-full px-5 py-3 border border-zinc-300 rounded-2xl text-black outline-none focus:border-violet-600 transition-colors"
              placeholder="Ej: Teatro Colón o Centro Cultural"
            />
          </div>

          {/* ID del lugar (opcional) */}
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-2">
              ID del lugar (opcional)
            </label>
            <input
              type="text"
              value={entidadLugarId}
              onChange={e => setEntidadLugarId(e.target.value)}
              className="w-full px-5 py-3 border border-zinc-300 rounded-2xl text-black outline-none focus:border-violet-600 transition-colors"
              placeholder="UUID del establecimiento"
            />
          </div>

          {/* Poster del evento */}
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-2">
              Poster del Evento
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full px-5 py-3 border border-zinc-300 rounded-2xl text-black outline-none focus:border-violet-600 transition-colors"
            />
            {preview && (
              <img
                src={preview}
                alt="Preview"
                className="mt-4 rounded-2xl w-full h-64 object-cover border border-zinc-200"
              />
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-2">Galería de Fotos</label>

            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleGalleryChange}
              className="
      w-full
      px-5
      py-3
      border
      border-zinc-300
      rounded-2xl
    "
            />

            {galleryPreview.length > 0 && (
              <div
                className="
        mt-4
        grid
        grid-cols-2
        md:grid-cols-3
        gap-3
      "
              >
                {galleryPreview.map((img, index) => (
                  <img
                    key={index}
                    src={img}
                    alt=""
                    className="
              h-32
              w-full
              object-cover
              rounded-xl
            "
                  />
                ))}
              </div>
            )}
          </div>

          {/* Botón de Enviar */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-violet-600 to-pink-500 hover:opacity-90 text-white font-medium py-3 rounded-2xl transition-opacity mt-6 disabled:opacity-50 shadow-sm"
          >
            {loading ? 'Publicando...' : 'Publicar Evento'}
          </button>
        </form>
      </div>
    </MainLayout>
  );
}
