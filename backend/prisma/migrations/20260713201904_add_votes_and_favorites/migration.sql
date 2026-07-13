-- CreateTable
CREATE TABLE "VotoEvento" (
    "usuario_id" TEXT NOT NULL,
    "evento_id" TEXT NOT NULL,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VotoEvento_pkey" PRIMARY KEY ("usuario_id","evento_id")
);

-- CreateTable
CREATE TABLE "Favorito" (
    "usuario_id" TEXT NOT NULL,
    "evento_id" TEXT NOT NULL,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Favorito_pkey" PRIMARY KEY ("usuario_id","evento_id")
);

-- CreateIndex
CREATE INDEX "VotoEvento_evento_id_idx" ON "VotoEvento"("evento_id");

-- CreateIndex
CREATE INDEX "VotoEvento_usuario_id_idx" ON "VotoEvento"("usuario_id");

-- CreateIndex
CREATE INDEX "Favorito_evento_id_idx" ON "Favorito"("evento_id");

-- CreateIndex
CREATE INDEX "Favorito_usuario_id_idx" ON "Favorito"("usuario_id");

-- AddForeignKey
ALTER TABLE "VotoEvento" ADD CONSTRAINT "VotoEvento_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VotoEvento" ADD CONSTRAINT "VotoEvento_evento_id_fkey" FOREIGN KEY ("evento_id") REFERENCES "Evento"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Favorito" ADD CONSTRAINT "Favorito_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Favorito" ADD CONSTRAINT "Favorito_evento_id_fkey" FOREIGN KEY ("evento_id") REFERENCES "Evento"("id") ON DELETE CASCADE ON UPDATE CASCADE;
