-- CreateEnum
CREATE TYPE "CategoriaEvento" AS ENUM ('CONCIERTO', 'EXPOSICION', 'TALLER', 'FERIA', 'TEATRO', 'OTRO');

-- AlterTable
ALTER TABLE "Evento" ADD COLUMN     "categoria" "CategoriaEvento" NOT NULL DEFAULT 'OTRO';
