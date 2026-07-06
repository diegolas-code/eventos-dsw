# Sistema de Comentarios Modulares - Plan de Implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implementar un sistema de comentarios modular y auto-contenido para los eventos, conectando la API del backend (con relación de usuarios en base de datos) y un componente React reutilizable en el frontend.

**Architecture:** El backend incluirá la relación `usuario` en la consulta Prisma de comentarios para resolver identidades. El frontend encapsulará toda la lógica de obtención, creación, borrado y renderizado de comentarios dentro de un componente modular `<CommentsSection />` que se monta de manera independiente.

**Tech Stack:** Node.js, Express, Prisma ORM, React, Tailwind CSS, TanStack React Query, Axios.

## Global Constraints

- Las modificaciones deben preservar la estructura de tipado CamelCase existente.
- Los componentes de frontend deben usar Tailwind CSS y estilos fluidos acordes al diseño premium (glassmorphism/tarjetas modernas).
- Todas las llamadas a la API deben usar el cliente configurado en `web/src/services/api.ts`.
- Mantener la compatibilidad con TypeScript en todos los archivos modificados.

---

### Task 1: Backend Database & Store Updates

**Files:**

- Modify: `backend/src/store.ts`

**Interfaces:**

- Consumes: Prisma Client, `CreateComentarioInput` DTO.
- Produces: Actualización de la interfaz `Comentario` y las funciones `listComentariosByEvento` y `createComentario` para incluir información del autor (`usuario`).

- [ ] **Step 1: Modificar la interfaz `Comentario`**
      Añadir el campo opcional `usuario` en la interfaz `Comentario` de [store.ts](file:///C:/Users/Diegolas/Code/Web/_insti/SITIO%20EVENTOS/eventos-dsw/backend/src/store.ts):

  ```typescript
  export interface Comentario {
    id: string;
    eventoId: string;
    usuarioId: string | null;
    padreId: string | null;
    cuerpo: string;
    creadoEn: string;
    actualizadoEn: string;
    usuario?: {
      id: string;
      nombreMostrar: string;
    } | null;
  }
  ```

- [ ] **Step 2: Actualizar la función mapeadora `mapComentario`**
      Modificar la función `mapComentario` en [store.ts](file:///C:/Users/Diegolas/Code/Web/_insti/SITIO%20EVENTOS/eventos-dsw/backend/src/store.ts) para extraer los campos del usuario si existen:

  ```typescript
  const mapComentario = (c: any): Comentario => ({
    id: c.id,
    eventoId: c.evento_id,
    usuarioId: c.usuario_id,
    padreId: c.padre_id,
    cuerpo: c.cuerpo,
    creadoEn: c.creado_en.toISOString(),
    actualizadoEn: c.actualizado_en.toISOString(),
    usuario: c.usuario
      ? {
          id: c.usuario.id,
          nombreMostrar: c.usuario.nombre_mostrar,
        }
      : null,
  });
  ```

- [ ] **Step 3: Actualizar consultas en `store.ts`**
      Añadir `include: { usuario: true }` a las llamadas de Prisma en `listComentariosByEvento` y `createComentario`:

  ```typescript
  export const listComentariosByEvento = async (eventoId: string): Promise<Comentario[]> => {
    const data = await prisma.comentario.findMany({
      where: { evento_id: eventoId },
      include: { usuario: true },
      orderBy: { creado_en: 'asc' },
    });
    return data.map(mapComentario);
  };

  export const createComentario = async (
    eventoId: string,
    input: CreateComentarioInput
  ): Promise<Comentario | null> => {
    try {
      const data = await prisma.comentario.create({
        data: {
          evento_id: eventoId,
          cuerpo: input.cuerpo,
          usuario_id: input.usuarioId ?? null,
          padre_id: input.padreId ?? null,
        },
        include: { usuario: true },
      });
      return mapComentario(data);
    } catch {
      return null;
    }
  };
  ```

- [ ] **Step 4: Verificar la compilación del backend**
      Ejecutar el build del backend para asegurar que no hay errores de TypeScript.
      Run: `npm run build` en el directorio `backend`
      Expected: Compilación exitosa sin errores.

- [ ] **Step 5: Commit de cambios**
  ```bash
  git add backend/src/store.ts
  git commit -m "backend: include usuario relation in comments mapping and queries"
  ```

---

### Task 2: Frontend Service Alignment & Additions

**Files:**

- Modify: `web/src/services/comentarioService.ts`

**Interfaces:**

- Consumes: Cliente Axios configurado.
- Produces: Exportación de `createComentario` con payload alineado y `deleteComentario`.

- [ ] **Step 1: Corregir las claves del payload en `createComentario`**
      Modificar [comentarioService.ts](file:///C:/Users/Diegolas/Code/Web/_insti/SITIO%20EVENTOS/eventos-dsw/web/src/services/comentarioService.ts) para mapear correctamente las variables esperadas por el backend (`cuerpo`, `usuarioId`, `padreId`):

  ```typescript
  export async function createComentario(
    eventoId: string,
    comentarioData: { cuerpo: string; usuarioId: string; padreId?: string }
  ) {
    const response = await api.post(`/eventos/${eventoId}/comentarios`, {
      cuerpo: comentarioData.cuerpo,
      usuarioId: comentarioData.usuarioId,
      padreId: comentarioData.padreId || null,
    });
    return response.data.data;
  }
  ```

- [ ] **Step 2: Agregar el servicio `deleteComentario`**
      Añadir al final de [comentarioService.ts](file:///C:/Users/Diegolas/Code/Web/_insti/SITIO%20EVENTOS/eventos-dsw/web/src/services/comentarioService.ts):

  ```typescript
  export async function deleteComentario(id: string) {
    await api.delete(`/comentarios/${id}`);
  }
  ```

- [ ] **Step 3: Verificar compilación del frontend**
      Ejecutar el build o validación en `web`.
      Run: `npm run build` en el directorio `web`
      Expected: Compilación limpia.

- [ ] **Step 4: Commit de cambios**
  ```bash
  git add web/src/services/comentarioService.ts
  git commit -m "frontend: align comment service payload and add delete method"
  ```

---

### Task 3: Self-contained CommentsSection Component

**Files:**

- Create: `web/src/Components/events/CommentsSection.tsx`

**Interfaces:**

- Consumes: `getComentariosByEvento`, `createComentario`, `deleteComentario` desde `comentarioService.ts`.
- Produces: Componente de React auto-contenido `<CommentsSection eventId={string} />` con lógica propia de estado, queries y mutaciones.

- [ ] **Step 1: Crear el archivo y definir la estructura básica**
      Crear [CommentsSection.tsx](file:///C:/Users/Diegolas/Code/Web/_insti/SITIO%20EVENTOS/eventos-dsw/web/src/Components/events/CommentsSection.tsx) con la importación de `useQuery`, `useMutation` y los servicios.

- [ ] **Step 2: Implementar consulta y mutaciones de comentarios**
      Añadir lógica de React Query usando hooks:

  ```tsx
  const { data: comments = [], isLoading } = useQuery({
    queryKey: ['comments', eventId],
    queryFn: () => getComentariosByEvento(eventId),
  });
  ```

  Implementar mutaciones de inserción y borrado que invaliden `["comments", eventId]` al finalizar.

- [ ] **Step 3: Diseñar e implementar la UI premium**
  - Diseñar una tarjeta con sombreados suaves y bordes redondeados.
  - Formatear fechas.
  - Diseñar avatares utilizando la primera letra del nombre del usuario y colores agradables.
  - Botón de papelera para el autor del comentario (comparando el ID del token de sesión guardado en `localStorage`).
  - Textarea moderno para nuevos comentarios, con botón "Comentar" deshabilitado si está vacío.
  - Mostrar placeholder amigable si no hay comentarios o si el usuario no ha iniciado sesión.

- [ ] **Step 4: Verificar la compilación del frontend**
      Run: `npm run build` en `web`
      Expected: Sin errores.

- [ ] **Step 5: Commit del componente**
  ```bash
  git add web/src/Components/events/CommentsSection.tsx
  git commit -m "frontend: implement self-contained CommentsSection component"
  ```

---

### Task 4: UI Integration in Event Page

**Files:**

- Modify: `web/src/Pages/EventPage/EventPage.tsx`

**Interfaces:**

- Consumes: Componente `<CommentsSection />` de `web/src/Components/events/CommentsSection.tsx`.
- Produces: Renderización de la sección de comentarios en el pie de la vista de detalles.

- [ ] **Step 1: Importar el componente**
      Importar `CommentsSection` en [EventPage.tsx](file:///C:/Users/Diegolas/Code/Web/_insti/SITIO%20EVENTOS/eventos-dsw/web/src/Pages/EventPage/EventPage.tsx).

- [ ] **Step 2: Renderizar el componente**
      Colocar `<CommentsSection eventId={data.id} />` al final del contenedor de detalles (después de la descripción).

- [ ] **Step 3: Probar la integración local**
      Levantar servidores locales de backend y frontend para validar el flujo completo (ver comentarios, escribir comentario, borrar comentario propio, ocultación de botón de borrado en comentarios ajenos, prompt de login para invitados).

- [ ] **Step 4: Commit de la integración**
  ```bash
  git add web/src/Pages/EventPage/EventPage.tsx
  git commit -m "frontend: integrate CommentsSection on EventPage"
  ```
