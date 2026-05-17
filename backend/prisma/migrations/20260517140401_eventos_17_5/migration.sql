-- CreateTable
CREATE TABLE "Usuario" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "nombre_mostrar" TEXT NOT NULL,
    "rol" TEXT NOT NULL DEFAULT 'miembro',
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PerfilEntidad" (
    "id" TEXT NOT NULL,
    "usuario_id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "descripcion" TEXT,
    "direccion" TEXT,
    "gmaps_url" TEXT,
    "reclamado" BOOLEAN NOT NULL DEFAULT false,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

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
    "estado" TEXT NOT NULL DEFAULT 'PENDIENTE',
    "entidad_lugar_id" TEXT,
    "posible_duplicado" BOOLEAN NOT NULL DEFAULT false,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Evento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Comentario" (
    "id" TEXT NOT NULL,
    "evento_id" TEXT NOT NULL,
    "usuario_id" TEXT,
    "padre_id" TEXT,
    "cuerpo" TEXT NOT NULL,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Comentario_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");

-- CreateIndex
CREATE UNIQUE INDEX "PerfilEntidad_usuario_id_key" ON "PerfilEntidad"("usuario_id");

-- AddForeignKey
ALTER TABLE "Evento" ADD CONSTRAINT "Evento_creado_por_usuario_id_fkey" FOREIGN KEY ("creado_por_usuario_id") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comentario" ADD CONSTRAINT "Comentario_evento_id_fkey" FOREIGN KEY ("evento_id") REFERENCES "Evento"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comentario" ADD CONSTRAINT "Comentario_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;
