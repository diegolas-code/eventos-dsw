# Registro de Historia 21: Corrección de Cierre de Sesión tras Eliminación de Cuenta 🛠\_

**Fecha:** 11 de Julio, 2026  
**Autores:** Melisa Segura (Colaboradora), Diegolas (Colaborador) y Antigravity (AI Coding Assistant)  
**Objetivo:** Corregir el bug en la sección de perfil de usuario en el frontend donde el usuario no se deslogueaba ni se le limpiaba la sesión tras realizar la eliminación permanente de su cuenta.

---

## 📝 Descripción del Problema

Al fusionar la rama de control de perfil y seguridad, Meli había implementado una función llamada `handleEliminarCuenta` en el panel de control del usuario ([DashboardView.tsx](file:///C:/Users/Diegolas/Code/Web/_insti/SITIO%20EVENTOS/eventos-dsw/web/src/Pages/ProfilePage/DashboardView.tsx#L146-L163)). Dicha función solicita la baja física en el backend mediante `DELETE /usuarios/:id` y, en caso de éxito, llama a la prop callback `onCerrarSesionClick()`:

```typescript
const handleEliminarCuenta = async () => {
  if (window.confirm('...')) {
    try {
      await api.delete(`/usuarios/${usuarioData.id}`);
      alert('Cuenta eliminada con éxito.');
      if (onCerrarSesionClick) onCerrarSesionClick();
    } catch (err) {
      ...
    }
  }
};
```

Sin embargo, el componente contenedor [ProfilePage.tsx](file:///C:/Users/Diegolas/Code/Web/_insti/SITIO%20EVENTOS/eventos-dsw/web/src/Pages/ProfilePage/ProfilePage.tsx) renderizaba el dashboard omitiendo inyectar esta prop:

```tsx
<DashboardView usuarioData={usuario} onEditarPerfilClick={() => setIsManagingPerfil(true)} />
```

Como consecuencia de este desajuste, la función `onCerrarSesionClick` resultaba ser `undefined` y el frontend nunca ejecutaba el flujo de cierre de sesión (`handleLogout`). Esto dejaba en `localStorage` datos de sesión caducados y no existentes en base de datos (`demo_session_id`, `token`, etc.), impidiendo la redirección al formulario de inicio de sesión y rompiendo el comportamiento esperado de la interfaz.

---

## 🔧 Cambios Implementados

### 1. Inyección del Prop Callback en el Contenedor

Se modificó [ProfilePage.tsx](file:///C:/Users/Diegolas/Code/Web/_insti/SITIO%20EVENTOS/eventos-dsw/web/src/Pages/ProfilePage/ProfilePage.tsx) en la renderización de la sección de vistas de usuario para propagar el método `handleLogout` (que limpia las variables de almacenamiento local y reinicia los estados del componente React) en la prop `onCerrarSesionClick`:

```tsx
<DashboardView
  usuarioData={usuario}
  onEditarPerfilClick={() => setIsManagingPerfil(true)}
  onCerrarSesionClick={handleLogout}
/>
```

### 2. Actualización de Documentación

- Se actualizó [TODO.md](file:///C:/Users/Diegolas/Code/Web/_insti/SITIO%20EVENTOS/eventos-dsw/TODO.md) para añadir e identificar esta corrección como completada dentro de los hitos de la Fase 3.
- Se generó esta bitácora histórica de depuración en [.history/history_21.md](file:///C:/Users/Diegolas/Code/Web/_insti/SITIO%20EVENTOS/eventos-dsw/.history/history_21.md).

---

## 🧪 Verificación de Compilación

Se ejecutó la prueba de construcción completa del frontend mediante:

```bash
npm run build --prefix web
```

La construcción finalizó con éxito sin advertencias ni fallos de tipado estático en TypeScript.
