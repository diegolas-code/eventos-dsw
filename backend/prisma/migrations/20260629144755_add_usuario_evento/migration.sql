-- CreateTable
CREATE TABLE "UsuarioEvento" (
    "usuario_id" TEXT NOT NULL,
    "evento_id" TEXT NOT NULL,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UsuarioEvento_pkey" PRIMARY KEY ("usuario_id","evento_id")
);

-- AddForeignKey
ALTER TABLE "UsuarioEvento" ADD CONSTRAINT "UsuarioEvento_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UsuarioEvento" ADD CONSTRAINT "UsuarioEvento_evento_id_fkey" FOREIGN KEY ("evento_id") REFERENCES "Evento"("id") ON DELETE CASCADE ON UPDATE CASCADE;
