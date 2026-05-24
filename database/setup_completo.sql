-- ============================================================
-- SETUP COMPLETO — Serenità Admin Dashboard
-- Pega TODO en Supabase → SQL Editor → Run
-- Proyecto: whouejjrpjcvoueyajbu.supabase.co
--
-- CREDENCIALES ADMIN:
--   Email:      admin@sereniita.com
--   Contraseña: Admin2024!
-- ============================================================


-- ============================================================
-- 1. EXTENSIÓN PARA HASHEAR CONTRASEÑA
-- ============================================================
CREATE EXTENSION IF NOT EXISTS pgcrypto;


-- ============================================================
-- 2. TABLAS NUEVAS
-- ============================================================

CREATE TABLE IF NOT EXISTS admin_users (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  nombre     TEXT,
  email      TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS empleado_servicios (
  empleado_id UUID NOT NULL REFERENCES empleados(id) ON DELETE CASCADE,
  servicio_id UUID NOT NULL REFERENCES servicios(id) ON DELETE CASCADE,
  PRIMARY KEY (empleado_id, servicio_id)
);

ALTER TABLE testimonios
  ADD COLUMN IF NOT EXISTS estado TEXT DEFAULT 'pendiente',
  ADD COLUMN IF NOT EXISTS orden  INTEGER DEFAULT 0;


-- ============================================================
-- 3. FUNCIÓN is_admin()
-- ============================================================

CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM admin_users WHERE user_id = auth.uid()
  );
$$ LANGUAGE SQL SECURITY DEFINER STABLE;


-- ============================================================
-- 4. RLS — HABILITAR EN TODAS LAS TABLAS
-- ============================================================

ALTER TABLE admin_users        ENABLE ROW LEVEL SECURITY;
ALTER TABLE empleado_servicios ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonios        ENABLE ROW LEVEL SECURITY;
ALTER TABLE disponibilidad     ENABLE ROW LEVEL SECURITY;
ALTER TABLE bloqueos           ENABLE ROW LEVEL SECURITY;
ALTER TABLE configuracion      ENABLE ROW LEVEL SECURITY;
ALTER TABLE pagos              ENABLE ROW LEVEL SECURITY;


-- ============================================================
-- 5. POLÍTICAS RLS
-- DROP IF EXISTS + CREATE para que el script sea re-ejecutable
-- ============================================================

-- admin_users
DROP POLICY IF EXISTS "admin_puede_ver_su_registro" ON admin_users;
CREATE POLICY "admin_puede_ver_su_registro" ON admin_users
  FOR SELECT USING (auth.uid() = user_id);

-- empleados
DROP POLICY IF EXISTS "admin_full_empleados" ON empleados;
CREATE POLICY "admin_full_empleados" ON empleados
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- citas
DROP POLICY IF EXISTS "admin_full_citas" ON citas;
CREATE POLICY "admin_full_citas" ON citas
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- clientes
DROP POLICY IF EXISTS "admin_full_clientes" ON clientes;
CREATE POLICY "admin_full_clientes" ON clientes
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- servicios
DROP POLICY IF EXISTS "admin_full_servicios" ON servicios;
CREATE POLICY "admin_full_servicios" ON servicios
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- empleado_servicios
DROP POLICY IF EXISTS "lectura_publica_es" ON empleado_servicios;
CREATE POLICY "lectura_publica_es" ON empleado_servicios
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "admin_full_es" ON empleado_servicios;
CREATE POLICY "admin_full_es" ON empleado_servicios
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- testimonios
DROP POLICY IF EXISTS "lectura_publica_aprobados" ON testimonios;
CREATE POLICY "lectura_publica_aprobados" ON testimonios
  FOR SELECT USING (activo = true OR is_admin());

DROP POLICY IF EXISTS "admin_full_testimonios" ON testimonios;
CREATE POLICY "admin_full_testimonios" ON testimonios
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- disponibilidad
DROP POLICY IF EXISTS "lectura_publica_disponibilidad" ON disponibilidad;
CREATE POLICY "lectura_publica_disponibilidad" ON disponibilidad
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "admin_full_disponibilidad" ON disponibilidad;
CREATE POLICY "admin_full_disponibilidad" ON disponibilidad
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- bloqueos
DROP POLICY IF EXISTS "lectura_publica_bloqueos" ON bloqueos;
CREATE POLICY "lectura_publica_bloqueos" ON bloqueos
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "admin_full_bloqueos" ON bloqueos;
CREATE POLICY "admin_full_bloqueos" ON bloqueos
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- configuracion
DROP POLICY IF EXISTS "lectura_publica_config" ON configuracion;
CREATE POLICY "lectura_publica_config" ON configuracion
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "admin_full_config" ON configuracion;
CREATE POLICY "admin_full_config" ON configuracion
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- pagos
DROP POLICY IF EXISTS "admin_full_pagos" ON pagos;
CREATE POLICY "admin_full_pagos" ON pagos
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());


-- ============================================================
-- 6. CREAR USUARIO ADMIN EN auth.users
-- UUID fijo para poder referenciar sin variables
-- ON CONFLICT → no falla si ya existe
-- ============================================================

INSERT INTO auth.users (
  id,
  instance_id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  created_at,
  updated_at,
  confirmation_token,
  recovery_token,
  email_change_token_new,
  email_change
)
VALUES (
  'a1b2c3d4-0000-4000-8000-000000000001',   -- UUID fijo del admin
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'admin@sereniita.com',
  crypt('Admin2024!', gen_salt('bf')),
  now(),                                      -- email ya confirmado, no requiere verificación
  '{"provider":"email","providers":["email"]}',
  '{"nombre":"Administrador"}',
  false,
  now(),
  now(),
  '', '', '', ''
)
ON CONFLICT DO NOTHING;


-- ============================================================
-- 7. INSERTAR EN admin_users (vincula el usuario Auth)
-- Usa subquery para obtener el UUID real (funciona aunque el
-- usuario ya existiera con otro UUID)
-- ============================================================

INSERT INTO admin_users (user_id, nombre, email)
SELECT id, 'Administrador', 'admin@sereniita.com'
FROM auth.users
WHERE email = 'admin@sereniita.com'
ON CONFLICT DO NOTHING;


-- ============================================================
-- VERIFICACIÓN — debe devolver 1 fila
-- ============================================================

SELECT
  u.email,
  u.email_confirmed_at IS NOT NULL  AS email_confirmado,
  a.nombre                          AS nombre_admin,
  a.created_at                      AS registrado_en
FROM auth.users u
JOIN admin_users a ON a.user_id = u.id
WHERE u.email = 'admin@sereniita.com';
