import { useState } from 'react';
import MainLayout from '../../Components/layout/MainLayout';
import { createEvent } from '../../services/eventService';

export default function CreateEventPage() {
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [iniciaEn, setIniciaEn] = useState('');
  const [lugar, setLugar] = useState('');
  const [entidadLugarId, setEntidadLugarId] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImage(file);
    setPreview(URL.createObjectURL(file));
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

      await createEvent(formData);

      alert('¡Evento creado con éxito! Queda pendiente de moderación.');
      setTitulo('');
      setDescripcion('');
      setIniciaEn('');
      setLugar('');
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
