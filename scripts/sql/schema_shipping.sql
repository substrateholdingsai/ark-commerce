-- ============================================================================
-- MIGRACIÓN LOGÍSTICA: ENVIA.COM
-- Añade campos de paquetería, rastreo y guías a 'orders' y dirección de origen a 'tenants'
-- ============================================================================

-- Campos en órdenes
ALTER TABLE orders ADD COLUMN shipping_carrier TEXT;
ALTER TABLE orders ADD COLUMN shipping_service TEXT;
ALTER TABLE orders ADD COLUMN shipping_tracking_number TEXT;
ALTER TABLE orders ADD COLUMN shipping_tracking_url TEXT;
ALTER TABLE orders ADD COLUMN shipping_label_url TEXT;
ALTER TABLE orders ADD COLUMN shipping_cost REAL DEFAULT 0;

-- Campos de origen en tenants (para cotizar y generar guías)
ALTER TABLE tenants ADD COLUMN origin_street TEXT;
ALTER TABLE tenants ADD COLUMN origin_number TEXT;
ALTER TABLE tenants ADD COLUMN origin_district TEXT;
ALTER TABLE tenants ADD COLUMN origin_city TEXT;
ALTER TABLE tenants ADD COLUMN origin_state TEXT;
ALTER TABLE tenants ADD COLUMN origin_postal_code TEXT;
ALTER TABLE tenants ADD COLUMN origin_country TEXT DEFAULT 'MX';
ALTER TABLE tenants ADD COLUMN envia_api_key TEXT;
