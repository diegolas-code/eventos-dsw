import { useState } from 'react';
import MainLayout from '../../Components/layout/MainLayout';
import { api } from '../../services/api';

export default function CreateEventPage() {
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [fechaTexto, setFechaTexto] = useState('');
  const [horaTexto, setHoraTexto] = useState('');
  const [lugarId, setLugarId] = useState('');
  const [loading, setLoading] = useState(false);

  const handleFechaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let input = e.target.value.replace(/\D/g, ''); // Borra todo lo que no sea numero
    if (input.length > 8) input = input.slice(0, 8); // Maximo 8 digitos

    // Agrega diagonales orgánicamente
    if (input.length > 4) {
      input = `${input.slice(0, 2)}/${input.slice(2, 4)}/${input.slice(4)}`;
    } else if (input.length > 2) {
      input = `${input.slice(0, 2)}/${input.slice(2)}`;
    }
    setFechaTexto(input);
  };

  const handleHoraChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let input = e.target.value.replace(/\D/g, '');
    if (input.length > 4) input = input.slice(0, 4);

    if (input.length > 2) {
      input = `${input.slice(0, 2)}:${input.slice(2)}`;
    }

    setHoraTexto(input);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!titulo.trim() || !descripcion.trim() || fechaTexto.length < 10 || horaTexto.length < 5) {
      return alert('Por favor, completá los campos obligatorios.');
    }

    try {
      setLoading(true);

      const [dia, mes, ano] = fechaTexto.split('/');
      const fechaFormateadaISO = new Date(`${ano}-${mes}-${dia}T${horaTexto}:00`).toISOString();

      const nuevoEvento = {
        titulo: titulo.trim(),
        descripcion: descripcion.trim(),
        iniciaEn: fechaFormateadaISO,
        entidadLugarId: lugarId.trim() || null,
        terminaEn: null,
        creadoPorUsuarioId: null,
        artistasIds: [],
      };

      const response = await api.post('/eventos', nuevoEvento);

      if (response.status === 201 || response.status === 200) {
        alert('¡Evento creado con éxito! Queda pendiente de moderación.');
        setTitulo('');
        setDescripcion('');
        setFechaTexto('');
        setHoraTexto('');
        setLugarId('');
      }
    } catch (error) {
      console.error('Error al crear el evento:', error);
      alert('Hubo un error al procesar la fecha u hora. Asegurate de ingresar valores válidos.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="max-w-2xl w-full mx-auto bg-white border border-zinc-200 p-8 rounded-[32px] shadow-md my-10">
        <h1 className="text-2xl font-bold text-zinc-900 mb-2">Publicar un evento</h1>
        <p className="text-sm text-zinc-500 mb-6">
          Completá los datos para registrar la fecha. El evento pasará a revision por los
          moderadores.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Titulo */}
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-2">
              Titulo del Evento *
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
            <label className="block text-sm font-medium text-zinc-700 mb-2">Descripción *</label>
            <textarea
              value={descripcion}
              onChange={e => setDescripcion(e.target.value)}
              rows={4}
              className="w-full px-5 py-3 border border-zinc-300 rounded-2xl text-black outline-none focus:border-violet-600 transition-colors"
              placeholder="Contanos de qué trata el evento..."
              required
            />
          </div>

          {/* Contenedor para Fecha y Lugar */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-2">
                Fecha del Evento *
              </label>
              <input
                type="text"
                value={fechaTexto}
                onChange={handleFechaChange}
                className="w-full px-5 py-3 border border-zinc-300 rounded-2xl text-black outline-none focus:border-violet-600 transition-colors"
                placeholder="DD/MM/YYYY"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-2">
                Hora de Inicio *
              </label>
              <input
                type="text"
                value={horaTexto}
                onChange={handleHoraChange}
                className="w-full px-5 py-3 border border-zinc-300 rounded-2xl text-black outline-none focus:border-violet-600 transition-colors"
                placeholder="HH:MM (Ej: 21:30)"
                required
              />
            </div>
          </div>

          {/* ID del lugar */}
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-2">
              ID del lugar (opcional)
            </label>
            <input
              type="text"
              value={lugarId}
              onChange={e => setLugarId(e.target.value)}
              className="w-full px-5 py-3 border border-zinc-300 rounded-2xl text-black outline-none focus:border-violet-600 transition-colors"
              placeholder="UUID del establecimiento"
            />
          </div>

          {/* Boton de Enviar */}
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
