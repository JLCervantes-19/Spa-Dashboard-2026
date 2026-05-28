# Oh Diosas — Admin Dashboard

Panel administrativo completo para el spa Oh Diosas by Tatiana Zuleta. Permite gestionar empleadas, citas, servicios, clientes, testimonios y configuracion del negocio. Comparte la base de datos Supabase con el sitio principal y la staff app.

**Stack:** Node.js 24 · Express 4 (servidor estatico) · Supabase Auth + RLS · Chart.js 4 · Vanilla JS ES Modules · Vercel

---

## Estructura del proyecto

```
admin-dashboard/
├── api/
│   └── index.js              # Punto de entrada serverless (Vercel)
├── config/
│   └── supabase.js           # Cliente Supabase servidor (service role)
├── frontend/
│   ├── index.html            # Login de administradores
│   ├── dashboard.html        # KPIs y graficas (Chart.js)
│   ├── empleadas.html        # CRUD empleadas + acceso Auth
│   ├── admins.html           # Gestion de administradores
│   ├── testimonios.html      # Aprobar/rechazar resenas
│   ├── configuracion.html    # Datos del negocio + imagenes (Supabase Storage)
│   ├── css/
│   │   └── admin.css
│   └── js/
│       ├── supabase-client.js  # Conexion Supabase (anon key, hardcoded)
│       ├── auth.js             # Login, requireAdmin, rate limiting
│       ├── utils.js            # Helpers, formatters, avatares
│       └── sidebar.js          # Componente de navegacion lateral
├── database/
│   └── migration_2.sql       # Tabla configuracion, RLS, funcion is_admin()
├── server.js                 # Express: sirve frontend/ como estatico
├── vercel.json               # Routing y headers CSP (permite Chart.js CDN)
├── INSTRUCCIONES-AGREGAR-ADMIN.md
└── package.json              # Node 24, "type": "module"
```

---

## Despliegue manual en Vercel

### Paso 1 — Base de datos (una sola vez)

Abre **Supabase → SQL Editor** y ejecuta en este orden:

**1. Si es primera instalacion, ejecuta primero el schema del sitio principal** (`SpaOhDiosas/database/schema.sql`)

**2. Ejecuta la migracion del admin:**

```
database/migration_2.sql
```

Esto crea o actualiza:
- Tabla `admin_users` — lista de administradores autorizados
- Tabla `configuracion` — datos del negocio (telefono, direccion, redes sociales, logo)
- Funcion `is_admin()` con `SECURITY DEFINER` — verifica si el usuario logueado es admin
- Politica RLS `admin_full_config` — solo admins pueden editar la configuracion
- Politica RLS `lectura_publica_config` — cualquiera puede leer la config (para el sitio publico)
- Politica RLS `lectura_publica_aprobados` — solo testimonios aprobados son publicos

---

### Paso 2 — Edge Function de Supabase (una sola vez)

El dashboard usa una Edge Function para crear usuarios en Supabase Auth desde el panel de empleadas y admins. El codigo esta en `index.ts`.

Con [Supabase CLI](https://supabase.com/docs/guides/cli) instalado:

```bash
# Vincular tu proyecto local
supabase link --project-ref whouejjrpjcvoueyajbu

# Desplegar la funcion
supabase functions deploy smooth-function --project-ref whouejjrpjcvoueyajbu
```

> Si ya esta desplegada en Supabase (puedes verificarlo en Supabase → Edge Functions), no necesitas volver a hacerlo.

---

### Paso 3 — Crear el primer administrador (una sola vez)

Antes de que el login funcione, necesitas al menos un usuario en la tabla `admin_users`.

1. Ve a **Supabase → Authentication → Users → Add user**
2. Ingresa email y contrasena del administrador
3. Copia el UUID que aparece en la columna `ID`
4. En **SQL Editor** ejecuta:

```sql
INSERT INTO admin_users (user_id, nombre, email)
VALUES (
  'UUID-DEL-USUARIO-AQUI',
  'Nombre Apellido',
  'admin@correo.com'
);
```

Reemplaza los tres valores con los datos reales.

> Para administradores adicionales, una vez que tengas acceso puedes crearlos desde `admins.html` en el dashboard.

---

### Paso 4 — Repositorio en GitHub

El repositorio ya existe: `JLCervantes-19/Spa-Dashboard-2026`

Para hacer push de cambios:

```bash
cd "/ruta/a/admin-dashboard"
git add .
git commit -m "deploy: descripcion del cambio"
git push origin main
```

---

### Paso 5 — Importar el proyecto en Vercel

1. Ve a [vercel.com](https://vercel.com) e inicia sesion con tu cuenta `jhan-cervantes-projects`
2. Clic en **Add New Project**
3. Busca y selecciona el repositorio `JLCervantes-19/Spa-Dashboard-2026`
4. Configura los ajustes de construccion:

| Ajuste | Valor |
|--------|-------|
| **Framework Preset** | `Other` |
| **Root Directory** | `./` (dejar como esta) |
| **Build Command** | `npm install` |
| **Output Directory** | *(dejar vacio)* |
| **Install Command** | `npm install` |
| **Node.js Version** | `24.x` |

---

### Paso 6 — Configurar las variables de entorno

En la seccion **Environment Variables** del formulario de importacion, agrega las siguientes variables. Selecciona los entornos **Production**, **Preview** y **Development** para cada una.

#### Variables obligatorias (servidor)

| Variable | Descripcion | Valor |
|----------|-------------|-------|
| `SUPABASE_URL` | URL del proyecto Supabase | `https://whouejjrpjcvoueyajbu.supabase.co` |
| `SUPABASE_SERVICE_KEY` | Clave de servicio (solo servidor) | Ver abajo |

#### Donde encontrar `SUPABASE_SERVICE_KEY`

1. Ve a [supabase.com](https://supabase.com) → proyecto `BD_Spa's_Startup`
2. Settings → API
3. Copia el valor de **service_role** (en "Project API keys")
4. **NUNCA** la pongas en el frontend ni en el repositorio

#### Nota sobre la anon key

El frontend (`frontend/js/supabase-client.js`) ya tiene la anon key hardcodeada — esto es correcto y seguro por diseno. La anon key es publica y esta controlada por las politicas RLS de Supabase. La `service_role key` solo la usa el servidor y nunca llega al navegador.

---

### Paso 7 — Hacer deploy

1. Clic en **Deploy**
2. Vercel instala dependencias y despliega
3. Al terminar obtienes una URL como `https://spa-dashboard-xxxx.vercel.app`

---

### Paso 8 — Configurar URLs en Supabase Auth

Para que el login del admin funcione en la URL de produccion:

1. Ve a [supabase.com](https://supabase.com) → proyecto `BD_Spa's_Startup`
2. Authentication → URL Configuration
3. Configura:

| Campo | Valor |
|-------|-------|
| **Site URL** | `https://spa-dashboard-chi.vercel.app` (o tu dominio personalizado) |
| **Redirect URLs** | `https://spa-dashboard-chi.vercel.app/**` |

> Si tienes multiples apps (staff-app + admin + sitio principal), agrega cada URL en Redirect URLs separada por comas o en lineas distintas.

---

### Paso 9 — Verificar que funciona

1. Abre la URL desplegada — debes ver la pantalla de login
2. Inicia sesion con las credenciales del administrador que creaste en el Paso 3
3. Debes ver el dashboard con las graficas de KPIs

Si el login falla:
- Verifica que el usuario existe en Supabase → Authentication → Users
- Verifica que el UUID del usuario esta en la tabla `admin_users`
- Confirma que la URL esta en las Redirect URLs de Supabase Auth
- Revisa los logs en Vercel → tu proyecto → Logs

---

### Paso 10 — Actualizar variables de entorno (si el proyecto ya existe)

1. Ve a [vercel.com](https://vercel.com) → proyecto `spa-dashboard`
2. Settings → Environment Variables
3. Edita o agrega la variable
4. Ve a Deployments → **Redeploy** el ultimo deployment para que tome efecto

---

## Deploy via CLI (alternativa)

```bash
# Instalar CLI
npm install -g vercel

# Desde la carpeta del proyecto
cd "/ruta/a/admin-dashboard"

# Vincular al proyecto existente
vercel link --scope jhan-cervantes-projects --project spa-dashboard

# Agregar variables
vercel env add SUPABASE_URL production
vercel env add SUPABASE_SERVICE_KEY production

# Deploy a produccion
vercel --prod
```

---

## Desarrollo local

```bash
# Instalar dependencias
npm install

# Iniciar servidor Express
npm start
# → http://localhost:3000

# O servir el frontend directamente
npx serve frontend/ -p 5000
# → http://localhost:5000
```

Agrega `http://localhost:3000` a las **Redirect URLs** en Supabase Auth para que el login funcione localmente.

Crea un archivo `.env` para el servidor local:

```env
SUPABASE_URL=https://whouejjrpjcvoueyajbu.supabase.co
SUPABASE_SERVICE_KEY=tu_service_role_key_aqui
PORT=3000
```

---

## Variables de entorno — resumen

| Variable | Obligatoria | Expuesta al cliente | Donde va |
|----------|-------------|---------------------|----------|
| `SUPABASE_URL` | Si | No | Solo servidor |
| `SUPABASE_SERVICE_KEY` | Si | **NUNCA** | Solo servidor |
| `SUPABASE_ANON` | N/A | Si (hardcoded) | frontend/js/supabase-client.js |

---

## Tablas que gestiona este dashboard

| Tabla | Operaciones |
|-------|-------------|
| `admin_users` | Validacion de rol + CRUD admins |
| `empleados` | CRUD completo + vinculacion Auth |
| `empleado_servicios` | Asignacion empleada a servicio |
| `citas` | CRUD + cambio de estado |
| `clientes` | Lectura + notas internas |
| `servicios` | CRUD completo |
| `testimonios` | Aprobacion + orden |
| `configuracion` | Datos del negocio + logo (Supabase Storage bucket: assets) |

---

## Como funciona el sistema de administradores

La autenticacion del admin tiene doble validacion:

1. **Supabase Auth** — verifica que el usuario tiene sesion activa valida
2. **`is_admin()` + RLS** — verifica que el `auth.uid()` del usuario existe en la tabla `admin_users`

Si el usuario esta en Supabase Auth pero no en `admin_users`, el login falla aunque las credenciales sean correctas.

La funcion `is_admin()` tiene `SECURITY DEFINER`, lo que significa que se ejecuta con privilegios elevados sin exponer la `service_role key` al cliente.

---

## Seguridad

- `service_role key` nunca en el frontend — solo en servidor via `config/supabase.js`
- Doble validacion: Supabase Auth + `is_admin()` via RLS
- Rate limiting: max 10 intentos de login / 15 minutos por navegador
- Headers en `vercel.json`: CSP (permite Chart.js desde cdn.jsdelivr.net), X-Frame-Options: DENY, X-Content-Type-Options: nosniff
- `graphify-out/` excluido del repositorio publico via `.gitignore` (ver nota abajo)

> **Nota sobre graphify-out:** Este directorio contiene el grafo de conocimiento del proyecto para uso interno del equipo de desarrollo. Fue forzado al repositorio con `git add -f` para mantenerlo sincronizado entre equipos. Puedes eliminarlo del repo si no lo necesitas.
