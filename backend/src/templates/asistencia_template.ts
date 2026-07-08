export function asistenciaTemplate(evento: {
  titulo: string;
  imagenUrl?: string;
  iniciaEn: Date;
  lugar?: string;
  linkEntradas?: string;
}) {
  return `
  <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto">

    ${
      evento.imagenUrl
        ? `
      <img
        src="${evento.imagenUrl}"
        style="width:100%;border-radius:10px"
      />
    `
        : ''
    }

    <h1>${evento.titulo}</h1>

    <p>
      Tu asistencia fue confirmada.
    </p>

    <p>
      📅 ${evento.iniciaEn.toLocaleString()}
    </p>

    <p>
      📍 ${evento.lugar ?? ''}
    </p>

    ${
      evento.linkEntradas
        ? `
      <a
        href="${evento.linkEntradas}"
        style="
        display:inline-block;
        background:#7c3aed;
        color:white;
        padding:12px 20px;
        border-radius:8px;
        text-decoration:none;
        "
      >
        Ver entradas
      </a>
    `
        : ''
    }

  </div>
  `;
}