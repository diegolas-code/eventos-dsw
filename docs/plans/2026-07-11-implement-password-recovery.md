# Plan de Implementación: Flujo Completo de Recuperación de Contraseña 🛠️

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implementar un flujo real y seguro para la recuperación de contraseña (olvidó su clave) utilizando tokens temporales almacenados en base de datos y envío de correos vía SMTP.

**Architecture:**

1. **Model Adjustment:** Agregar `token_recuperacion` (String?) y `token_recuperacion_expira` (DateTime?) al modelo `Usuario` en `schema.prisma`.
2. **Backend API:** Crear endpoints en `backend/src/routes/auth.ts`:
   - `POST /forgot-password`: Valida correo, genera un token (UUID), guarda en DB con expiración de 1 hora, y envía link de restablecimiento por email.
   - `POST /reset-password`: Valida el token y su vigencia, hashea la nueva clave, actualiza el usuario, y limpia el token de la DB.
3. **Frontend Views:**
   - Actualizar `LoginForm.tsx` para llamar a `POST /forgot-password` en modo recuperación.
   - Crear `ResetPasswordPage.tsx` en `web/src/Pages/ProfilePage` para renderizar el formulario de nueva clave.
   - Registrar la ruta `/restablecer-clave` en `AppRoutes.tsx`.

**Tech Stack:** Node.js, Express, Prisma, bcryptjs, React, React Router Dom, Axios

## Global Constraints

- Utilizar la instancia global de `api` para peticiones Axios.
- Asegurar que el envío de correos no bloquee la API (manejar con `try/catch` y hacer fallback imprimiendo el token en consola para pruebas locales).
- Las contraseñas deben hashearse con `hashPassword` (bcryptjs con factor 10).

---

### Task 1: Actualizar Esquema de Base de Datos

**Files:**

- Modify: `backend/prisma/schema.prisma:52-68`

- [ ] **Step 1: Agregar campos en `schema.prisma`**
      Abrir [schema.prisma](file:///C:/Users/Diegolas/Code/Web/_insti/SITIO%20EVENTOS/eventos-dsw/backend/prisma/schema.prisma) y añadir los campos `token_recuperacion` y `token_recuperacion_expira` al modelo `Usuario`:
      `prisma
  model Usuario {
    id                        String            @id @default(uuid())
    email                     String            @unique
    contrasena_hash           String?
    nombre_mostrar            String
    rol                       RolUsuario        @default(miembro)
    creado_en                 DateTime          @default(now())
    actualizado_en            DateTime          @updatedAt
    token_recuperacion        String?
    token_recuperacion_expira DateTime?
    ...
  `

- [ ] **Step 2: Crear y ejecutar la migración**
      Ejecutar el comando de migración de Prisma.
      Run: `npx prisma migrate dev --name add_recovery_token_fields` en el directorio `backend`
      Expected: Migración creada y aplicada con éxito.

- [ ] **Step 3: Commitear cambios**
      `bash
  git add backend/prisma/schema.prisma
  git commit -m "feat(db): add recovery token fields to Usuario model"
  `

---

### Task 2: Implementar Endpoints de Recuperación en el Backend

**Files:**

- Modify: `backend/src/routes/auth.ts`

- [ ] **Step 1: Implementar los controladores en `auth.ts`**
      Abrir [auth.ts](file:///C:/Users/Diegolas/Code/Web/_insti/SITIO%20EVENTOS/eventos-dsw/backend/src/routes/auth.ts) e importar `enviarMail` y `randomUUID` (de `crypto`):
      `typescript
  import { randomUUID } from 'crypto';
  import { enviarMail } from '../services/email.service.js';
  `

- [ ] **Step 2: Añadir endpoints de recuperación**
      Añadir los endpoints `/forgot-password` y `/reset-password` antes de `export default router;` en [auth.ts](file:///C:/Users/Diegolas/Code/Web/_insti/SITIO%20EVENTOS/eventos-dsw/backend/src/routes/auth.ts):
      ```typescript
      /\*\*
      _ POST /api/v1/auth/forgot-password
      _ Genera un token temporal y envía el email de recuperación.
      \*/
      router.post('/forgot-password', async (req, res) => {
      const { email } = req.body ?? {};
      if (!email) {
      res.status(400).json({ error: 'El email es obligatorio.' });
      return;
      }

        try {
          const usuario = await prisma.usuario.findUnique({ where: { email } });
          if (!usuario) {
            // Retornamos 200 por seguridad (no revelar existencia de emails)
            res.json({ message: 'Si el correo está registrado, recibirás un enlace de recuperación.' });
            return;
          }

          const token = randomUUID();
          const expira = new Date();
          expira.setHours(expira.getHours() + 1); // 1 hora de vigencia

          await prisma.usuario.update({
            where: { id: usuario.id },
            data: {
              token_recuperacion: token,
              token_recuperacion_expira: expira,
            },
          });

          // Fallback seguro en consola por si falla SMTP en local
          console.log(`[RECOVERY] Token para ${email}: ${token}`);
          console.log(`[RECOVERY] Link: http://localhost:5173/restablecer-clave?token=${token}`);

          try {
            await enviarMail({
              to: email,
              subject: 'Recuperación de Contraseña - Eventos DSW',
              html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
                  <h2 style="color: #6d28d9;">Restablecer contraseña</h2>
                  <p>Recibimos una solicitud para restablecer tu contraseña. Haz clic en el siguiente enlace para continuar:</p>
                  <p style="margin: 24px 0;">
                    <a href="http://localhost:5173/restablecer-clave?token=${token}" style="background-color: #6d28d9; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Restablecer mi contraseña</a>
                  </p>
                  <p style="color: #666; font-size: 12px;">Este enlace es válido por 1 hora. Si no solicitaste esto, puedes ignorar este correo.</p>
                </div>
              `,
            });
          } catch (mailError) {
            console.warn('❌ Error al enviar el correo, pero el token fue generado:', mailError);
          }

          res.json({ message: 'Si el correo está registrado, recibirás un enlace de recuperación.' });
        } catch (error) {
          console.error('Error en forgot-password:', error);
          res.status(500).json({ error: 'Error interno del servidor.' });
        }
      });

      /**
       * POST /api/v1/auth/reset-password
       * Valida el token y cambia la contraseña.
       */
      router.post('/reset-password', async (req, res) => {
        const { token, nuevaClave } = req.body ?? {};

        if (!token || !nuevaClave) {
          res.status(400).json({ error: 'El token y la nueva contraseña son obligatorios.' });
          return;
        }

        if (nuevaClave.length < 6) {
          res.status(400).json({ error: 'La nueva contraseña debe tener al menos 6 caracteres.' });
          return;
        }

        try {
          const usuario = await prisma.usuario.findFirst({
            where: {
              token_recuperacion: token,
              token_recuperacion_expira: { gte: new Date() },
            },
          });

          if (!usuario) {
            res.status(400).json({ error: 'El token es inválido o ha expirado.' });
            return;
          }

          const hashedPassword = await hashPassword(nuevaClave);

          await prisma.usuario.update({
            where: { id: usuario.id },
            data: {
              contrasena_hash: hashedPassword,
              token_recuperacion: null,
              token_recuperacion_expira: null,
            },
          });

          res.json({ message: 'Contraseña restablecida con éxito.' });
        } catch (error) {
          console.error('Error en reset-password:', error);
          res.status(500).json({ error: 'Error interno del servidor.' });
        }
      });
      ```

- [ ] **Step 3: Verificar compilación del backend**
      Run: `npm run build` en el directorio `backend`
      Expected: Compilación limpia sin errores.

- [ ] **Step 4: Commitear cambios**
      `bash
  git add backend/src/routes/auth.ts
  git commit -m "feat(backend): add forgot-password and reset-password routes in auth.ts"
  `

---

### Task 3: Integrar Petición de Recuperación en el LoginForm

**Files:**

- Modify: `web/src/Pages/ProfilePage/LoginForm.tsx`

- [ ] **Step 1: Actualizar `LoginForm.tsx`**
      Abrir [LoginForm.tsx](file:///C:/Users/Diegolas/Code/Web/_insti/SITIO%20EVENTOS/eventos-dsw/web/src/Pages/ProfilePage/LoginForm.tsx) y modificar el envío del formulario para la opción de olvido de clave.
      Cambiar de:
      `typescript
  if (modoOlvido) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    setSuccessMsg('¡Contraseña restablecida con éxito! Ya podés ingresar.');
    setModoOlvido(false);
    setPassword('');
  }
  `
      a:
      `typescript
  if (modoOlvido) {
    try {
      const response = await api.post('/auth/forgot-password', { email });
      setSuccessMsg(response.data.message || 'Correo de recuperación enviado.');
      setModoOlvido(false);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.response?.data?.error || 'No se pudo enviar el correo de recuperación.');
    }
  }
  `

- [ ] **Step 2: Verificar compilación del frontend**
      Run: `npm run build` en el directorio `web`
      Expected: Compilación limpia sin errores.

- [ ] **Step 3: Commitear cambios**
      `bash
  git add web/src/Pages/ProfilePage/LoginForm.tsx
  git commit -m "feat(frontend): connect forgot-password flow to real API inside LoginForm"
  `

---

### Task 4: Crear Vista y Ruta de Restablecimiento de Contraseña

**Files:**

- Create: `web/src/Pages/ProfilePage/ResetPasswordPage.tsx`
- Modify: `web/src/routes/AppRoutes/AppRoutes.tsx`

- [ ] **Step 1: Crear `ResetPasswordPage.tsx`**
      Crear el archivo [ResetPasswordPage.tsx](file:///C:/Users/Diegolas/Code/Web/_insti/SITIO%20EVENTOS/eventos-dsw/web/src/Pages/ProfilePage/ResetPasswordPage.tsx):
      ```tsx
      import { useState } from 'react';
      import { useSearchParams, useNavigate } from 'react-router-dom';
      import MainLayout from '../../Components/layout/MainLayout';
      import api from '../../services/api';

      export default function ResetPasswordPage() {
        const [searchParams] = useSearchParams();
        const token = searchParams.get('token');
        const navigate = useNavigate();

        const [nuevaClave, setNuevaClave] = useState('');
        const [loading, setLoading] = useState(false);
        const [msg, setMsg] = useState<{ tipo: 'ok' | 'error'; texto: string } | null>(null);

        const handleSubmit = async (e: React.FormEvent) => {
          e.preventDefault();
          if (nuevaClave.length < 6) {
            setMsg({ tipo: 'error', texto: 'La contraseña debe tener al menos 6 caracteres.' });
            return;
          }
          setLoading(true);
          setMsg(null);

          try {
            await api.post('/auth/reset-password', { token, nuevaClave });
            setMsg({ tipo: 'ok', texto: 'Contraseña actualizada con éxito. Redirigiendo al login...' });
            setTimeout(() => {
              navigate('/perfil');
            }, 3000);
          } catch (err: any) {
            console.error(err);
            const errorMsg = err.response?.data?.error || 'El token es inválido o ha expirado.';
            setMsg({ tipo: 'error', texto: errorMsg });
          } finally {
            setLoading(false);
          }
        };

        return (
          <MainLayout>
            <div className="py-10 min-h-[60vh] flex flex-col justify-center items-center">
              <div className="max-w-md w-full bg-white border border-zinc-200 p-8 rounded-[32px] shadow-md">
                <h2 className="text-2xl font-bold text-zinc-900 text-center mb-6">
                  Restablecer Contraseña
                </h2>

                {msg && (
                  <div
                    className={`p-4 mb-4 rounded-2xl text-sm border ${
                      msg.tipo === 'ok'
                        ? 'bg-green-50 text-green-700 border-green-100'
                        : 'bg-red-50 text-red-600 border-red-100'
                    }`}
                  >
                    {msg.texto}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-600 mb-1.5">
                      Nueva Contraseña
                    </label>
                    <input
                      type="password"
                      value={nuevaClave}
                      onChange={e => setNuevaClave(e.target.value)}
                      placeholder="Mínimo 6 caracteres"
                      className="w-full px-4 py-2.5 border border-zinc-300 rounded-xl text-sm outline-none focus:border-violet-600 transition-colors bg-zinc-50 focus:bg-white"
                      disabled={loading || msg?.tipo === 'ok'}
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading || msg?.tipo === 'ok'}
                    className="w-full bg-violet-600 hover:bg-violet-700 text-white font-bold py-3 rounded-xl transition-colors shadow-sm disabled:opacity-50"
                  >
                    {loading ? 'Actualizando...' : 'Actualizar contraseña'}
                  </button>
                </form>
              </div>
            </div>
          </MainLayout>
        );
      }
      ```

- [ ] **Step 2: Registrar la ruta en `AppRoutes.tsx`**
      Abrir [AppRoutes.tsx](file:///C:/Users/Diegolas/Code/Web/_insti/SITIO%20EVENTOS/eventos-dsw/web/src/routes/AppRoutes/AppRoutes.tsx) e importar y agregar el componente:
      `tsx
  import ResetPasswordPage from '../../Pages/ProfilePage/ResetPasswordPage';
  `
      y dentro de la sección de rutas de React Router:
      `tsx
  <Route path="/restablecer-clave" element={<ResetPasswordPage />} />
  `

- [ ] **Step 3: Verificar compilación completa**
      Ejecutar compilación en frontend.
      Run: `npm run build` en el directorio `web`
      Expected: Compilación exitosa sin errores de tipado.

- [ ] **Step 4: Commitear cambios**
      `bash
  git add web/src/Pages/ProfilePage/ResetPasswordPage.tsx web/src/routes/AppRoutes/AppRoutes.tsx
  git commit -m "feat(frontend): create ResetPasswordPage and register /restablecer-clave route"
  `

---

### Task 5: Documentar Cambios en TODO e Historia

**Files:**

- Modify: `TODO.md`
- Create: `.history/history_24.md`

- [ ] **Step 1: Completar la tarea en `TODO.md`**
      Marcar la tarea de recuperar contraseña como completada.
- [ ] **Step 2: Crear el historial `history_24.md`**
      Generar el registro histórico de este cambio.
- [ ] **Step 3: Commitear la documentación**
      `bash
  git add TODO.md .history/history_24.md
  git commit -m "docs: update TODO.md and create history_24.md for password recovery feature"
  `
