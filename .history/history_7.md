## History 007 — Phase 0.5: Frontend Refactor & Modern Architecture Implementation

Date: 2026-05-19

Resumen breve

- Se integró la rama `victor-part` en `dev`, marcando un salto cualitativo en la arquitectura del frontend.
- Transición de un componente `App.tsx` único a una estructura de **rutas dinámicas** con `react-router-dom`.
- Implementación de **React Query (@tanstack/react-query)** para una gestión de estado asíncrono y caché más robusta.
- Integración de **Tailwind CSS** para un desarrollo de UI más ágil y consistente.
- Abstracción de la lógica de red en servicios dedicados (`services/api.ts`, `services/eventService.ts`).
- Reorganización de la documentación: `spec.md` ahora reside en la raíz para mejor visibilidad.

Cambios realizados

- **web/src/routes/**: Creación de `AppRoutes.tsx` definiendo las rutas principales (`/`, `/evento/:id`, `/crear-evento`, `/perfil`).
- **web/src/Pages/**: Introducción de carpetas por página, cada una con su lógica y subcomponentes (`Home`, `EventPage`, `CreateEventPage`, `ProfilePage`).
- **web/src/Components/**: Organización de componentes reutilizables en `layout/` (Navbar, MainLayout) y `events/` (EventCard).
- **web/src/services/**: Implementación de un cliente Axios configurado y funciones de servicio para eventos.
- **web/src/main.tsx**: Configuración del `QueryClientProvider`.
- **web/tailwind.config.js** & **postcss.config.js**: Configuración completa de Tailwind CSS.
- **spec.md**: Movido de `.github/spec.md` a la raíz.

Consejos y Observaciones

- **Servicios sobre Componentes**: Mantener la regla de que los componentes no llamen directamente a `api.get`. Usar siempre los hooks de React Query envolviendo a las funciones de `eventService.ts`. Esto facilita el mantenimiento y las pruebas.
- **Layouts Reutilizables**: Se ha implementado `MainLayout.tsx`. Todas las páginas nuevas deben envolverse en este componente para mantener la consistencia de la Navbar y el espaciado.
- **Tailwind**: Evitar el uso de estilos inline o archivos CSS por componente a menos que sea estrictamente necesario. Confiar en las clases utilitarias de Tailwind.

Cómo verificar

1. Iniciar frontend: `cd web && npm run dev`.
2. Navegar por las rutas: `/`, `/crear-evento`, `/perfil`.
3. Verificar que la carga de eventos en la Home se realice mediante React Query (se puede ver en las DevTools de red).

Próximos pasos

1. **Fase 1: Autenticación**: Ahora que la estructura de páginas está lista (`ProfilePage`, etc.), es el momento de integrar Supabase Auth para proteger las rutas.
2. **Formularios**: Implementar la lógica de creación de eventos en `CreateEventPage.tsx` usando `useMutation` de React Query.

---

Archivo generado automáticamente — Integración de victor-part completada. 🚀
