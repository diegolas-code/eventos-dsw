import cron from 'node-cron';

import { enviarMail } from '../services/email.service.js';
import { asistenciaTemplate } from '../templates/asistencia_template.js';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
cron.schedule('0 9 * * *', async () => {
  console.log('Buscando recordatorios...');

  const hoy = new Date();

  const desde = new Date(hoy);
  desde.setDate(desde.getDate() + 3);

  const hasta = new Date(hoy);
  hasta.setDate(hasta.getDate() + 4);

  const asistencias = await prisma.usuarioEvento.findMany({
    where: {
      evento: {
        inicia_en: {
          gte: desde,
          lte: hasta,
        },
      },
    },
    include: {
      usuario: true,
      evento: true,
    },
  });

  for (const asistencia of asistencias) {
    await enviarMail({
      to: asistencia.usuario.email,
      subject: `Recordatorio: ${asistencia.evento.titulo}`,
      html: asistenciaTemplate({
        titulo: asistencia.evento.titulo,
        imagenUrl: asistencia.evento.imagen_url ?? undefined,
        iniciaEn: asistencia.evento.inicia_en,
        lugar: asistencia.evento.lugar_manual ?? undefined,
        linkEntradas: asistencia.evento.link_entradas ?? undefined,
      }),
    });
  }

  console.log(`${asistencias.length} recordatorios enviados`);
});
