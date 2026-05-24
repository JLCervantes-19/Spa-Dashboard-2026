# Cómo agregar un Administrador manualmente desde Supabase

Usa este método si el panel de Admins no está disponible o si es el primer admin.

---

## Método 1 — Desde el Panel de Admins (recomendado)

1. Ingresa al panel en `/admins.html`
2. Haz clic en **"Nuevo admin"**
3. Llena nombre, correo y contraseña
4. Haz clic en **"Crear admin"**

El sistema crea el usuario en Supabase Auth y lo registra automáticamente.

---

## Método 2 — Manual desde Supabase Dashboard

Usa este método cuando no puedas iniciar sesión en el panel.

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
INSERT INTO admin_users (user_id, nombre, email)
VALUES (
  'PEGA-AQUI-EL-UUID',     -- UUID copiado del paso anterior
  'Nombre del Admin',       -- Nombre completo
  'correo@ejemplo.com'      -- Mismo correo del paso anterior
);
```

### Paso 3 — Verificar

```sql
SELECT * FROM admin_users ORDER BY created_at DESC;
```

Deberías ver el nuevo admin en la lista.

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
| `admin_users` | Registra quién tiene acceso al panel admin |
| `auth.users`  | Tabla interna de Supabase Auth (no editar) |

La función `is_admin()` comprueba si el `auth.uid()` del usuario existe en `admin_users`.
Si el registro está en `admin_users` pero no en `auth.users`, el login fallará.
Si el registro está en `auth.users` pero no en `admin_users`, el login también fallará.
Ambos registros deben existir y tener el mismo UUID.

---

## Datos del proyecto

- **Proyecto Supabase:** `whouejjrpjcvoueyajbu`
- **URL:** `https://whouejjrpjcvoueyajbu.supabase.co`
- **Edge Function (crear usuarios):** `smooth-function`
