# Oh Diosas — Admin Dashboard

Panel administrativo completo para el spa Oh Diosas by Tatiana Zuleta. Comparte la misma base de datos Supabase que el sitio principal (`SpaOhDiosas`) y la app de empleadas (`staff-app`).

---

## Estructura del proyecto

```
admin-dashboard/
├── frontend/
│   ├── index.html           # Login de administradores
│   ├── dashboard.html       # KPIs y gráficas
│   ├── empleadas.html       # CRUD empleadas + acceso Auth
│   ├── reservas.html        # CRUD reservas
│   ├── servicios.html       # CRUD servicios
│   ├── clientes.html        # Listado de clientas
│   ├── disponibilidad.html  # Horarios y bloqueos
│   ├── testimonios.html     # Gestión de reseñas
│   ├── configuracion.html   # Datos del negocio
│   ├── admins.html          # Gestión de administradores
│   ├── css/admin.css
│   └── js/
│       ├── supabase-client.js  # Conexión Supabase (anon key)
│       ├── auth.js             # Login, requireAdmin, rate limiting
│       ├── utils.js            # Helpers y formatters
│       └── sidebar.js          # Componente de navegación
├── database/
│   ├── schema_admin.sql        # Tablas, funciones RLS y políticas
│   ├── migration_2.sql         # Migraciones adicionales
│   └── setup_completo.sql      # Script completo combinado
├── index.ts                    # Código de la Edge Function de Supabase
├── vercel.json
├── .env.example
├── .gitignore
└── README.md
```

---

## Requisitos previos

- Proyecto Supabase activo (compartido con SpaOhDiosas)
- Cuenta en [Vercel](https://vercel.com)
- Repositorio en GitHub

---

## Paso 1 — Configurar la base de datos (una sola vez)

Abre **Supabase → SQL Editor** y ejecuta los archivos en este orden:

```
1. database/schema_admin.sql
2. database/migration_2.sql   (si no lo has ejecutado antes)
```

Esto crea:
- Tabla `admin_users` con la lista de administradores autorizados
- Tabla `empleado_servicios` para asignación de servicios a empleadas
- Función `is_admin()` con SECURITY DEFINER (verifica si el usuario logueado es admin)
- Políticas RLS para todas las tablas del dashboard

---

## Paso 2 — Desplegar la Edge Function de Supabase

El dashboard usa una Edge Function para crear usuarios en Supabase Auth desde el panel. El código está en `index.ts`.

Desde la terminal, con [Supabase CLI](https://supabase.com/docs/guides/cli) instalado:

```bash
# Vincula tu proyecto local con el proyecto remoto
supabase link --project-ref whouejjrpjcvoueyajbu

# Despliega la función (se llama "smooth-function" en producción)
supabase functions deploy smooth-function --project-ref whouejjrpjcvoueyajbu
```

> **Nota:** Si ya está desplegada en Supabase, no necesitas volver a hacerlo.

---

## Paso 3 — Crear el primer administrador

En **Supabase → Authentication → Users**, crea un usuario con email y contraseña.

Luego en **SQL Editor**:

```sql
INSERT INTO admin_users (user_id, nombre, email)
VALUES (
  'UUID-DEL-USUARIO-CREADO',
  'Nombre del Admin',
  'admin@correo.com'
);
```

Reemplaza `UUID-DEL-USUARIO-CREADO` con el UUID que aparece en la columna `ID` de la tabla de usuarios en Supabase Auth.

> Para administradores adicionales, ve a `admins.html` dentro del dashboard (puedes crearlos desde ahí una vez que tengas acceso).

---

## Paso 4 — Subir a GitHub

```bash
# Desde la carpeta admin-dashboard/
git init
git add .
git commit -m "Admin Dashboard — Oh Diosas"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/ohdiosas-admin.git
git push -u origin main
```

---

## Paso 5 — Desplegar en Vercel

### Opción A — Importar desde GitHub (recomendado)

1. Ve a [vercel.com](https://vercel.com) → **Add New Project**
2. Selecciona tu repositorio `ohdiosas-admin`
3. Configura los ajustes de construcción:

| Ajuste | Valor |
|--------|-------|
| **Framework Preset** | Other |
| **Root Directory** | `./` (raíz del repo) |
| **Build Command** | *(dejar vacío)* |
| **Output Directory** | `frontend` |
| **Install Command** | *(dejar vacío)* |

4. En **Environment Variables**, agrega las siguientes:

| Variable | Valor | Dónde encontrarlo |
|----------|-------|-------------------|
| `SUPABASE_URL` | `https://whouejjrpjcvoueyajbu.supabase.co` | Supabase → Project Settings → API |
| `SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` | Supabase → Project Settings → API → anon/public |

> **Nota de seguridad:** La `anon key` es una clave pública por diseño — puede estar en el frontend sin riesgo. La `service_role key` **NUNCA** debe ir en el frontend ni en este proyecto.

5. Haz clic en **Deploy**

### Opción B — Vercel CLI

```bash
npm install -g vercel
cd admin-dashboard/
vercel

# Responder el asistente:
# Set up and deploy? Y
# Link to existing project? N
# Project name: ohdiosas-admin
# Which directory: ./
# Override settings? N

# Producción:
vercel --prod
```

---

## Paso 6 — Configurar URLs de Supabase Auth

Una vez desplegado, copia la URL de tu proyecto Vercel (ej: `https://ohdiosas-admin.vercel.app`) y agrégala en:

**Supabase → Authentication → URL Configuration:**
- **Site URL:** `https://ohdiosas-admin.vercel.app`
- **Redirect URLs:** agrega `https://ohdiosas-admin.vercel.app/**`

---

## Usuarios de prueba — Admin Dashboard

> Estos usuarios deben existir en Supabase Auth Y en la tabla `admin_users`.

| Rol | Email | Contraseña | Notas |
|-----|-------|------------|-------|
| Administrador principal | _(completar)_ | _(completar)_ | Tiene acceso completo al dashboard |
| Admin de prueba | _(completar)_ | _(completar)_ | Para testing, puede eliminarse |

**Para crear un usuario de prueba nuevo:**
1. Ve a `admins.html` en el dashboard (requiere estar logueado como admin)
2. Clic en **Nuevo admin**
3. Ingresa nombre, email y contraseña
4. El sistema crea el usuario en Supabase Auth y lo registra en `admin_users` automáticamente

---

## Desarrollo local

```bash
# Con npx serve (recomendado)
cd admin-dashboard/
npx serve frontend/ -p 5000
# Abrir: http://localhost:5000

# Con VS Code Live Server
# Clic derecho en frontend/index.html → Open with Live Server
```

Agrega `http://localhost:5000` a las **Redirect URLs** en Supabase Auth para que el login funcione localmente.

---

## Tablas que gestiona este dashboard

| Tabla | Operaciones |
|-------|-------------|
| `admin_users` | Validación de rol + CRUD admins |
| `empleados` | CRUD completo + vinculación Auth |
| `empleado_servicios` | Asignación empleada ↔ servicio |
| `citas` | CRUD + cambio de estado |
| `clientes` | Lectura + notas internas |
| `servicios` | CRUD completo |
| `testimonios` | Aprobación + orden |
| `disponibilidad` | Lectura de horarios |
| `bloqueos` | CRUD bloqueos del spa y empleadas |
| `configuracion` | Datos del negocio (teléfono, dirección, redes, etc.) |

---

## Seguridad

- La `service_role key` **nunca** va en el frontend — solo en la Edge Function de Supabase
- Doble validación: Supabase Auth (sesión activa) + RLS via `is_admin()` (verifica `admin_users`)
- Rate limiting de login: 10 intentos / 15 minutos por navegador
- Headers de seguridad en `vercel.json`: CSP, X-Frame-Options, X-Content-Type-Options
- `.env` y `graphify-out/` excluidos del repositorio via `.gitignore`
