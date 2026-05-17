/**
 * Componente Principal (App).
 * En esta fase inicial, el componente se encarga de listar los eventos
 * consumiendo los datos desde la API del Backend.
 */
import React, { useEffect, useState } from 'react';
import axios from 'axios';

/**
 * Tipo que define la estructura de un Evento en el Frontend.
 * Debe coincidir con lo que devuelve la API.
 */
type Evento = {
  id: string;
  titulo: string;
  descripcion: string | null;
  iniciaEn: string;
};

export default function App() {
  // Estado para almacenar la lista de eventos
  const [eventos, setEventos] = useState<Evento[] | null>(null);
  // Estado para manejar posibles errores de conexión
  const [error, setError] = useState<string | null>(null);

  /**
   * useEffect para realizar la petición al cargar el componente.
   * Usamos axios para facilitar las peticiones HTTP.
   */
  useEffect(() => {
    axios
      .get('/api/v1/eventos') // El proxy configurado en vite.config.ts redirige esto al Backend
      .then(res => setEventos(res.data?.data ?? []))
      .catch(err => setError(err.message));
  }, []);

  // Renderizado condicional: Error
  if (error) return <div style={{ color: 'red', padding: 20 }}>Error de conexión: {error}</div>;

  // Renderizado condicional: Cargando
  if (!eventos) return <div style={{ padding: 20 }}>Cargando eventos...</div>;

  /**
   * Vista principal: Listado simple de eventos.
   */
  return (
    <div style={{ padding: 20, fontFamily: 'sans-serif' }}>
      <h1>Eventos locales (Mar del Plata)</h1>
      <p>Bienvenido a la cartelera. Aquí puedes ver los próximos eventos:</p>

      {eventos.length === 0 ? (
        <p>No hay eventos disponibles en este momento.</p>
      ) : (
        <ul style={{ lineHeight: '1.6' }}>
          {eventos.map(e => (
            <li key={e.id}>
              <strong>{e.titulo}</strong> — {e.descripcion || 'Sin descripción'}
              <br />
              <small>📅 {new Date(e.iniciaEn).toLocaleString()}</small>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
