# Registro de Historia 20: Integración Final de Victor-Part y Feature-Dashboard-y-Perfil

**Fecha:** 30 de Junio, 2026
**Autores:** Víctor Medina (Colaborador), Melisa Segura (Colaboradora), Diegolas (Colaborador) y Antigravity (AI Coding Assistant)
**Objetivo:** Integrar y consolidar las ramas `origin/victor-part` y `origin/feature/dashboard-y-perfil` en la rama de trabajo `merge-victor-meli`, resolviendo conflictos de importación, corrigiendo payloads de creación de perfil e implementando filtros de eventos por entidad en el backend para eliminar errores de ejecución (404/400).

---

## 📝 Resumen del Proceso de Integración

1. **Merge de Victor-Part**:
   - Fusionado de forma exitosa sin conflictos directos sobre la base de `dev` (June 25). Incorpora el esquema de base de datos para la relación de asistencia a eventos (`UsuarioEvento`), servicios frontend y botones interactivos en las tarjetas de eventos.
2. **Merge de Feature-Dashboard-y-Perfil**:
   - Conflicto en [LoginForm.tsx](file:///C:/Users/Diegolas/Code/Web/_insti/SITIO%20EVENTOS/eventos-dsw/web/src/Pages/ProfilePage/LoginForm.tsx) en el callback `onLoginSuccess`. Resuelto manteniendo la firma de Meli que pasa el ID de usuario (`data.user.id`), el cual es necesario para inicializar el estado del dashboard de usuario.

---

## 🔧 Diagnósticos y Correcciones de Integración

### 1. Desajuste de Exportación de API (Error de Compilación)

- **Problema:** Victor cambió la exportación del cliente Axios en [api.ts](file:///C:/Users/Diegolas/Code/Web/_insti/SITIO%20EVENTOS/eventos-dsw/web/src/services/api.ts) a exportación por defecto (`export default api`). Los nuevos componentes de Meli (`ProfilePage`, `ProfileView`, `DashboardView`) importaban `{ api }` como exportación nombrada, rompiendo la compilación.
- **Solución:** Se modificaron todos los componentes de la vista de perfil y los servicios restantes ([comentarioService.ts](file:///C:/Users/Diegolas/Code/Web/_insti/SITIO%20EVENTOS/eventos-dsw/web/src/services/comentarioService.ts) y [userService.ts](file:///C:/Users/Diegolas/Code/Web/_insti/SITIO%20EVENTOS/eventos-dsw/web/src/services/userService.ts)) para importar `api` por defecto.

### 2. Endpoints Inexistentes en el Dashboard (Error 404)

- **Problema (Agenda de Asistencias):** El frontend consultaba `GET /usuarios/:id/asistencias`, pero el backend de Victor implementó el listado en `GET /api/v1/asistencias/mis-eventos`.
  - _Solución:_ Se redirigió la consulta en [DashboardView.tsx](file:///C:/Users/Diegolas/Code/Web/_insti/SITIO%20EVENTOS/eventos-dsw/web/src/Pages/ProfilePage/DashboardView.tsx) al endpoint correcto.
- **Problema (Eventos de la Entidad):** El frontend consultaba `GET /eventos/propicios?.entidadId=${perfilId}`, ruta que no estaba implementada en el backend de ninguna rama.
  - _Solución (Backend):_ Se modificó `listEventos` en [store.ts](file:///C:/Users/Diegolas/Code/Web/_insti/SITIO%20EVENTOS/eventos-dsw/backend/src/store.ts) para aceptar un parámetro `entidadId` opcional y aplicar un filtro `OR` de Prisma en los eventos publicados, buscando coincidencia en `entidad_lugar_id` (lugares) o mediante la relación intermedia `artistas` (artistas). Se expuso el parámetro en la ruta `GET /` de [eventos.ts](file:///C:/Users/Diegolas/Code/Web/_insti/SITIO%20EVENTOS/eventos-dsw/backend/src/routes/eventos.ts).
  - _Solución (Frontend):_ Se actualizó la consulta en `DashboardView.tsx` a `GET /eventos?entidadId=${perfilId}`.
- **Problema (Unificación de Formato):** Los datos devueltos por las dos consultas poseían formatos y tipados diferentes (RSVP retornaba registros de la tabla intermedia con evento anidado, y el listado directo retornaba camelCase).
  - _Solución:_ Se añadió un mapeo en el `queryFn` del frontend para homogeneizar las estructuras a campos planos de renderizado (`id`, `titulo`, `imagen_url`, `inicia_en`).

### 3. Payload Incompleto al Crear Perfil (Error 400 y Bloqueo de UI)

- **Problema (Falta Tipo):** La API exige el campo `tipo` (`ARTISTA` | `LUGAR`) para crear un perfil, pero el formulario no permitía seleccionarlo ni lo enviaba, resultando en `400 Bad Request`.
  - _Solución:_ Se añadió un selector de tipo (`select`) en [ManagePerfilPage.tsx](file:///C:/Users/Diegolas/Code/Web/_insti/SITIO%20EVENTOS/eventos-dsw/web/src/Pages/ProfilePage/ManagePerfilPage.tsx) (visible solo en modo creación), se recuperó el `usuarioId` del login en `localStorage`, y se enviaron ambos datos en el payload de `createPerfilEntidad`.
- **Problema (Autoreclamo):** Al crear el perfil, el campo `reclamado` quedaba en falso a pesar de crearse asignado a un usuario.
  - _Solución:_ Se modificó `CreatePerfilEntidad` en [store.ts](file:///C:/Users/Diegolas/Code/Web/_insti/SITIO%20EVENTOS/eventos-dsw/backend/src/store.ts) para setear `reclamado: !!input.usuarioId` de forma automática.
- **Problema (Edición bloqueada):** Al hacer clic en "Editar Datos del Perfil" en el Dashboard, la UI se abría en modo creación porque no se le pasaba el prop `perfilInicial` en [ProfilePage.tsx](file:///C:/Users/Diegolas/Code/Web/_insti/SITIO%20EVENTOS/eventos-dsw/web/src/Pages/ProfilePage/ProfilePage.tsx).
  - _Solución:_ Se pasó `perfilInicial={usuario?.perfiles?.[0]}` en la renderización condicional de la página de perfil.

---

## 🏁 Estado del Repositorio

- El cliente de Prisma se regeneró exitosamente mediante `prisma generate` para soportar las relaciones `asistentes` y la tabla intermedia `UsuarioEvento`.
- Compilación del cliente (`npm run build` en `web`) y tipado de servidor (`npm run build` en `backend`) pasan limpiamente.
