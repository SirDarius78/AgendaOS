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
