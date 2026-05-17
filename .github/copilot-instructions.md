# LLM Development Instructions - Cartelera Eventos Mar del Plata

You are an expert full-stack developer assisting in the creation of a local event billboard app. Follow these instructions strictly to maintain architectural integrity and project scope.

## 1. Core Project Context
- **Goal**: A platform to publish and discover local events (concerts, workshops, etc.) in Mar del Plata.
- **Phasing**: We are following a staged approach (Phase 0 to Phase 4). Always prioritize the current Phase's goals.
- **Tone**: Professional, idiomatic code, and surgical updates.

## 2. Tech Stack & Standards
- **Backend**: Node.js with **Express**. Use TypeScript.
- **Frontend**: **React** with **Vite** and TypeScript. Use React Query for data fetching.
- **Database**: **PostgreSQL** with **Prisma ORM**.
- **Auth**: **Supabase Auth**. Use a centralized middleware for Role-Based Access Control (RBAC).
- **Styling**: Vanilla CSS or a lightweight framework. Keep it clean and accessible.
- **Images**: Use placeholder URLs or external links for now. Cloudflare R2 is deferred to the final stages.

## 3. Critical Architecture Rules

### A. Unified Entity Model
Do NOT create separate tables for Artists and Venues. Use a single `PERFIL_ENTIDAD` table with a `tipo` field ('artista' or 'lugar').
- **Reason**: Simplifies relationships and reduces code duplication.

### B. Simplified Duplicate Detection
When creating an event, check only for:
1. **Same Venue** (`entidad_lugar_id`).
2. **Same Day** (extract date from `inicia_en`).
3. **Overlapping Artists** (check `EVENTO_ARTISTA` links).
If these match, flag the event as `posible_duplicado`. No complex similarity scores.

### C. Event Lifecycle & Moderation
- All events start as `PENDIENTE`.
- Only Moderators or Admins can transition an event to `PUBLICADO`.
- Rejections must include a reason/note for the creator.

### D. Centralized RBAC Middleware
All protected routes must use a centralized middleware that:
1. Validates the Supabase JWT.
2. Checks the user's role against the required permissions for that route.

## 4. Database Entities (High-Level)
- **USUARIO**: email, nombre_mostrar, rol (miembro, entidad, moderador, admin).
- **PERFIL_ENTIDAD**: usuario_id, nombre, tipo, descripcion, direccion, gmaps_url, reclamado.
- **EVENTO**: creado_por_usuario_id, titulo, descripcion, inicia_en, termina_en, estado (PENDIENTE, PUBLICADO, RECHAZADO, ARCHIVADO), entidad_lugar_id, posible_duplicado.
- **COMENTARIO**: evento_id, usuario_id, padre_id (for threads), cuerpo.
- **Interactions**: FAVORITO, SEGUIMIENTO, VOTO_EVENTO, VOTO_COMENTARIO.

## 5. Development Workflow
1. **Research**: Always check `spec.md` and `TODO.md` before starting a task.
2. **Implementation**: Focus on surgical edits. Don't refactor unrelated code.
3. **Verification**: Always provide a plan to test the change (e.g., specific endpoints to hit or UI states to check).
4. **Iterative Documentation**: After completing a major iteration or Phase, create a new file in a `docs/iterations/` directory (e.g., `docs/iterations/phase-0-summary.md`) documenting:
   - What was implemented.
   - Key architectural decisions made.
   - Any technical debt or items deferred to future phases.
   - How to verify the current state.
5. **Version control practices**: Commit early and often with small, focused changes; create feature branches for new work and open pull requests for review. Use descriptive commit messages, link PRs to issues, and push frequently to the remote repository to keep CI/CD and collaborators in sync.

## 6. Current Phase: Phase 0
- Goal: Setup repo structure, basic Express API (CRUD for Events/Comments), and a minimal React app to display them.
- No Auth yet (handled in Phase 1).
