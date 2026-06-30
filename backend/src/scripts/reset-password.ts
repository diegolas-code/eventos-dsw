import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../utils/auth.js';

const prisma = new PrismaClient();

async function main() {
  const args = process.argv.slice(2);
  if (args.length < 2) {
    console.error(
      '❌ Uso incorrecto. Formato: npx tsx src/scripts/reset-password.ts <email> <nueva-contraseña>'
    );
    process.exit(1);
  }

  const email = args[0].trim();
  const rawPassword = args[1];

  console.log(`🔍 Buscando usuario con email: "${email}"...`);
  const usuario = await prisma.usuario.findUnique({
    where: { email },
  });

  if (!usuario) {
    console.error(`❌ Error: No se encontró ningún usuario registrado con el email "${email}".`);
    process.exit(1);
  }

  console.log(`🔐 Generando hash seguro para la nueva contraseña...`);
  const contrasenaHash = await hashPassword(rawPassword);

  console.log(`💾 Actualizando base de datos...`);
  await prisma.usuario.update({
    where: { id: usuario.id },
    data: { contrasena_hash: contrasenaHash },
  });

  console.log(`\n🎉 ¡Contraseña restablecida con éxito para ${email}!`);
  console.log(`Ahora podés iniciar sesión desde la web con tu contraseña actual.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
