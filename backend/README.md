# Backend

API inicial en Express + TypeScript para la cartelera de eventos.

Este backend está fijado a Prisma 6. Por eso el schema usa la sintaxis clásica con `url = env("DATABASE_URL")` dentro de `schema.prisma`.

## Requisitos previos

- Node.js 18+
- `npm install` en la raíz y dentro de `backend/`
- Verificar que la instalación local de Prisma sea la 6.x (`prisma` y `@prisma/client` en `backend/package.json`)

## Scripts

```powershell
npm run dev --prefix backend
npm run build --prefix backend
npm run start --prefix backend
npm run lint --prefix backend
npm run typecheck --prefix backend
npm run prisma:generate --prefix backend
npm run prisma:migrate --prefix backend
npm run prisma:studio --prefix backend
```

## Endpoints iniciales

- `GET /health`
- `GET /eventos`
- `POST /eventos`
- `GET /eventos/:id`
- `PATCH /eventos/:id`
- `DELETE /eventos/:id`
- `GET /eventos/:id/comentarios`
- `POST /eventos/:id/comentarios`
- `PATCH /comentarios/:id`
- `DELETE /comentarios/:id`
