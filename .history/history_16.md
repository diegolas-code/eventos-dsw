# Registro de Historia 16: Ajustes de Almacenamiento y Limpieza de Alertas en UI

**Fecha:** 16 de Junio, 2026
**Autor:** Antigravity (AI Coding Assistant)
**Objetivo:** Ajustar las variables de entorno de ejemplo para reflejar la integración real de Cloudinary en lugar de Cloudflare R2, y limpiar los mensajes de alerta en la UI eliminando referencias a la moderación que aún no está activa.

## 📝 Resumen de Cambios

1. **Variables de Entorno ([.env.example](file:///C:/Users/Diegolas/Code/Web/_insti/SITIO%20EVENTOS/eventos-dsw/.env.example)):**
   - Remoción de las variables obsoletas de Cloudflare R2 (`R2_*`).
   - Adición de las claves de configuración requeridas para Cloudinary: `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY` y `CLOUDINARY_API_SECRET`. Esto documenta de forma clara la infraestructura real de subida de pósters usada en el proyecto.

2. **Limpieza de Alertas en Formulario de Creación ([CreateEventPage.tsx](file:///C:/Users/Diegolas/Code/Web/_insti/SITIO%20EVENTOS/eventos-dsw/web/src/Pages/CreateEventPage/CreateEventPage.tsx)):**
   - Modificación del mensaje del alert tras la creación exitosa de un evento: se cambió de `"¡Evento creado con éxito! Queda pendiente de moderación."` a `"¡Evento creado con éxito!"`.
   - Razón: Evitar confusión en el usuario puesto que la fase de moderación de contenido (Fase 2) aún no está activa y los eventos creados se publican de forma inmediata en la cartelera.

## ✅ Verificación y Estado

- El frontend compila sin problemas con Vite (`npm run build`).
- La rama `dev` queda sincronizada, limpia y lista para la transición a la Fase 2 del proyecto.
