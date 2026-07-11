# Plan de Implementación: Corrección del Bug de Eliminación de Cuenta 🛠️

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Solucionar el bug donde el usuario no es deslogueado ni redirigido después de eliminar su cuenta exitosamente desde el dashboard de control.

**Architecture:** Propagar la función `handleLogout` definida en `ProfilePage.tsx` como la prop `onCerrarSesionClick` en la invocación de `DashboardView`, permitiendo que el componente limpie el `localStorage` y actualice el estado de sesión de React tras la eliminación física del registro de usuario.

**Tech Stack:** React, React Router Dom, LocalStorage, Axios

## Global Constraints

- Las llamadas a la API deben utilizar la instancia global de `api` de Axios.
- Mantener la compatibilidad estricta con TypeScript en el tipado de los props.
- No introducir dependencias adicionales.

---

### Task 1: Propagar Callback de Cierre de Sesión en el Perfil

**Files:**

- Modify: `web/src/Pages/ProfilePage/ProfilePage.tsx:134-138`

**Interfaces:**

- Consumes: `handleLogout` callback in `ProfilePage.tsx`
- Produces: Inyección del prop `onCerrarSesionClick` en `<DashboardView />`

- [ ] **Step 1: Modificar `ProfilePage.tsx`**
      Abrir [ProfilePage.tsx](file:///C:/Users/Diegolas/Code/Web/_insti/SITIO%20EVENTOS/eventos-dsw/web/src/Pages/ProfilePage/ProfilePage.tsx) y localizar la invocación del componente `<DashboardView>` (cerca de la línea 134).
      Cambiar de:
      `tsx
  <DashboardView
    usuarioData={usuario}
    onEditarPerfilClick={() => setIsManagingPerfil(true)}
  />
  `
      a:
      `tsx
  <DashboardView
    usuarioData={usuario}
    onEditarPerfilClick={() => setIsManagingPerfil(true)}
    onCerrarSesionClick={handleLogout}
  />
  `

- [ ] **Step 2: Verificar compilación del frontend**
      Ejecutar el typecheck o build en el cliente.
      Run: `npm run build` en el directorio `web`
      Expected: Compilación exitosa sin errores de tipado.

- [ ] **Step 3: Guardar y commitear cambios**
      `bash
  git add web/src/Pages/ProfilePage/ProfilePage.tsx
  git commit -m "fix(profile): pass onCerrarSesionClick callback to DashboardView to clean session after account deletion"
  `

---

### Task 2: Registrar en el Roadmap TODO

**Files:**

- Modify: `TODO.md`

- [ ] **Step 1: Actualizar TODO.md**
      Abrir [TODO.md](file:///C:/Users/Diegolas/Code/Web/_insti/SITIO%20EVENTOS/eventos-dsw/TODO.md) y buscar las tareas pendientes de la Fase 3.
      Marcar como completada o agregar la nota pertinente sobre la corrección del cierre de sesión tras eliminación de cuenta.

- [ ] **Step 2: Commitear cambios**
      `bash
  git add TODO.md
  git commit -m "docs: update TODO list with account deletion fix task"
  `

---

### Task 3: Crear el Registro de Historia de Cambios

**Files:**

- Create: `.history/history_21.md`

- [ ] **Step 1: Crear archivo de historia de cambios**
      Crear el archivo [.history/history_21.md](file:///C:/Users/Diegolas/Code/Web/_insti/SITIO%20EVENTOS/eventos-dsw/.history/history_21.md) y documentar detalladamente la corrección: el problema de la prop faltante, por qué causaba que la sesión permaneciera activa localmente tras la eliminación física del usuario, y cómo la propagación del callback soluciona este comportamiento.

- [ ] **Step 2: Commitear el archivo de historia**
      `bash
  git add .history/history_21.md
  git commit -m "docs: add history_21.md documenting account deletion session cleanup fix"
  `
