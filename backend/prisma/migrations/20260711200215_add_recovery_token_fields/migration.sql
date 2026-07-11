-- AlterTable
ALTER TABLE "Usuario" ADD COLUMN     "token_recuperacion" TEXT,
ADD COLUMN     "token_recuperacion_expira" TIMESTAMP(3);
