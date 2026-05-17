# Proyecto: Cartelera web de eventos locales

**Desarrollo de Sistemas Web – 2026**

Alumnos: GUARAZ Diego, MEDINA Víctor, SEGURA Melisa

## Descripción general

El proyecto consiste en el desarrollo de una aplicación web para publicar y consumir eventos locales en formato de cartelera. La plataforma permite consultar eventos próximos (conciertos, exposiciones, talleres, etc.), ver detalles completos, interactuar con la comunidad y publicar nuevos eventos. Artistas y lugares pueden registrarse y gestionar su información pública para mantener sus perfiles actualizados.

Además del rol administrador, existen tres perfiles principales: miembros, artistas/representantes y lugares. Cada perfil tiene un conjunto de herramientas y permisos diferenciados, con la posibilidad de asignar a algunos miembros el rol de moderadores para la gestión de contenido. El sitio es accesible sin iniciar sesión para lectura, pero las acciones de publicación e interacción se restringen a usuarios registrados.

### Estructura general del sitio

El sitio se presenta como un feed de eventos con filtros por categorías, fecha, lugar y artista. Cada evento tiene una vista de detalle con descripción, fecha, horario, lugar y artistas participantes, además de acciones de interacción.

Los usuarios pueden seguir artistas y lugares para recibir actualizaciones y construir una experiencia personalizada. Los perfiles de artistas y lugares se muestran como páginas propias con información general, próximos eventos y eventos pasados.

### Usuarios y funcionalidades

#### Funcionalidades generales

Los visitantes sin sesión activa pueden acceder al feed y a los detalles de los eventos. Los usuarios registrados pueden publicar eventos, comentar, votar eventos y comentarios, guardar favoritos y seguir artistas o lugares. Adicionalmente pueden guardar una configuración de filtros para personalizar el feed y administrar su información personal.

#### Administrador

El administrador tiene acceso a todas las funcionalidades del sitio. Gestiona usuarios, eventos, perfiles, reportes y la configuración general (categorías y etiquetas). También valida eventos cuando corresponde y asigna el rol de moderador a los miembros de la comunidad.

#### Usuarios

##### Artistas/Representantes

Los usuarios con el rol "Artistas/Representantes" pueden publicar eventos asociados a sus perfiles, acceder a estadísticas de interacción y actualizar su información pública (biografía, enlaces y galería).

##### Lugares

Los usuarios con el rol "Lugares" pueden publicar eventos en sus espacios, acceder a estadísticas de interacción y gestionar información operativa del lugar (ubicación, horarios, servicios y fotos).

##### Miembros

Los usuarios con el rol "Miembros" cuentan con las funcionalidades generales de interacción y publicación, sin permisos adicionales de administración o moderación.

##### Moderadores

Los usuarios con el rol de "Moderadores" son miembros designados por el administrador y pueden gestionar comentarios y eventos publicados por la comunidad. Sus acciones incluyen aprobar o rechazar eventos, moderar comentarios y elevar reportes al administrador.

### Tecnologías, despliegue y operaciones

Se utilizará React con Vite para el frontend y un backend en Node.js (Express o Fastify) con PostgreSQL y Prisma como ORM. En la etapa inicial, el hosting será Vercel para el frontend, Render para el backend, Supabase Postgres para la base de datos y Cloudflare R2 para almacenamiento de imágenes.

La autenticación se resolverá con Supabase Auth (correo y redes sociales), lo que delega la seguridad en un proveedor confiable y reduce el riesgo de implementar autenticación propia. El despliegue se realizará desde un repositorio Git con integración y entrega continua mediante GitHub Actions, ejecutando lint y build en cada push o pull request. Los tests se incorporarán progresivamente. Al hacer merge a la rama principal se desplegará automáticamente en Vercel y Render. Las variables de entorno se gestionan desde los paneles de cada servicio.

La elección de servicios permite costos iniciales $0 y un flujo de despliegue simple. El plan de escalamiento contempla migrar a planes pagos para evitar cold starts en el backend, aumentar recursos, habilitar backups de base de datos y ampliar el uso de Cloudflare R2 según demanda.

_Para mantener un entorno de desarrollo seguro al usar herramientas de IA en el desarrollo, se procurará validar los cambios mediante una cobertura amplia de pruebas, linting y control de dependencias antes de integrarlos._

_Asimismo se intentará incluir en alguna etapa el uso de Docker con un Dockerfile para la aplicación y Docker Compose para levantar la app y PostgreSQL en conjunto. Esta parte es opcional y puede omitirse sin afectar el funcionamiento de la aplicación._

## Descripción funcional

### Detalles generales de implementación

#### Registro y gestión de identidad

Al registrarse, el usuario selecciona su tipo de perfil: Miembro o Entidad (Artista/Lugar). Esta elección determina las herramientas disponibles. Artistas y Lugares comparten una estructura de perfil unificada (`PERFIL_ENTIDAD`) con campos para biografía, ubicación y redes.

#### Ciclo de vida de eventos y entidades automáticas

Los eventos creados inician en estado `PENDIENTE` y requieren validación. Si al cargar un evento se menciona a una entidad inexistente, el sistema genera automáticamente un perfil en estado `NO_RECLAMADO`.

#### Detección de duplicados

Al crear un evento, el sistema realiza una comprobación básica de duplicados. Se considera un posible duplicado si coincide:

1. El mismo **Lugar**.
2. El mismo **Día**.
3. Al menos un **Artista** coincidente.

Si se detectan estos factores, se guarda con un flag de `posible_duplicado` para que un moderador verifique el caso. No se requieren algoritmos de puntuación complejos.

### Entidades y relaciones

    USUARIO {
        uuid id PK
        string email
        string nombre_mostrar
        string rol "miembro|entidad|admin|moderador"
        datetime creado_en
        datetime actualizado_en
    }

    PERFIL_ENTIDAD {
        uuid id PK
        uuid usuario_id FK
        string nombre
        string tipo "artista|lugar"
        text descripcion
        string direccion
        string gmaps_url
        string redes
        string horarios
        string servicios
        boolean reclamado
        datetime creado_en
    }

    EVENTO {
        uuid id PK
        uuid creado_por_usuario_id FK
        string titulo
        text descripcion
        datetime inicia_en
        datetime termina_en
        string estado "PENDIENTE|PUBLICADO|RECHAZADO|ARCHIVADO"
        uuid entidad_lugar_id FK
        boolean posible_duplicado
        datetime creado_en
        datetime actualizado_en
    }

    EVENTO_ARTISTA {
        uuid evento_id FK
        uuid entidad_artista_id FK
    }

    EVENTO_MEDIA {
        uuid id PK
        uuid evento_id FK
        string url
        string tipo
    }

        string url
        string tipo
    }

    SEGUIMIENTO {
        uuid usuario_id FK
        string tipo_objetivo "artista|lugar"
        uuid objetivo_id
        datetime creado_en
    }

    FAVORITO {
        uuid usuario_id FK
        uuid evento_id FK
        datetime creado_en
    }

    COMENTARIO {
        uuid id PK
        uuid evento_id FK
        uuid usuario_id FK
        uuid padre_id FK
        text cuerpo
        datetime creado_en
    }

    VOTO_EVENTO {
        uuid usuario_id FK
        uuid evento_id FK
        datetime creado_en
    }

    VOTO_COMENTARIO {
        uuid usuario_id FK
        uuid comentario_id FK
        datetime creado_en
    }

    REPORTE {
        uuid id PK
        uuid denunciante_usuario_id FK
        string tipo_objetivo "evento|comentario"
        uuid objetivo_id
        string motivo
        string estado "abierto|revisado|descartado|accionado"
        datetime creado_en
    }

    ACCION_MODERACION {
        uuid id PK
        uuid moderador_usuario_id FK
        string tipo_objetivo "evento|comentario"
        uuid objetivo_id
        string accion "aprobar|rechazar|ocultar|restaurar"
        string nota
        datetime creado_en
    }

    SUGERENCIA_DUPLICADO {
        uuid id PK
        uuid nuevo_evento_id FK
        uuid evento_existente_id FK
        float confianza
        datetime creado_en
    }

    USUARIO |---| PERFIL_ARTISTA : tiene
    USUARIO |---| PERFIL_LUGAR : tiene
    USUARIO |---< EVENTO : crea
    PERFIL_LUGAR |---< EVENTO : presenta_en
    EVENTO |---< EVENTO_ARTISTA : presenta_a
    PERFIL_ARTISTA |---< EVENTO_ARTISTA : participa
    EVENTO |---< EVENTO_MEDIA : tiene
    USUARIO |---< SEGUIMIENTO : sigue
    USUARIO |---< FAVORITO : elige_favorito
    EVENTO |---< FAVORITO : elegido_por
    EVENTO |---< COMENTARIO : tiene
    USUARIO |---< COMENTARIO : escribe
    COMENTARIO |---< COMENTARIO : responde
    USUARIO |---< VOTO_EVENTO : vota
    USUARIO |---< VOTO_COMENTARIO : vota
    EVENTO |---< VOTO_EVENTO : recibe_voto
    COMENTARIO |---< VOTO_COMENTARIO : recibe_voto
    USUARIO |---< REPORTE : denuncia
    USUARIO |---< ACCION_MODERACION : modera
    EVENTO |---< REPORTE : denunciado
    COMENTARIO |---< REPORTE : denunciado
    EVENTO |---< ACCION_MODERACION : moderado
    COMENTARIO |---< ACCION_MODERACION : moderado
    EVENTO |---< SUGERENCIA_DUPLICADO : comparado

### Matriz de permisos

Tabla resumida de capacidades por rol. Los permisos detallados se especifican en cada endpoint.

| Acción                                    | Visitante | Miembro | Artista/Rep | Lugar | Moderador | Admin |
| ----------------------------------------- | :-------: | :-----: | :---------: | :---: | :-------: | :---: |
| Ver feed y detalles                       |    Si     |   Si    |     Si      |  Si   |    Si     |  Si   |
| Registrarse / iniciar sesión              |    Si     |   N/A   |     N/A     |  N/A  |    N/A    |  N/A  |
| Publicar evento                           |    No     |   Si    |     Si      |  Si   |    Si     |  Si   |
| Editar / eliminar evento propio           |    No     |   Si    |     Si      |  Si   |    Si     |  Si   |
| Comentar                                  |    No     |   Si    |     Si      |  Si   |    Si     |  Si   |
| Votar eventos / comentarios               |    No     |   Si    |     Si      |  Si   |    Si     |  Si   |
| Favoritos / seguimiento                   |    No     |   Si    |     Si      |  Si   |    Si     |  Si   |
| Gestionar perfil propio                   |    No     |   Si    |     Si      |  Si   |    Si     |  Si   |
| Reclamar perfil no reclamado              |    No     |   Si    |     Si      |  Si   |    Si     |  Si   |
| Ver estadisticas propias                  |    No     |   No    |     Si      |  Si   |    Si     |  Si   |
| Moderar eventos / comentarios             |    No     |   No    |     No      |  No   |    Si     |  Si   |
| Gestionar usuarios, etiquetas, categorias |    No     |   No    |     No      |  No   |    No     |  Si   |

### API v1 (REST)

Para la autenticación el backend integra Supabase Auth de forma server-side. El frontend inicia sesión con Supabase y el backend valida el token/JWT en cada request, resolviendo el usuario y su rol a partir de ese token.

#### Convenciones

- Base URL: `/api/v1`
- Paginación: `?page=1&pageSize=20`
- Ordenamiento: `?sort=recencia`
- Filtros: `?fechaDesde&fechaHasta&categoria&lugarId&artistaId`

#### Eventos

- `GET /api/v1/eventos`
- `GET /api/v1/eventos/{id}`
- `POST /api/v1/eventos`
- `PATCH /api/v1/eventos/{id}`
- `DELETE /api/v1/eventos/{id}`
- `POST /api/v1/eventos/{id}/publicar`
- `POST /api/v1/eventos/{id}/rechazar`
- `POST /api/v1/eventos/{id}/archivar`

#### Comentarios

- `GET /api/v1/eventos/{id}/comentarios`
- `POST /api/v1/eventos/{id}/comentarios`
- `PATCH /api/v1/comentarios/{id}`
- `DELETE /api/v1/comentarios/{id}`

#### Votos

- `POST /api/v1/eventos/{id}/votos`
- `DELETE /api/v1/eventos/{id}/votos`
- `POST /api/v1/comentarios/{id}/votos`
- `DELETE /api/v1/comentarios/{id}/votos`

#### Favoritos y seguimiento

- `GET /api/v1/usuarios/me/favoritos`
- `POST /api/v1/eventos/{id}/favoritos`
- `DELETE /api/v1/eventos/{id}/favoritos`
- `GET /api/v1/usuarios/me/seguimientos`
- `POST /api/v1/seguimientos`
- `DELETE /api/v1/seguimientos/{id}`

#### Perfiles y entidades

- `GET /api/v1/artistas`
- `GET /api/v1/artistas/{id}`
- `PATCH /api/v1/artistas/{id}`
- `POST /api/v1/artistas/{id}/reclamar`
- `GET /api/v1/lugares`
- `GET /api/v1/lugares/{id}`
- `PATCH /api/v1/lugares/{id}`
- `POST /api/v1/lugares/{id}/reclamar`

#### Moderación y reportes

- `GET /api/v1/moderacion/pendientes`
- `POST /api/v1/moderacion/acciones`
- `GET /api/v1/reportes`
- `POST /api/v1/reportes`

#### Admin

- `GET /api/v1/admin/usuarios`
- `PATCH /api/v1/admin/usuarios/{id}/rol`
- `GET /api/v1/admin/categorias`
- `POST /api/v1/admin/categorias`
- `DELETE /api/v1/admin/categorias/{id}`

### Restricciones de datos e índices

- Unicidad: `USUARIO.email` único, `VOTO_EVENTO` y `VOTO_COMENTARIO` únicos por usuario/objeto, `SEGUIMIENTO` único por usuario/objetivo.
- Requeridos: `EVENTO.titulo`, `EVENTO.inicia_en`, `EVENTO.lugar_id`, `COMENTARIO.cuerpo`, `USUARIO.nombre_mostrar`.
- Índices sugeridos: `EVENTO(inicia_en)`, `EVENTO(estado)`, `EVENTO(lugar_id)`, `EVENTO_ARTISTA(artista_id)`, `SEGUIMIENTO(usuario_id)`, `FAVORITO(usuario_id)`, `COMENTARIO(evento_id)`, `REPORTE(estado)`.
- Búsqueda: índice de texto para `EVENTO.titulo` y `EVENTO.descripcion` para filtros por palabra clave.

### Contratos mínimos de API (ejemplos)

- `POST /api/v1/eventos`
  - Request: `titulo`, `descripcion`, `inicia_en`, `lugar_id`, `artistas[]`.
  - Response: `id`, `estado`, `creado_en`.
- `GET /api/v1/eventos`
  - Response: lista con `id`, `titulo`, `inicia_en`, `lugar`, `votos`.
- `POST /api/v1/moderacion/acciones`
  - Request: `tipo_objetivo`, `objetivo_id`, `accion`, `nota`.
  - Response: `id`, `estado_objetivo`.

### Datos de prueba

- 10 eventos con fechas futuras y pasadas.
- 5 artistas y 5 lugares con perfiles básicos.
- 1 moderador y 1 admin con credenciales de desarrollo.

### Configuración de entorno

- `DATABASE_URL`
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `R2_ENDPOINT`, `R2_BUCKET`, `R2_ACCESS_KEY`, `R2_SECRET_KEY`

### Mapa de UI (alto nivel)

- Feed (listado + filtros)
- Detalle de evento (info + comentarios + votos)
- Publicar evento (formulario)
- Panel de moderación (pendientes + acciones)

## Lineamientos de frontend

- Diseño base: tipografía legible, escala de espaciado consistente, paleta breve con estados (exito, error, advertencia).
- Manejo de estado: React Query para datos remotos; estado local con hooks; cacheado por vistas principales.
- Formularios: validación de campos obligatorios, mensajes de error claros, y estados de carga/empty/error en cada pantalla.
- Rutas: `/` (feed), `/eventos/:id`, `/publicar`, `/artistas/:id`, `/lugares/:id`, `/moderacion`.
- Acceso: botones y acciones visibles según rol; rutas de moderación y publicación protegidas.

### Flujos clave

#### Publicación de evento con moderación

Flujo principal: el usuario crea el evento, se valida campos obligatorios, se muestra advertencia de posibles duplicados, se guarda en estado `PENDIENTE`, y queda disponible en el panel de moderación hasta ser aprobado o rechazado.

Casos borde: evento con datos incompletos (bloqueo), evento con duplicado de alta confianza (requiere confirmación), evento rechazado (se solicita corrección y reenvío).

#### Moderación de eventos y comentarios

Flujo principal: el moderador revisa el contenido pendiente, aplica aprobación o rechazo, y registra una nota interna. En comentarios, puede ocultar o restaurar cuando haya reportes.

Casos borde: múltiples reportes simultáneos (ocultamiento preventivo), contenido reiterado (escalado a admin).

#### Reclamo de perfil de artista/lugar

Flujo principal: el usuario solicita reclamo, se valida que el rol sea compatible, el admin revisa la evidencia y aprueba; el perfil queda vinculado a la cuenta.

Casos borde: reclamo duplicado (se rechaza), reclamo inválido (se solicita documentación adicional).

#### Seguimiento y notificaciones

Flujo principal: el usuario sigue una entidad, recibe alertas internas por nuevos eventos y puede silenciarlas por entidad desde su perfil.

Casos borde: seguimiento masivo (limitar cantidad por usuario), notificaciones repetidas (se agrupan por evento).

#### Votos y visibilidad

Flujo principal: el usuario vota un evento/comentario, el contador se actualiza y el indicador de votos se refleja en el detalle y en el feed.

Casos borde: múltiples votos desde la misma cuenta (bloqueo), actividad alta (actualización por lotes).

#### Detección de duplicados

Flujo principal: el sistema calcula la confianza de duplicado con señales definidas, muestra candidatos y permite vincular o continuar.

Casos borde: alta confianza con insistencia del usuario (marcar `posible_duplicado`), duplicados persistentes (escalación a moderación).

### Política de moderación (resumen)

- Umbrales: contenido con múltiples reportes entra en ocultamiento preventivo hasta revisión.
- SLA: revisión de eventos pendientes en 48 horas en fase MVP.
- Escalamiento: reincidencias o conflictos pasan al admin con nota de moderación.
- Auditoría: toda acción queda registrada con moderador, motivo y fecha.

## Plan por etapas

El desarrollo se organiza en tres fases para controlar el alcance y asegurar entregas incrementales.

### Fase 1: Prototipo

Objetivo: validar el flujo principal y la propuesta de valor con un alcance reducido.

Alcance:

- Feed con filtros básicos y detalle de evento.
- Publicación de eventos con moderación manual simple.
- Perfiles básicos de artistas y lugares.
- Comentarios sin hilos avanzados ni métricas.

Criterios de cierre:

- Publicar y visualizar eventos de punta a punta.
- Moderación funcional con aprobación/rechazo.
- Feedback inicial de usuarios o equipo docente.

### Fase 2: MVP

Objetivo: habilitar funcionalidades clave de comunidad y personalización.

Alcance:

- Seguimiento de artistas y lugares con alertas internas.
- Votos en eventos y comentarios, con visualización en el feed.
- Detección de duplicados con advertencias al publicar.
- Reclamo de perfiles no reclamados.

Criterios de cierre:

- Flujo completo de publicación, moderación y reclamo.
- Feed con orden por recencia y conteo visible de votos.
- Notificaciones básicas configurables por el usuario.

### Fase 3: Producción

Objetivo: estabilizar operación, mejorar confiabilidad y preparar escalamiento.

Alcance:

- Métricas y reportes para roles especiales.
- Mejoras de rendimiento y monitoreo.
- Políticas y auditoría de moderación consistentes.

Criterios de cierre:

- Rendimiento dentro de objetivos definidos en NFR.
- Trazabilidad de acciones de moderación.
- Backups y políticas de retención activas.

### Requerimientos no funcionales

- Rendimiento: carga inicial del feed < 2s en conexiones promedio; acciones críticas (votar, comentar, seguir) < 500ms.
- Disponibilidad: objetivo 99.5% mensual en entornos productivos.
- Privacidad y datos: datos personales mínimos, cifrado en tránsito, retención de logs de auditoría por 180 días.
- Accesibilidad: cumplimiento WCAG 2.1 AA en vistas principales.

## Preparación para implementación (Fases 1 y 2)

### Checklist de alcance para Fase 1 (Prototipo)

- Pantallas mínimas: feed, detalle de evento, publicar evento, panel de moderación.
- Endpoints mínimos: listar eventos, detalle de evento, crear evento, aprobar/rechazar.
- Autenticación: login básico para roles internos (miembro y moderador).

### Criterios de aceptación por flujo

- Publicación: un usuario registrado puede crear un evento con datos obligatorios, queda en `PENDIENTE` y aparece en moderación.
- Moderación: un moderador aprueba o rechaza, y el estado se refleja en el feed.
- Reclamo (Fase 2): un artista/lugar solicita reclamo y el admin lo aprueba, vinculando el perfil.
