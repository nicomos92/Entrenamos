# EntrenaMos - Setup y Deploy

> **Documento:** Setup y Deploy
>
> **Proyecto:** EntrenaMos
>
> **Marca:** SIMos
>
> **Versión:** 0.2.0
>
> **Estado:** Draft
>
> **Última actualización:** 2026-07-08

---

Esta guía explica cómo poner en funcionamiento el Beta (carpeta `Beta/`) con un backend real de Supabase, paso a paso, para poder usarlo con el primer cliente.

---

## 1. Crear el proyecto en Supabase

1. Entrá a [supabase.com](https://supabase.com) y creá una cuenta (o iniciá sesión).
2. Creá un nuevo proyecto. Elegí una región cercana a tu cliente (ej: São Paulo o East US) y guardá la contraseña de la base de datos en un lugar seguro.
3. Esperá a que el proyecto termine de aprovisionarse (1-2 minutos).

---

## 2. Correr el schema SQL

En el dashboard de Supabase, andá a **SQL Editor**. Ahí tenés que correr, EN ORDEN, cada uno de estos archivos (copiar todo el contenido del archivo, pegarlo en un query nuevo, Run):

1. `Beta/supabase/migrations/0001_init.sql` — crea las tablas base (`profiles`, `students`, `exercises`, `routines`, `routine_exercises`, `assignments`, `sessions`, `session_exercises`, `appointments`), las políticas de seguridad (RLS) y el trigger que crea automáticamente el perfil de cada usuario nuevo.
2. `Beta/supabase/migrations/0002_admin_role.sql` — agrega el rol "admin".
3. `Beta/supabase/migrations/0003_body_metrics.sql` — agrega la tabla `body_metrics` (peso, altura, grasa corporal, masa muscular).
4. `Beta/supabase/migrations/0004_trainer_branding.sql` — agrega el logo del entrenador (columna `logo_url`), crea el bucket de Storage "logos" y la función que muestra la marca del entrenador en el login del alumno.
5. `Beta/supabase/migrations/0005_trainer_colors.sql` — agrega los dos colores de marca del entrenador (`brand_primary`, `brand_secondary`) y actualiza la función de branding para que también los devuelva.

Verificá en **Table Editor** que aparezcan las 10 tablas (las 9 originales + `body_metrics`), y en **Storage** que exista el bucket **logos**.

---

## 3. Configurar Authentication

Andá a **Authentication > Providers** y confirmá que **Email** esté habilitado. No hace falta tocar nada más: tanto el admin como los entrenadores y alumnos se crean siempre con `email_confirm: true` (no hay signup público para nadie), así que la confirmación de email no es un obstáculo en ningún caso.

---

## 4. Obtener las claves del proyecto

1. Andá a **Project Settings > API**.
2. Copiá:
   - **Project URL**
   - **anon public key**
   - **service_role key** (⚠️ esta es secreta, nunca la subas a git ni la expongas en el cliente)

---

## 5. Configurar las variables de entorno

1. En `Beta/`, copiá `.env.example` a `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
2. Completá los tres valores con los datos del paso anterior.
3. `.env.local` ya está en `.gitignore`, no se sube al repositorio.

---

## 6. Correr el proyecto en local

```bash
cd Beta
npm install
npm run dev
```

Abrí `http://localhost:3000`. Deberías ver la pantalla de login.

---

## 7. Crear los usuarios (Admin → Entrenador → Alumno)

No hay signup público para nadie: vos (SIMos) sos el admin y das de alta a cada entrenador; cada entrenador da de alta a sus propios alumnos. Esto refleja el modelo de negocio (le vendés la app a cada entrenador/gimnasio) y lo que ya definían el Product Vision y el Product Design System sobre el rol Administrador.

**7.1 Crear tu cuenta de admin (una sola vez)**

Parado en la carpeta `Beta/`, con `.env.local` ya completo:

```bash
node scripts/create-admin.mjs "Tu Nombre" tu@email.com unaContraseñaSegura
```

Esto crea tu usuario admin directo en Supabase (sin pasar por ninguna pantalla).

**7.2 Crear el primer entrenador (tu cliente)**

1. Entrá a `/login` con el email/contraseña del admin.
2. Vas a caer en `/admin`. Ahí completá el formulario **"Nuevo entrenador"** con los datos de tu cliente (nombre, email, una contraseña inicial que le vas a compartir).
3. Avisale a tu cliente sus credenciales por fuera de la app (WhatsApp, email, etc.).

**7.3 El entrenador carga su información**

El entrenador entra a `/login` con lo que le diste y cae en `/trainer`:
- Sube su **logo** desde `/trainer/settings` (esto es lo que van a ver sus alumnos al loguearse).
- Carga sus **ejercicios** (`/trainer/exercises`).
- Arma una **rutina** con esos ejercicios (`/trainer/routines`).
- Da de alta a sus **alumnos** (`/trainer/students`) — el mismo mecanismo: elige email y contraseña inicial, se la comparte al alumno.
- Asigna la rutina a cada alumno desde el detalle del alumno.
- Opcionalmente, agenda turnos desde `/trainer/agenda`.
- Puede ver y cargar mediciones de composición corporal (peso, grasa, masa muscular) de cada alumno desde el detalle del alumno.

**7.4 El alumno entrena**

El alumno entra a `/login`, escribe su email y ve el logo/nombre de su entrenador antes de poner la contraseña (así confirma que está entrando al espacio correcto). Una vez adentro:
- Ve su rutina asignada y la entrena desde `/student`.
- Registra su peso, altura, grasa corporal y masa muscular desde `/student/profile`, y ve la evolución en un gráfico simple.

---

## 8. Deploy a producción (Vercel)

1. Subí el contenido de `Beta/` a un repositorio de GitHub.
2. Entrá a [vercel.com](https://vercel.com), importá el repositorio.
3. En **Environment Variables**, cargá las mismas tres variables que en `.env.local`.
4. Deploy. Vercel te da una URL pública (podés después conectar un dominio propio).

La app es responsive (mobile-first): en el celular se ve como una app con navegación inferior, y en pantallas grandes (desktop/tablet apaisada) se acomoda sola con un menú lateral. No hace falta ningún paso extra para la versión web.

---

## 9. Antes de arrancar con el cliente real: reset de datos de prueba

Cuando termines de probar todo con datos ficticios y quieras arrancar limpio con el cliente real:

1. Abrí `Beta/supabase/reset.sql`, leé el comentario de advertencia del principio.
2. Copiá todo el archivo y corrélo en el **SQL Editor** de Supabase.
3. Esto borra todos los entrenadores y alumnos de prueba (y todo lo que colgaba de ellos: rutinas, sesiones, turnos, mediciones). Tu cuenta de admin NO se borra.
4. Después de correrlo, repetí el paso **7.2** para cargar al entrenador real.

---

## 10. Seguridad — checklist antes de compartir con el cliente

- [ ] `SUPABASE_SERVICE_ROLE_KEY` solo está en variables de entorno del servidor (Vercel/`.env.local`), nunca en código ni en el cliente.
- [ ] RLS está habilitado en todas las tablas (lo hace la migración automáticamente — se puede confirmar en **Authentication > Policies** de Supabase).
- [ ] Se probó el flujo completo con tres cuentas reales (admin, entrenador y alumno) en sesiones/navegadores distintos, para confirmar que cada uno solo ve su propia información.
- [ ] La cuenta de admin (`scripts/create-admin.mjs`) se creó una sola vez y sus credenciales están guardadas en un lugar seguro (no en el repositorio).
- [ ] Se corrió `supabase/reset.sql` para borrar los datos de prueba antes de cargar al cliente real.

---

## 11. Qué falta para versiones futuras

Fuera del alcance de este MVP (ver `00 - ProyectVision.md`, sección 11): nutrición, chat, IA, estadísticas avanzadas, wearables, pagos, marca blanca, marketplace, corrección por video, evaluaciones físicas.

---

# Historial de versiones

## v0.2.0

- Agregado: rol admin, marca/logo del entrenador, composición corporal, layout responsive, script de reset.

## v0.1.0

- Creación de la guía de setup y deploy para el primer cliente real.
