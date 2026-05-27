# MIGRATION_CONTEXT — Admin Dashboard (Panel de Administración)

## Lógicas identificadas
- Login/logout via Supabase Auth (email + password)
- Verificación de admin en tabla `admin_users` (campo `user_id`)
- Rate limiting de login en cliente (máx 10 intentos en 15min via sessionStorage)
- Guards: `requireAdmin()` y `redirectIfAdmin()`
- Gestión completa de reservas (CRUD + cambio de estado)
- Gestión de servicios (crear, editar, activar/desactivar)
- Gestión de empleadas (CRUD + especialidades)
- Gestión de clientes
- Disponibilidad del spa (horarios por día + bloqueos)
- Administración de admins
- Configuración del spa
- Testimonios (aprobar/ocultar)
- Dashboard con métricas (Chart.js via CDN)
- Sidebar con navegación activa

## Rutas API actuales
- **No hay rutas Express** — todas las operaciones van directamente a Supabase desde el frontend
- Usa Supabase Auth + queries directas con anon key + RLS

## Variables de entorno requeridas
- `SUPABASE_URL` — URL del proyecto (actualmente hardcodeado en supabase-client.js)
- `SUPABASE_ANON_KEY` — anon key (actualmente hardcodeado en supabase-client.js)
- `SUPABASE_SERVICE_KEY` — service role (en .env.example comentado, no usado en frontend)

## Conexiones externas
- **Supabase Auth**: `signInWithPassword`, `signOut`, `getSession`, `updateUser`
- **Supabase DB** (anon key + RLS): tablas admin_users, citas, servicios, empleados, clientes, bloqueos, disponibilidad, configuracion, testimonios
- **Chart.js 4.4.3**: CDN via cdn.jsdelivr.net
- **Sin N8N, sin Evolution API**

## Stack actual → Stack objetivo
- **Antes**: Puro estático — sin backend, sin package.json, sin Node.js
- **Después**: Express + ES Modules + Vercel serverless (infraestructura base)
- **Frontend**: Sin cambios — sigue llamando a Supabase directamente con anon key
- **Nuevos archivos**: `package.json`, `server.js`, `api/index.js`, `config/supabase.js`
- **vercel.json**: reemplaza el formato `outputDirectory: frontend` por arquitectura Express

## Diseño a preservar
- Paleta: admin theme oscuro, tonos grises oscuros + acentos púrpura, `#0f0f14` base
- Tipografías: Cormorant Garamond + Inter (Google Fonts)
- Fuente de avatar/nombre: Cormorant Garamond con peso 300
- CSS en `frontend/css/admin.css`
- Chart.js CDN para gráficas del dashboard
- 10 páginas HTML (admins, clientes, configuracion, dashboard, disponibilidad, empleadas, index, reservas, servicios, testimonios)

## Notas de ambigüedad
1. Las credenciales están hardcodeadas en `frontend/js/supabase-client.js`. La anon key es pública por diseño. El service role NUNCA debe ir al frontend.
2. No hay rutas API que migrar — el backend Express solo sirve como infraestructura para local dev y para potenciales futuras rutas.
3. El CSP header en el vercel.json actual es específico y debe preservarse en el nuevo vercel.json.
4. La tabla `disponibilidad` en Supabase puede ser diferente a `bloqueos` — ambas se usan en el frontend. La migración no toca la lógica.
