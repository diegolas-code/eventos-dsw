-- CreateEnum
CREATE TYPE "TipoAccionModeracion" AS ENUM ('APROBAR', 'RECHAZAR', 'ARCHIVAR');

-- CreateTable
CREATE TABLE "AccionModeracion" (
    "id" TEXT NOT NULL,
    "evento_id" TEXT NOT NULL,
    "moderador_id" TEXT NOT NULL,
    "tipo_accion" "TipoAccionModeracion" NOT NULL,
    "nota" TEXT,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AccionModeracion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AccionModeracion_evento_id_idx" ON "AccionModeracion"("evento_id");

-- CreateIndex
CREATE INDEX "AccionModeracion_moderador_id_idx" ON "AccionModeracion"("moderador_id");

-- AddForeignKey
ALTER TABLE "AccionModeracion" ADD CONSTRAINT "AccionModeracion_evento_id_fkey" FOREIGN KEY ("evento_id") REFERENCES "Evento"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccionModeracion" ADD CONSTRAINT "AccionModeracion_moderador_id_fkey" FOREIGN KEY ("moderador_id") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;
