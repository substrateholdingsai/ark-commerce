-- Migración: tabla designs + metadata en products (tenant marea)
-- Ejecutar: npx wrangler d1 execute ark-commerce-db --file=scripts/sql/schema_designs.sql

-- 1) Columna metadata en products (idempotente vía try/catch en wrangler; si ya existe, ignorar)
ALTER TABLE products ADD COLUMN metadata TEXT;

-- 2) Tabla designs
CREATE TABLE IF NOT EXISTS designs (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  slug TEXT NOT NULL,
  name TEXT NOT NULL,
  image_url TEXT,
  technique_recommended TEXT,
  active INTEGER NOT NULL DEFAULT 1,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
  UNIQUE (tenant_id, slug)
);
-- order_items: columnas para items configurados (Marea)
ALTER TABLE order_items ADD COLUMN design_id TEXT;
ALTER TABLE order_items ADD COLUMN talla TEXT;
ALTER TABLE order_items ADD COLUMN color TEXT;
ALTER TABLE order_items ADD COLUMN tecnica TEXT;
ALTER TABLE order_items ADD COLUMN base_cost REAL;
ALTER TABLE order_items ADD COLUMN print_cost REAL;
ALTER TABLE order_items ADD COLUMN precio_final REAL;
