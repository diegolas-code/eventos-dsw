# Registro de Historia 19: Integración de Características en Rama Dev y Avance en Perfiles de Entidades

**Fecha:** 25 de Junio, 2026
**Autores:** Melisa Segura (Colaboradora), Víctor Medina (Colaborador) y Antigravity (AI Coding Assistant)
**Objetivo:** Consolidar en la rama principal de desarrollo (`dev`) las características desarrolladas por Víctor (Buscador, categorías, carruseles de fotos con Swiper, y navegación móvil responsiva) y las desarrolladas por Melisa (Endpoints del backend para perfiles de entidades y primer formulario de administración del perfil).

---

## 📝 Resumen del Proceso de Integración

1. **Fusión de Ramas (`feat/integration-perfiles-busqueda`)**:
   - Se creó una rama intermedia para realizar la integración.
   - Se fusionó `victor-part` resolviendo de forma manual los conflictos generados en el archivo [Homepage.tsx](file:///C:/Users/Diegolas/Code/Web/_insti/SITIO%20EVENTOS/eventos-dsw/web/src/Pages/Home/Homepage.tsx), asegurando que el filtrado reactivo de eventos coexista con las píldoras de categorías de la home.
2. **Merge a la Rama de Desarrollo (`dev`)**:
   - El usuario integró de forma manual la rama `feat/integration-perfiles-busqueda` dentro de `dev`.
   - El repositorio se encuentra ahora unificado y con el área de trabajo limpia de conflictos.

---

## 📝 Resumen de Características de Perfil (Melisa)

### 1. Backend ([backend/src/routes/perfiles.ts](file:///C:/Users/Diegolas/Code/Web/_insti/SITIO%20EVENTOS/eventos-dsw/backend/src/routes/perfiles.ts))

- **Endpoint de Reclamo (`POST /api/v1/perfiles/:id/reclamar`)**: Vincula un perfil existente a la cuenta del usuario logueado (`usuario_id`) y lo marca como `reclamado: true`.
- **Endpoint de Edición (`PATCH /api/v1/perfiles/:id`)**: Permite actualizar el nombre, descripción, dirección, URL de Google Maps e imagen de perfil. Valida que el usuario solicitante sea el propietario del perfil.

### 2. Frontend ([web/src/Pages/ProfilePage](file:///C:/Users/Diegolas/Code/Web/_insti/SITIO%20EVENTOS/eventos-dsw/web/src/Pages/ProfilePage))

- **Servicio (`perfilService.ts`)**: Añadido cliente Axios para consumir `reclamarPerfilEntidad` y `updatePerfilEntidad`.
- **Vistas y Ruteo (`ProfilePage.tsx` y `ProfileView.tsx`)**: Activado el botón "Crear Perfil" e incorporado el estado para abrir el formulario.
- **Formulario de Gestión (`ManagePerfilPage.tsx` - Nuevo archivo)**: Formulario dinámico para el ingreso de campos del perfil.

---

## ⚠️ Diagnósticos y Pendientes Críticos

1. **Bug en Creación de Perfiles**:
   - _Problema:_ El formulario en [ManagePerfilPage.tsx](file:///C:/Users/Diegolas/Code/Web/_insti/SITIO%20EVENTOS/eventos-dsw/web/src/Pages/ProfilePage/ManagePerfilPage.tsx) asume siempre una actualización. Si no hay un `perfilInicial` (creación), la llamada realiza un `PATCH` a `/api/v1/perfiles/` (con ID vacío) devolviendo un error 404 de la API.
   - _Problema:_ No se está capturando el campo obligatorio `tipo` (`ARTISTA` | `LUGAR`) para nuevos perfiles.
   - _Solución:_ Modificar el formulario para utilizar `createPerfilEntidad` (`POST /api/v1/perfiles`) en modo creación y agregar el control select para el `tipo` de entidad.
2. **Roadmap Restante de la Fase 3**:
   - Flujo de verificación administrativa de reclamos.
   - Dashboard de la entidad para listar y crear eventos propios.
