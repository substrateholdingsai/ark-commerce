-- ============================================================
-- SEED SCRIPT — CANACO SERVYTUR Mérida Tenant
-- Idempotente: seguro para ejecutar múltiples veces.
-- Compatible con el esquema definido en schema.sql.
-- ============================================================

-- Tenant CANACO SERVYTUR Mérida
INSERT OR IGNORE INTO tenants (id, name, slug, domain, whatsapp, clabe, bank, clabe_holder, theme_color)
VALUES (
  'ten_canaco_01',
  'CANACO SERVYTUR Mérida',
  'canaco',
  'canaco.arksystems.site',
  '+529999428850',
  '012180001234567890',
  'BBVA',
  'CANACO SERVYTUR Mérida',
  '#FAF8F5'
);

-- Admin CANACO (password: admin123 — hash existente de schema.sql:96)
INSERT OR IGNORE INTO tenant_users (id, tenant_id, email, password_hash, role)
VALUES (
  'usr_canaco_admin',
  'ten_canaco_01',
  'admin@canacomerida.com',
  '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9',
  'admin'
);

-- Productos CANACO (Stand Expo Feria / Patrocinios)
INSERT OR IGNORE INTO products (
  id, tenant_id, name, weight, price, desc, image, badge, stock, active, display_order
)
VALUES
(
  'prod_stand_2x2',
  'ten_canaco_01',
  'Stand Estándar 2x2',
  'Unidad',
  8000.00,
  'Expo Feria del Comercio 2026 — Stand estándar 2x2 metros',
  '/images/canaco/stand-2x2.jpg',
  NULL,
  99,
  1,
  1
),
(
  'prod_sponsor_oro',
  'ten_canaco_01',
  'Patrocinio Oro — Desayuno Networking',
  'Paquete',
  9500.00,
  '10 min de presentación + Banner en desayuno networking',
  '/images/canaco/sponsor-oro.jpg',
  NULL,
  10,
  1,
  2
);
