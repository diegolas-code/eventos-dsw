import React, { useEffect, useState } from 'react';
import axios from 'axios';

type Evento = {
  id: string;
  titulo: string;
  descripcion: string | null;
  iniciaEn: string;
};

export default function App() {
  const [eventos, setEventos] = useState<Evento[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    axios
      .get('/api/v1/eventos')
      .then(res => setEventos(res.data?.data ?? []))
      .catch(err => setError(err.message));
  }, []);

  if (error) return <div>Error: {error}</div>;
  if (!eventos) return <div>Cargando eventos...</div>;

  return (
    <div style={{ padding: 20 }}>
      <h1>Eventos</h1>
      <ul>
        {eventos.map(e => (
          <li key={e.id}>
            <strong>{e.titulo}</strong> — {e.descripcion}
          </li>
        ))}
      </ul>
    </div>
  );
}
