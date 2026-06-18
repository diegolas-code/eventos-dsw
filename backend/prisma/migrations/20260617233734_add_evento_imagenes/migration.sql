-- CreateTable
CREATE TABLE "EventoImagen" (
    "id" TEXT NOT NULL,
    "evento_id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "orden" INTEGER NOT NULL DEFAULT 0,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EventoImagen_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "EventoImagen_evento_id_idx" ON "EventoImagen"("evento_id");

-- AddForeignKey
ALTER TABLE "EventoImagen" ADD CONSTRAINT "EventoImagen_evento_id_fkey" FOREIGN KEY ("evento_id") REFERENCES "Evento"("id") ON DELETE CASCADE ON UPDATE CASCADE;
