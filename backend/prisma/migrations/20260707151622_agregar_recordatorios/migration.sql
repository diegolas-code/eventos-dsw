-- AlterTable
ALTER TABLE "Evento" ADD COLUMN     "link_entradas" TEXT;

-- AlterTable
ALTER TABLE "UsuarioEvento" ADD COLUMN     "recordatorio_enviado" BOOLEAN NOT NULL DEFAULT false;
