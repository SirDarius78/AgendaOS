# Todo App (React + Supabase)

Aplicacion de tareas con autenticacion por usuario y persistencia en Supabase.

## Requisitos

- Node 18+
- Proyecto de Supabase

## Configuracion rapida

1. Instala dependencias:

```bash
npm install
```

2. Crea tu archivo `.env` tomando como base `.env.example`:

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_PUBLIC_ANON_KEY
VITE_APP_URL=http://localhost:5173
```

Esas variables salen de tu proyecto de Supabase:

- `VITE_SUPABASE_URL`: Settings > API > Project URL
- `VITE_SUPABASE_ANON_KEY`: Settings > API > anon public key

3. En Supabase, ejecuta el script SQL completo:

- `supabase/schema.sql`

Ese script crea la base de datos, las politicas RLS y el trigger que genera el perfil del usuario al registrarse.

4. Inicia en desarrollo:

```bash
npm run dev
```

## Modelo de datos

- `auth.users`: usuarios nativo de Supabase Auth
- `public.profiles`: perfil por usuario
- `public.tasks`: tareas por usuario con estado (`todo`, `inprogress`, `done`)
- `public.task_activity`: historial opcional

## Seguridad (RLS)

El script incluye Row Level Security para garantizar que cada usuario solo pueda leer/escribir sus propias tareas.

## Invitaciones por email (Supabase + Resend)

La invitacion de tableros usa una Supabase Edge Function:

- `supabase/functions/send-board-invite/index.ts`

### Secrets requeridos en Supabase (Edge Function)

Configura estos secrets en tu proyecto de Supabase:

- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`
- `APP_BASE_URL` (por ejemplo `https://tu-dominio.com`)
- `SUPABASE_SERVICE_ROLE_KEY` (si no esta disponible por defecto)

### Despliegue de la funcion

```bash
supabase functions deploy send-board-invite
```

### Variables en Vercel

Si despliegas frontend en Vercel, sube al menos:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_APP_URL`

Nota: `RESEND_API_KEY` y `SUPABASE_SERVICE_ROLE_KEY` no deben ir al cliente. Esos van en Supabase Functions Secrets.
