-- ============================================================
-- SCHEMA ADMIN — Serenità Admin Dashboard
-- Ejecutar en Supabase SQL Editor
-- Proyecto: whouejjrpjcvoueyajbu.supabase.co
-- ============================================================

-- ============================================================
-- 1. TABLA ADMIN_USERS
-- ============================================================
CREATE TABLE IF NOT EXISTS admin_users (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  nombre     TEXT,
  email      TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 2. TABLA EMPLEADO_SERVICIOS (asignación empleada ↔ servicio)
-- ============================================================
CREATE TABLE IF NOT EXISTS empleado_servicios (
  empleado_id UUID NOT NULL REFERENCES empleados(id) ON DELETE CASCADE,
  servicio_id UUID NOT NULL REFERENCES servicios(id) ON DELETE CASCADE,
  PRIMARY KEY (empleado_id, servicio_id)
);

-- ============================================================
-- 3. EXTENDER TESTIMONIOS (estado y orden para gestión admin)
-- ============================================================
ALTER TABLE testimonios
  ADD COLUMN IF NOT EXISTS estado TEXT DEFAULT 'pendiente',
  ADD COLUMN IF NOT EXISTS orden  INTEGER DEFAULT 0;

-- ============================================================
-- 4. FUNCIÓN HELPER: is_admin()
-- Verifica si el usuario autenticado es administrador.
-- ============================================================
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM admin_users WHERE user_id = auth.uid()
  );
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- ============================================================
-- 5. RLS — admin_users
-- ============================================================
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admin_puede_ver_su_registro" ON admin_users
  FOR SELECT USING (auth.uid() = user_id);

-- ============================================================
-- 6. RLS — empleados (agregar política admin sobre las existentes)
-- ============================================================
CREATE POLICY "admin_full_empleados" ON empleados
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- ============================================================
-- 7. RLS — citas (agregar política admin)
-- ============================================================
CREATE POLICY "admin_full_citas" ON citas
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- ============================================================
-- 8. RLS — clientes (agregar política admin)
-- ============================================================
CREATE POLICY "admin_full_clientes" ON clientes
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- ============================================================
-- 9. RLS — servicios (agregar política admin para escritura)
-- ============================================================
CREATE POLICY "admin_full_servicios" ON servicios
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- ============================================================
-- 10. RLS — empleado_servicios
-- ============================================================
ALTER TABLE empleado_servicios ENABLE ROW LEVEL SECURITY;
CREATE POLICY "lectura_publica_es" ON empleado_servicios
  FOR SELECT USING (true);
CREATE POLICY "admin_full_es" ON empleado_servicios
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- ============================================================
-- 11. RLS — testimonios
-- ============================================================
ALTER TABLE testimonios ENABLE ROW LEVEL SECURITY;
CREATE POLICY "lectura_publica_aprobados" ON testimonios
  FOR SELECT USING (activo = true OR is_admin());
CREATE POLICY "admin_full_testimonios" ON testimonios
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- ============================================================
-- 12. RLS — disponibilidad
-- ============================================================
ALTER TABLE disponibilidad ENABLE ROW LEVEL SECURITY;
CREATE POLICY "lectura_publica_disponibilidad" ON disponibilidad
  FOR SELECT USING (true);
CREATE POLICY "admin_full_disponibilidad" ON disponibilidad
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- ============================================================
-- 13. RLS — bloqueos
-- ============================================================
ALTER TABLE bloqueos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "lectura_publica_bloqueos" ON bloqueos
  FOR SELECT USING (true);
CREATE POLICY "admin_full_bloqueos" ON bloqueos
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- ============================================================
-- 14. RLS — configuracion
-- ============================================================
ALTER TABLE configuracion ENABLE ROW LEVEL SECURITY;
CREATE POLICY "lectura_publica_config" ON configuracion
  FOR SELECT USING (true);
CREATE POLICY "admin_full_config" ON configuracion
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- ============================================================
-- 15. RLS — pagos (solo admin)
-- ============================================================
ALTER TABLE pagos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admin_full_pagos" ON pagos
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- ============================================================
-- PARA CREAR EL PRIMER ADMINISTRADOR
-- (ejecutar después de crear el usuario en Supabase Auth)
-- ============================================================
-- INSERT INTO admin_users (user_id, nombre, email)
-- VALUES ('<uuid-del-usuario-auth>', 'Tu Nombre', 'tu@email.com');
