# Registro de Historia 25: Resolución de Auditoría Técnica y Correcciones Críticas 🛠️

**Fecha:** 13 de Julio, 2026  
**Autores:** Diegolas (Colaborador) y Antigravity (AI Coding Assistant)  
**Objetivo:** Resolver los fallos críticos de seguridad, rendimiento, configuración y modularidad identificados en la auditoría técnica de la base de código.

---

## 📝 Descripción de la Tarea

Esta historia de usuario aborda la corrección y remediación de todos los puntos identificados durante la auditoría técnica detallada del codebase (`codebase_audit.md`).

El objetivo principal fue securizar la API pública eliminando accesos desautorizados, optimizar el rendimiento y la asincronía del mailer en el backend, habilitar la edición de eventos reales en el dashboard, limpiar código redundante heredado (como la duplicidad de llaves en LocalStorage) y actualizar el esquema de datos con soporte para votos, favoritos y detección de publicaciones duplicadas.

---

## 🔧 Cambios Implementados

### 1. Autenticación y Permisos en API (Seguridad) 🔒

- **Protección de Endpoints:** Se integró el middleware `requireAuth` en los controladores de mutación en [usuarios.ts](file:///C:/Users/Diegolas/Code/Web/_insti/SITIO%20EVENTOS/eventos-dsw/backend/src/routes/usuarios.ts), [comentarios.ts](file:///C:/Users/Diegolas/Code/Web/_insti/SITIO%20EVENTOS/eventos-dsw/backend/src/routes/comentarios.ts), [eventos.ts](file:///C:/Users/Diegolas/Code/Web/_insti/SITIO%20EVENTOS/eventos-dsw/backend/src/routes/eventos.ts) y [perfiles.ts](file:///C:/Users/Diegolas/Code/Web/_insti/SITIO%20EVENTOS/eventos-dsw/backend/src/routes/perfiles.ts).
- **Validación de Propiedad:**
  - En la edición/borrado de eventos se valida que el creador coincida con el usuario logueado o posea un rol superior (`admin` o `moderador`).
  - En la edición/borrado de comentarios se valida que el autor coincida con el usuario logueado.
  - En la creación de comentarios (`POST /eventos/:id/comentarios`), se inyecta el ID del usuario directamente desde el token decodificado para evitar suplantaciones de identidad.
- **Unificación de JWT_SECRET:** Se centralizó la lectura y exportación de la clave secreta `JWT_SECRET` en [utils/auth.ts](file:///C:/Users/Diegolas/Code/Web/_insti/SITIO%20EVENTOS/eventos-dsw/backend/src/utils/auth.ts) importándolo en los módulos de middleware y rutas, resolviendo el bug de firmas inválidas (`invalid signature`).

### 2. Rendimiento e Integración de Servicios ⚡

- **Mailer Asíncrono:** Se removió la palabra clave `await` del envío de correo electrónico en `asistirEvento` ([store.ts](file:///C:/Users/Diegolas/Code/Web/_insti/SITIO%20EVENTOS/eventos-dsw/backend/src/store.ts)), convirtiendo la tarea en una promesa no bloqueante con manejo de fallos silencioso (`.catch`). Esto evita que la respuesta HTTP quede retenida ante la falta de configuración SMTP local.
- **Tareas Programadas:** Se importó el módulo de recordatorios [eventReminder.ts](file:///C:/Users/Diegolas/Code/Web/_insti/SITIO%20EVENTOS/eventos-dsw/backend/src/jobs/eventReminder.ts) en [app.ts](file:///C:/Users/Diegolas/Code/Web/_insti/SITIO%20EVENTOS/eventos-dsw/backend/src/app.ts) para suscribir de manera efectiva el cron job diario al inicio del servidor.
- **Proxy en Cliente:** Se cambió la dirección absoluta de `baseURL` por el prefijo relativo `'/api/v1'` en [api.ts](file:///C:/Users/Diegolas/Code/Web/_insti/SITIO%20EVENTOS/eventos-dsw/web/src/services/api.ts), permitiendo que las peticiones fluyan a través del túnel/proxy de desarrollo configurado en Vite.

### 3. Refactorización y Limpieza de Código 🗑️

- **JWT en Frontend:** Se descontinuó el almacenamiento y consumo de `demo_session_id` en LocalStorage. Los componentes [CommentsSection.tsx](file:///C:/Users/Diegolas/Code/Web/_insti/SITIO%20EVENTOS/eventos-dsw/web/src/Components/events/CommentsSection.tsx) ahora decodifican de forma segura el ID de usuario desde el token JWT almacenado.
- **Remoción de Código Muerto:**
  - Se eliminó el objeto obsoleto `usuarioMock` en [ProfilePage.tsx](file:///C:/Users/Diegolas/Code/Web/_insti/SITIO%20EVENTOS/eventos-dsw/web/src/Pages/ProfilePage/ProfilePage.tsx).
  - Se removieron los inputs y campos comentados redundantes de `entidadLugarId` en [CreateEventPage.tsx](file:///C:/Users/Diegolas/Code/Web/_insti/SITIO%20EVENTOS/eventos-dsw/web/src/Pages/CreateEventPage/CreateEventPage.tsx).

### 4. Frontend: Edición de Eventos en Dashboard 💻

- **Modal de Edición:** Se diseñó e implementó [EditEventModal.tsx](file:///C:/Users/Diegolas/Code/Web/_insti/SITIO%20EVENTOS/eventos-dsw/web/src/Pages/ProfilePage/EditEventModal.tsx) como un componente premium con glassmorphism y micro-animaciones para modificar el título y la descripción.
- **Integración:** Se conectó en [DashboardView.tsx](file:///C:/Users/Diegolas/Code/Web/_insti/SITIO%20EVENTOS/eventos-dsw/web/src/Pages/ProfilePage/DashboardView.tsx) reemplazando la alerta provisional y refrescando la cartelera tras el guardado.

### 5. Base de Datos y Prevención de Duplicados 🗄️

- **Esquema de Prisma:** Se agregaron los modelos `VotoEvento` y `Favorito` junto con sus relaciones y llaves compuestas en [schema.prisma](file:///C:/Users/Diegolas/Code/Web/_insti/SITIO%20EVENTOS/eventos-dsw/backend/prisma/schema.prisma).
- **Migración:** Se aplicó con éxito la migración `20260713201904_add_votes_and_favorites` en el entorno local de Postgres y se actualizó el Prisma Client.
- **Detección de Duplicados:** En la función `createEvento` ([store.ts](file:///C:/Users/Diegolas/Code/Web/_insti/SITIO%20EVENTOS/eventos-dsw/backend/src/store.ts)), se incorporó una consulta previa que busca coincidencias de fecha (mismo día), establecimiento/lugar o artistas concurrentes para marcar automáticamente la bandera `posible_duplicado` en la base de datos.

---

## 🧪 Verificación y Pruebas

- **Compilación de Frontend & Backend:** Ambos proyectos compilan de forma limpia sin errores de TypeScript ni sintaxis.
- **Pruebas de Integración:** Se actualizó y ejecutó el archivo [test-auth.ts](file:///C:/Users/Diegolas/Code/Web/_insti/SITIO%20EVENTOS/eventos-dsw/backend/src/scripts/test-auth.ts) para validar el rechazo de las rutas sin token. Adicionalmente, se forzó la salida del proceso (`process.exit(0)`) al finalizar para evitar que la tarea cron mantenga activo el bucle del proceso de tests. Todos los tests de autenticación y moderación pasaron de forma exitosa.
