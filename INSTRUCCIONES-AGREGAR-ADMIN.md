# Cómo agregar un Administrador manualmente desde Supabase

Usa este método si el panel de Admins no está disponible o si es el primer admin **de una empresa nueva**.

> **Multi-tenant:** desde que el sistema pasó a servir varias empresas, `admin_users` exige
> una columna `empresa_id`. El Método 1 (panel) la resuelve solo — hereda la empresa del
> admin que está logueado, así que **solo sirve para agregar OTRO admin a una empresa que
> ya tiene al menos uno**. Para el **primer** admin de una empresa nueva no hay panel
> (a propósito, no existe un "super-admin" que gestione empresas desde afuera) — se hace
> manual, Método 2, incluyendo el paso 0 de abajo.

---

## Método 1 — Desde el Panel de Admins (recomendado, solo si la empresa ya tiene un admin)

1. Ingresa al panel en `/admins.html` con una cuenta de admin **de esa misma empresa**
2. Haz clic en **"Nuevo admin"**
3. Llena nombre, correo y contraseña
4. Haz clic en **"Crear admin"**

El sistema crea el usuario en Supabase Auth, lo registra automáticamente, y le asigna la
misma `empresa_id` que el admin que lo creó — no hay forma de crear un admin para otra
empresa desde acá, ni falta: es justamente lo que evita "entrar a la cuenta de otro".

---

## Método 2 — Manual desde Supabase Dashboard

Usa este método cuando no puedas iniciar sesión en el panel, **o cuando estés creando el
primer admin de una empresa que recién se está dando de alta**.

### Paso 0 — ¿Cuál es el `empresa_id`?

Si la empresa ya existe, búscala:

```sql
select id, nombre, slug, created_at from empresas order by created_at desc;
```

Si todavía no existe, créala primero (ver el manual completo de alta de empresa en
`SpaOhDiosas/README.md`, sección "Multi-tenant"):

```sql
insert into empresas (nombre, slug) values ('Nombre de la Empresa', 'slug-unico')
returning id;
```

Guarda el `id` que te devuelve — es el que usas en el Paso 2.

### Paso 1 — Crear el usuario en Supabase Auth

1. Ve a **supabase.com** → tu proyecto
2. Menú izquierdo → **Authentication** → **Users**
3. Haz clic en **"Add user"** → **"Create new user"**
4. Ingresa el **email** y la **contraseña**
5. Haz clic en **"Create user"**
6. Copia el **UUID** que aparece en la columna `User UID` (formato: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`)

### Paso 2 — Registrar como admin en la base de datos

1. Ve a **SQL Editor** en el menú izquierdo
2. Pega y ejecuta el siguiente SQL (reemplaza los valores):

```sql
INSERT INTO admin_users (user_id, nombre, email, empresa_id)
VALUES (
  'PEGA-AQUI-EL-UUID',      -- UUID copiado del paso anterior
  'Nombre del Admin',        -- Nombre completo
  'correo@ejemplo.com',      -- Mismo correo del paso anterior
  'PEGA-AQUI-EL-EMPRESA-ID'  -- El id del Paso 0
);
```

> Si omites `empresa_id`, este INSERT falla — la columna es obligatoria (`NOT NULL`)
> desde la migración multi-tenant.

### Paso 3 — Verificar

```sql
SELECT id, nombre, email, empresa_id FROM admin_users ORDER BY created_at DESC;
```

Deberías ver el nuevo admin en la lista, con el `empresa_id` correcto.

---

## Cómo revocar acceso a un admin

### Desde el panel
- Ve a `/admins.html` → botón **"Eliminar"** junto al admin

### Desde SQL Editor
```sql
-- Solo revoca el acceso al panel, NO elimina la cuenta Auth
DELETE FROM admin_users WHERE email = 'correo@ejemplo.com';
```

> Si también quieres eliminar la cuenta de Supabase Auth:
> Authentication → Users → busca el usuario → menú "..." → Delete user

---

## Tabla de referencia

| Tabla         | Propósito                                  |
|---------------|--------------------------------------------|
| `empresas`    | Registro de cada empresa/tenant del sistema |
| `admin_users` | Registra quién tiene acceso al panel admin, y a qué empresa pertenece |
| `auth.users`  | Tabla interna de Supabase Auth (no editar) |

La función `is_admin()` comprueba si el `auth.uid()` del usuario existe en `admin_users`.
Si el registro está en `admin_users` pero no en `auth.users`, el login fallará.
Si el registro está en `auth.users` pero no en `admin_users`, el login también fallará.
Ambos registros deben existir y tener el mismo UUID.

La función `current_empresa_id()` resuelve la empresa del usuario logueado (buscando su
`auth.uid()` en `admin_users` o `empleados`) — es la que usan todas las políticas RLS
para que cada empresa solo vea sus propios datos.

---

## Datos del proyecto

- **Proyecto Supabase:** `whouejjrpjcvoueyajbu`
- **URL:** `https://whouejjrpjcvoueyajbu.supabase.co`
- **Edge Function (crear usuarios):** `smooth-function`
