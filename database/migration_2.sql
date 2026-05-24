-- ============================================================
-- MIGRACIÓN 2 — Tabla configuracion + normalización testimonios
-- Ejecutar en: Supabase → SQL Editor → Run
-- Es idempotente: se puede re-ejecutar sin errores
-- ============================================================


-- ============================================================
-- 1. TABLA configuracion (una sola fila)
-- ============================================================

CREATE TABLE IF NOT EXISTS configuracion (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre_spa                TEXT NOT NULL DEFAULT 'Serenità Spa',
  slogan                    TEXT,
  descripcion               TEXT,
  direccion                 TEXT,
  ciudad                    TEXT,
  pais                      TEXT DEFAULT 'Colombia',
  horario_atencion          TEXT,
  telefono                  TEXT,
  whatsapp                  TEXT,
  email_contacto            TEXT,
  redes_sociales            JSONB DEFAULT '{}',
  reserva_anticip_min_horas INTEGER DEFAULT 2,
  reserva_anticip_max_dias  INTEGER DEFAULT 60,
  buffer_min                INTEGER DEFAULT 15,
  politica_cancelacion      TEXT,
  color_primario            TEXT DEFAULT '#8A6EA8',
  color_acento              TEXT DEFAULT '#D4A84B',
  meta_title                TEXT,
  meta_description          TEXT,
  logo_url                  TEXT,
  horario_semana            JSONB DEFAULT '{}',
  slot_duracion_min         INTEGER DEFAULT 60,
  updated_at                TIMESTAMPTZ DEFAULT now()
);

-- Si la tabla ya existía con 'nombre_negocio', renombrar a nombre_spa
-- (DROP COLUMN quita el nombre_spa vacío que ADD COLUMN pudo haber creado)
ALTER TABLE configuracion DROP COLUMN IF EXISTS nombre_spa;
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'configuracion' AND column_name = 'nombre_negocio'
  ) THEN
    ALTER TABLE configuracion RENAME COLUMN nombre_negocio TO nombre_spa;
  END IF;
END $$;

-- Columnas adicionales — se ejecutan ANTES del INSERT
ALTER TABLE configuracion ADD COLUMN IF NOT EXISTS nombre_spa               TEXT NOT NULL DEFAULT 'Serenità Spa';
ALTER TABLE configuracion ADD COLUMN IF NOT EXISTS slogan                   TEXT;
ALTER TABLE configuracion ADD COLUMN IF NOT EXISTS descripcion              TEXT;
ALTER TABLE configuracion ADD COLUMN IF NOT EXISTS direccion                TEXT;
ALTER TABLE configuracion ADD COLUMN IF NOT EXISTS ciudad                   TEXT;
ALTER TABLE configuracion ADD COLUMN IF NOT EXISTS pais                     TEXT DEFAULT 'Colombia';
ALTER TABLE configuracion ADD COLUMN IF NOT EXISTS horario_atencion         TEXT;
ALTER TABLE configuracion ADD COLUMN IF NOT EXISTS telefono                 TEXT;
ALTER TABLE configuracion ADD COLUMN IF NOT EXISTS whatsapp                 TEXT;
ALTER TABLE configuracion ADD COLUMN IF NOT EXISTS email_contacto           TEXT;
ALTER TABLE configuracion ADD COLUMN IF NOT EXISTS redes_sociales           JSONB DEFAULT '{}';
ALTER TABLE configuracion ADD COLUMN IF NOT EXISTS reserva_anticip_min_horas INTEGER DEFAULT 2;
ALTER TABLE configuracion ADD COLUMN IF NOT EXISTS reserva_anticip_max_dias  INTEGER DEFAULT 60;
ALTER TABLE configuracion ADD COLUMN IF NOT EXISTS buffer_min               INTEGER DEFAULT 15;
ALTER TABLE configuracion ADD COLUMN IF NOT EXISTS politica_cancelacion     TEXT;
ALTER TABLE configuracion ADD COLUMN IF NOT EXISTS color_primario           TEXT DEFAULT '#8A6EA8';
ALTER TABLE configuracion ADD COLUMN IF NOT EXISTS color_acento             TEXT DEFAULT '#D4A84B';
ALTER TABLE configuracion ADD COLUMN IF NOT EXISTS meta_title               TEXT;
ALTER TABLE configuracion ADD COLUMN IF NOT EXISTS meta_description         TEXT;
ALTER TABLE configuracion ADD COLUMN IF NOT EXISTS logo_url                 TEXT;
ALTER TABLE configuracion ADD COLUMN IF NOT EXISTS horario_semana           JSONB DEFAULT '{}';
ALTER TABLE configuracion ADD COLUMN IF NOT EXISTS slot_duracion_min        INTEGER DEFAULT 60;
ALTER TABLE configuracion ADD COLUMN IF NOT EXISTS updated_at               TIMESTAMPTZ DEFAULT now();

-- Disparador para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_configuracion_updated_at ON configuracion;
CREATE TRIGGER trg_configuracion_updated_at
  BEFORE UPDATE ON configuracion
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Insertar fila inicial si la tabla está vacía
INSERT INTO configuracion (nombre_spa, slogan)
SELECT 'Serenità Spa', 'Luxury Wellness'
WHERE NOT EXISTS (SELECT 1 FROM configuracion);


-- ============================================================
-- 2. RLS para configuracion
-- ============================================================

ALTER TABLE configuracion ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "lectura_publica_config"  ON configuracion;
CREATE POLICY "lectura_publica_config" ON configuracion
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "admin_full_config" ON configuracion;
CREATE POLICY "admin_full_config" ON configuracion
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());


-- ============================================================
-- 3. NORMALIZAR testimonios — filas legacy
--    Rows con activo=true y estado='pendiente' (DEFAULT)
--    deben estar en 'publicado' para seguir apareciendo en el sitio
-- ============================================================

UPDATE testimonios
SET estado = 'publicado'
WHERE activo = true
  AND (estado IS NULL OR estado = 'pendiente');

UPDATE testimonios
SET estado = 'oculto'
WHERE activo = false
  AND (estado IS NULL OR estado = 'pendiente');


-- ============================================================
-- 4. Actualizar política RLS testimonios para usar estado
-- ============================================================

DROP POLICY IF EXISTS "lectura_publica_aprobados" ON testimonios;
CREATE POLICY "lectura_publica_aprobados" ON testimonios
  FOR SELECT USING (estado = 'publicado' OR is_admin());


-- ============================================================
-- VERIFICACIÓN
-- ============================================================

SELECT 'configuracion' AS tabla, COUNT(*) AS filas FROM configuracion
UNION ALL
SELECT 'testimonios',             COUNT(*) FROM testimonios
UNION ALL
SELECT 'testimonios publicados',  COUNT(*) FROM testimonios WHERE estado = 'publicado';
