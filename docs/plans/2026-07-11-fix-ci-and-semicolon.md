# Plan de Implementación: Corrección de CI y Error de Punto y Coma 🛠️

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Solucionar el fallo en las comprobaciones de integración continua (CI) en GitHub Actions mediante la corrección de un error sintáctico de punto y coma en el código del recordatorio de eventos y la reconfiguración del pipeline de CI para instalar dependencias de submódulos y generar tipos de Prisma.

**Architecture:**

1. **Semicolon Fix:** Añadir el punto y coma faltante en la importación de `backend/src/jobs/eventReminder.ts`.
2. **CI Workflow Adjustment:** Modificar `.github/workflows/ci.yml` para ejecutar `npm run setup` en lugar de `npm ci`, garantizando que se instalen las dependencias locales de `backend/` y `web/`, y se genere el cliente Prisma antes de la ejecución de ESLint.

**Tech Stack:** GitHub Actions, Node.js, ESLint, Prisma

## Global Constraints

- Utilizar la configuración de scripts existente en `package.json`.
- Evitar cambios innecesarios en la estructura del workflow de GitHub Actions.

---

### Task 1: Corregir Punto y Coma en Event Recordatorio

**Files:**

- Modify: `backend/src/jobs/eventReminder.ts:4`

- [ ] **Step 1: Modificar `eventReminder.ts`**
      Abrir [eventReminder.ts](file:///C:/Users/Diegolas/Code/Web/_insti/SITIO%20EVENTOS/eventos-dsw/backend/src/jobs/eventReminder.ts) y añadir el punto y coma en la línea 4.
      Cambiar de:
      `typescript
  import { asistenciaTemplate } from "../templates/asistencia_template.js"
  `
      a:
      `typescript
  import { asistenciaTemplate } from "../templates/asistencia_template.js";
  `

- [ ] **Step 2: Verificar linter local**
      Run: `npm run lint` en el directorio raíz
      Expected: No debe retornar errores de punto y coma (`semi`) en `eventReminder.ts`.

- [ ] **Step 3: Commitear cambios**
      `bash
  git add backend/src/jobs/eventReminder.ts
  git commit -m "fix(backend): add missing semicolon in eventReminder.ts import"
  `

---

### Task 2: Modificar Workflow de CI

**Files:**

- Modify: `.github/workflows/ci.yml`

- [ ] **Step 1: Modificar `ci.yml`**
      Abrir [.github/workflows/ci.yml](file:///C:/Users/Diegolas/Code/Web/_insti/SITIO%20EVENTOS/eventos-dsw/.github/workflows/ci.yml) y cambiar la instalación de dependencias para ejecutar el script de setup del monorepo.
      Cambiar de:
      `yaml
        - name: Install dependencies
          run: npm ci
  `
      a:
      `yaml
        - name: Install dependencies
          run: npm run setup
  `

- [ ] **Step 2: Commitear cambios**
      `bash
  git add .github/workflows/ci.yml
  git commit -m "chore(ci): run setup script instead of root npm ci to install backend/frontend deps and generate prisma client"
  `
