# Auditoría de Rendimiento y Diagnóstico de Latencia 🚀

Este documento detalla los hallazgos de rendimiento, cuellos de botella y errores de configuración identificados en el proyecto tras la integración de las últimas ramas de desarrollo.

---

## 📊 Resumen de Diagnósticos

Se realizaron pruebas de temporización y análisis estático del flujo de datos en el backend y frontend. A continuación se presentan los resultados clave:

| Diagnóstico                                | Impacto |     Estado     | Causa Raíz                                                                            |
| :----------------------------------------- | :-----: | :------------: | :------------------------------------------------------------------------------------ |
| **Latencia Supabase + PgBouncer**          | Crítico |   🔴 Crítico   | Base de datos en EE.UU. (Oregon) + Pooler serializado (`connection_limit=1`).         |
| **Bloqueo en Confirmación de Asistencia**  | Crítico | 🔴 Bloqueante  | El backend espera (`await`) el envío de emails con credenciales SMTP faltantes.       |
| **Bypass del Proxy de Vite**               |  Menor  | 🟡 Ineficiente | `baseURL` del frontend hardcodeado apunta directamente al puerto 3001.                |
| **Planificador de Recordatorios Inactivo** |  Menor  |  🟡 Inactivo   | El archivo de tareas programadas (`node-cron`) no se importa al arrancar el servidor. |

---

## 🔍 Detalle de Hallazgos y Soluciones Recomendadas

### 1. Latencia de Base de Datos y PgBouncer (Impacto Crítico)

- **Problema:** Cada consulta a la base de datos a través de Prisma toma entre **1.3 y 1.5 segundos** en el entorno local.
- **Causa Raíz:**
  1. **Distancia física:** El servidor PostgreSQL está en `aws-1-us-west-2` (Oregon, EE.UU.). La latencia de ida y vuelta (RTT) desde Argentina es de aproximadamente ~180ms - 220ms. Dado que Prisma realiza múltiples viajes de ida y vuelta para transacciones (`BEGIN`, `DEALLOCATE`, consulta, `COMMIT`), esta latencia se multiplica por 4 o 5 por cada operación.
  2. **Configuración de PgBouncer:** El string de conexión `DATABASE_URL` apunta al puerto transaccional `6543` con `connection_limit=1`. Esto restringe a la aplicación a una única conexión simultánea. Cuando el frontend realiza peticiones paralelas (como en la Home, que carga eventos y categorías a la vez), el backend serializa las consultas, duplicando el tiempo de carga del sitio.
- **Pruebas de Rendimiento (Benchmark):**
  - Con PgBouncer (`port 6543`, `connection_limit=1`): **1.3s - 1.4s** por consulta.
  - Con Conexión Directa (`port 5432`, `connection_limit=10`): **500ms - 600ms** por consulta (reducción del 60% de latencia).
- **Solución Recomendada:**
  Actualizar `DATABASE_URL` en [backend/.env](file:///C:/Users/Diegolas/Code/Web/_insti/SITIO%20EVENTOS/eventos-dsw/backend/.env) para usar la conexión directa (`port 5432`) o remover la restricción de `connection_limit=1` para habilitar el paralelismo en Prisma.

---

### 2. Bloqueo en Endpoint de Asistencia (Impacto Crítico / Bloqueante)

- **Problema:** Al hacer clic en "Asistir" a un evento, la aplicación web parece colgarse o tarda más de 20 segundos en responder.
- **Causa Raíz:**
  En [store.ts](file:///C:/Users/Diegolas/Code/Web/_insti/SITIO%20EVENTOS/eventos-dsw/backend/src/store.ts#L570-L604), la función [asistirEvento](file:///C:/Users/Diegolas/Code/Web/_insti/SITIO%20EVENTOS/eventos-dsw/backend/src/store.ts#L570-L604) ejecuta la función [enviarMail](file:///C:/Users/Diegolas/Code/Web/_insti/SITIO%20EVENTOS/eventos-dsw/backend/src/services/email.service.ts#L12-L23) utilizando `await`:
  ```typescript
  if (usuario && evento) {
    await enviarMail({ ... });
  }
  ```
  Sin embargo, el archivo [backend/.env](file:///C:/Users/Diegolas/Code/Web/_insti/SITIO%20EVENTOS/eventos-dsw/backend/.env) no define las variables de entorno de correo (`MAIL_HOST`, `MAIL_PORT`, `MAIL_USER`, `MAIL_PASS`). Al no estar configurado el servidor SMTP, Nodemailer intenta conectarse indefinidamente hasta alcanzar el tiempo de espera por defecto (timeout), bloqueando la respuesta HTTP hacia el cliente.
- **Solución Recomendada:**
  1. No esperar (`await`) el envío del email en el hilo principal del request. Ejecutar el envío de forma asíncrona ("fire-and-forget") o manejarlo en un segundo plano.
  2. Proveer valores por defecto de desarrollo o comprobar si el transporte de email está configurado antes de intentar enviar.

---

### 3. Bypass del Proxy en el Frontend (Impacto Menor)

- **Problema:** En el frontend, las peticiones HTTP ignoran la configuración del proxy de desarrollo.
- **Causa Raíz:**
  El archivo [vite.config.ts](file:///C:/Users/Diegolas/Code/Web/_insti/SITIO%20EVENTOS/eventos-dsw/web/vite.config.ts) define una redirección automática para todas las rutas que comiencen con `/api`:
  ```typescript
  proxy: {
    '/api': 'http://localhost:3001',
  }
  ```
  Sin embargo, en el archivo [api.ts](file:///C:/Users/Diegolas/Code/Web/_insti/SITIO%20EVENTOS/eventos-dsw/web/src/services/api.ts), se configuró:
  ```typescript
  const api = axios.create({
    baseURL: 'http://localhost:3001/api/v1',
  });
  ```
  Esto obliga al navegador a saltarse el puerto de desarrollo del frontend (`5173`) y golpear directamente el puerto del backend (`3001`), forzando pases de CORS innecesarios y perdiendo flexibilidad al cambiar entornos.
- **Solución Recomendada:**
  Cambiar la baseURL en [api.ts](file:///C:/Users/Diegolas/Code/Web/_insti/SITIO%20EVENTOS/eventos-dsw/web/src/services/api.ts) a un path relativo:
  ```typescript
  const api = axios.create({
    baseURL: '/api/v1',
  });
  ```

---

### 4. Tarea Programada de Recordatorios Inactiva (Impacto Menor)

- **Problema:** La lógica de envío automatizado de alertas de asistencia a eventos próximos no se ejecuta.
- **Causa Raíz:**
  El archivo [eventReminder.ts](file:///C:/Users/Diegolas/Code/Web/_insti/SITIO%20EVENTOS/eventos-dsw/backend/src/jobs/eventReminder.ts) contiene la planificación mediante `node-cron`. Sin embargo, este archivo nunca es importado en los puntos de entrada principales del servidor ([index.ts](file:///C:/Users/Diegolas/Code/Web/_insti/SITIO%20EVENTOS/eventos-dsw/backend/src/index.ts) o [app.ts](file:///C:/Users/Diegolas/Code/Web/_insti/SITIO%20EVENTOS/eventos-dsw/backend/src/app.ts)), por lo que la tarea programada nunca se suscribe ni se inicia al levantar el servidor.
- **Solución Recomendada:**
  Importar el módulo de jobs de recordatorios en [app.ts](file:///C:/Users/Diegolas/Code/Web/_insti/SITIO%20EVENTOS/eventos-dsw/backend/src/app.ts) para inicializar las alertas cuando arranca el servidor Express.
