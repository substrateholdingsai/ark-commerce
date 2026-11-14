-- ============================================================================
-- MIGRACIÓN: TABLAS DE CONTENIDO DINÁMICO POR TENANT (Ark Commerce)
-- Número de migración: 11 (despues de schema_staypuft_audit.sql)
--
-- Almacena páginas/secciones de contenido dinámico (hero en orden, además de
-- secciones genéricas: experience, offers, program, location, affiliation,
-- faq), eventos, contacto general y catálogo de servicios por tenant. Todo
-- tenant-scoped vía tenant_id, como products/orders.
--
-- Campos de auditoría: created_at, updated_at, updated_by (operador, nunca un
-- secreto), version y source_note (para registrar qué documento oficial
-- originó cada valor, ej. "CANACO oficio 2026-__"; nunca un PDF de 2025
-- presentado como vigente).
--
-- Idempotente: seguro para ejecutar múltiples veces. No aplica a producción
-- hasta que Pavel apruebe el despliegue. Las tablas quedan vacías en
-- producción: no se importan fechas, precios, conteos de visitantes ni montos
-- de patrocinio del hardcoded canaco-content.ts ni de ningún PDF de 2025.
-- ============================================================================

-- 1) Secciones/páginas de contenido (hero en orden + secciones genéricas)
CREATE TABLE IF NOT EXISTS content_sections (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  page TEXT NOT NULL DEFAULT 'home',
  section_type TEXT NOT NULL, -- 'hero' | 'experience' | 'offers' | 'program' | 'location' | 'affiliation' | 'faq' | 'services' (Ark services showcase)
  title TEXT,
  subtitle TEXT,
  body TEXT,
  cta_label TEXT,
  cta_link TEXT,
  product_id TEXT REFERENCES products(id), -- high-ticket offer link: price/stock live in products, not free-floating here
  image TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  active INTEGER NOT NULL DEFAULT 1,
  version TEXT DEFAULT '1',
  source_note TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_by TEXT DEFAULT 'staypuft'
);

-- 2) Eventos (nombre, descripcion, alcance, formato, fecha, proxima_fecha,
--    lugar, expectativa, actividades, patrocinios, costos_stands_preventa)
CREATE TABLE IF NOT EXISTS content_eventos (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  descripcion TEXT,
  alcance TEXT,
  formato TEXT,
  fecha TEXT,
  proxima_fecha TEXT,
  lugar TEXT,
  expectativa TEXT,
  actividades TEXT, -- JSON array de strings
  patrocinios TEXT, -- JSON array
  costos_stands_preventa TEXT, -- JSON array
  display_order INTEGER NOT NULL DEFAULT 0,
  active INTEGER NOT NULL DEFAULT 1,
  version TEXT DEFAULT '1',
  source_note TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_by TEXT DEFAULT 'staypuft'
);

-- 3) Contacto general (una fila por tenant)
CREATE TABLE IF NOT EXISTS content_contacto_general (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  departamento TEXT,
  correo TEXT,
  telefono TEXT,
  telefonos_expo_feria TEXT, -- JSON array de strings
  version TEXT DEFAULT '1',
  source_note TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_by TEXT DEFAULT 'staypuft',
  UNIQUE (tenant_id)
);

-- 4) Catálogo de servicios (gateway de herramientas CANACO para asociados)
CREATE TABLE IF NOT EXISTS content_catalogo_servicios (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  categoria TEXT NOT NULL,
  descripcion TEXT,
  departamento TEXT,
  contacto TEXT, -- JSON objeto { telefono?, email?, persona? }
  display_order INTEGER NOT NULL DEFAULT 0,
  active INTEGER NOT NULL DEFAULT 1,
  version TEXT DEFAULT '1',
  source_note TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_by TEXT DEFAULT 'staypuft'
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_content_sections_tenant ON content_sections(tenant_id, active, display_order);
CREATE INDEX IF NOT EXISTS idx_content_sections_page ON content_sections(tenant_id, page, section_type);
CREATE INDEX IF NOT EXISTS idx_content_eventos_tenant ON content_eventos(tenant_id, active, display_order);
CREATE INDEX IF NOT EXISTS idx_content_contacto_tenant ON content_contacto_general(tenant_id);
CREATE INDEX IF NOT EXISTS idx_content_catalogo_tenant ON content_catalogo_servicios(tenant_id, active, display_order);
