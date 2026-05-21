-- CreateEnum
CREATE TYPE "RolUsuario" AS ENUM ('miembro', 'artista', 'lugar', 'moderador', 'admin');

-- CreateEnum
CREATE TYPE "TipoEntidad" AS ENUM ('ARTISTA', 'LUGAR');

-- CreateEnum
CREATE TYPE "EstadoEvento" AS ENUM ('PENDIENTE', 'PUBLICADO', 'RECHAZADO', 'ARCHIVADO');

-- CreateTable
CREATE TABLE "Usuario" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "nombre_mostrar" TEXT NOT NULL,
    "rol" "RolUsuario" NOT NULL DEFAULT 'miembro',
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PerfilEntidad" (
    "id" TEXT NOT NULL,
    "usuario_id" TEXT,
    "nombre" TEXT NOT NULL,
    "tipo" "TipoEntidad" NOT NULL,
    "descripcion" TEXT,
    "direccion" TEXT,
    "gmaps_url" TEXT,
    "imagen_url" TEXT,
    "reclamado" BOOLEAN NOT NULL DEFAULT false,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PerfilEntidad_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Evento" (
    "id" TEXT NOT NULL,
    "creado_por_usuario_id" TEXT,
    "titulo" TEXT NOT NULL,
    "descripcion" TEXT,
    "inicia_en" TIMESTAMP(3) NOT NULL,
    "termina_en" TIMESTAMP(3),
    "estado" "EstadoEvento" NOT NULL DEFAULT 'PENDIENTE',
    "entidad_lugar_id" TEXT,
    "posible_duplicado" BOOLEAN NOT NULL DEFAULT false,
    "imagen_url" TEXT,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Evento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventoArtista" (
    "evento_id" TEXT NOT NULL,
    "artista_id" TEXT NOT NULL,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EventoArtista_pkey" PRIMARY KEY ("evento_id","artista_id")
);

-- CreateTable
CREATE TABLE "Comentario" (
    "id" TEXT NOT NULL,
    "evento_id" TEXT NOT NULL,
    "usuario_id" TEXT,
    "padre_id" TEXT,
    "cuerpo" TEXT NOT NULL,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Comentario_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");

-- CreateIndex
CREATE INDEX "Usuario_rol_idx" ON "Usuario"("rol");

-- CreateIndex
CREATE UNIQUE INDEX "PerfilEntidad_usuario_id_key" ON "PerfilEntidad"("usuario_id");

-- CreateIndex
CREATE INDEX "PerfilEntidad_tipo_idx" ON "PerfilEntidad"("tipo");

-- CreateIndex
CREATE INDEX "PerfilEntidad_nombre_idx" ON "PerfilEntidad"("nombre");

-- CreateIndex
CREATE INDEX "Evento_estado_idx" ON "Evento"("estado");

-- CreateIndex
CREATE INDEX "Evento_inicia_en_idx" ON "Evento"("inicia_en");

-- CreateIndex
CREATE INDEX "Evento_creado_por_usuario_id_idx" ON "Evento"("creado_por_usuario_id");

-- CreateIndex
CREATE INDEX "Evento_entidad_lugar_id_idx" ON "Evento"("entidad_lugar_id");

-- CreateIndex
CREATE INDEX "EventoArtista_artista_id_idx" ON "EventoArtista"("artista_id");

-- CreateIndex
CREATE INDEX "Comentario_evento_id_idx" ON "Comentario"("evento_id");

-- CreateIndex
CREATE INDEX "Comentario_usuario_id_idx" ON "Comentario"("usuario_id");

-- CreateIndex
CREATE INDEX "Comentario_padre_id_idx" ON "Comentario"("padre_id");

-- AddForeignKey
ALTER TABLE "PerfilEntidad" ADD CONSTRAINT "PerfilEntidad_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Evento" ADD CONSTRAINT "Evento_creado_por_usuario_id_fkey" FOREIGN KEY ("creado_por_usuario_id") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Evento" ADD CONSTRAINT "Evento_entidad_lugar_id_fkey" FOREIGN KEY ("entidad_lugar_id") REFERENCES "PerfilEntidad"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventoArtista" ADD CONSTRAINT "EventoArtista_evento_id_fkey" FOREIGN KEY ("evento_id") REFERENCES "Evento"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventoArtista" ADD CONSTRAINT "EventoArtista_artista_id_fkey" FOREIGN KEY ("artista_id") REFERENCES "PerfilEntidad"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comentario" ADD CONSTRAINT "Comentario_evento_id_fkey" FOREIGN KEY ("evento_id") REFERENCES "Evento"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comentario" ADD CONSTRAINT "Comentario_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comentario" ADD CONSTRAINT "Comentario_padre_id_fkey" FOREIGN KEY ("padre_id") REFERENCES "Comentario"("id") ON DELETE CASCADE ON UPDATE CASCADE;
