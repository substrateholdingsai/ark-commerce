-- Provisioning Service Tenant: baakal (BAAKAL — Plomería & Gas)
INSERT INTO tenants (id, name, slug, domain, whatsapp, clabe, bank, clabe_holder, btcpay_pos_url, sats_rate, logo_url, theme_color) 
VALUES ('baakal', 'BAAKAL — Plomería & Gas', 'baakal', NULL, '529991234567', '0121 8000 9988 7766 55', 'BBVA', 'Baakal Servicios Hidráulicos', NULL, 1.0, '/images/baakal/favicon.svg', '#2A7F9E') 
ON CONFLICT(id) DO UPDATE SET name=excluded.name, whatsapp=excluded.whatsapp, clabe=excluded.clabe, bank=excluded.bank, theme_color=excluded.theme_color;

-- Desactivar productos previos o sincronizar
UPDATE products SET active = 0 WHERE tenant_id = 'baakal';

-- Servicios Especializados de Baakal
INSERT INTO products (id, tenant_id, name, weight, price, desc, image, badge, stock, active, display_order) 
VALUES ('baakal-p1', 'baakal', 'Destape de Drenaje & Inspección con Video', 'Por servicio · Garantía 30 días', 850.0, 'Sondeo mecánico eléctrico y diagnóstico con cámara boroscópica en tuberías de 2 a 4 pulgadas.', '/images/baakal/favicon.svg', 'MÁS SOLICITADO', 999, 1, 1) 
ON CONFLICT(id) DO UPDATE SET price=excluded.price, active=1;

INSERT INTO products (id, tenant_id, name, weight, price, desc, image, badge, stock, active, display_order) 
VALUES ('baakal-p2', 'baakal', 'Instalación de Calentador / Boiler (Gas o Solar)', 'Por equipo · Incluye prueba hermética', 1250.0, 'Montaje, conexión en tubería de cobre o termofusión y presurización segura sin fugas.', '/images/baakal/favicon.svg', 'CERTIFICADO', 999, 1, 2) 
ON CONFLICT(id) DO UPDATE SET price=excluded.price, active=1;

INSERT INTO products (id, tenant_id, name, weight, price, desc, image, badge, stock, active, display_order) 
VALUES ('baakal-p3', 'baakal', 'Detección & Reparación de Fuga de Gas LP', 'Urgencia técnica · Atención inmediata', 1450.0, 'Revisión con detector ultrasónico de gas, reemplazo de llaves de paso y presurización de línea.', '/images/baakal/favicon.svg', 'EMERGENCIA 24H', 999, 1, 3) 
ON CONFLICT(id) DO UPDATE SET price=excluded.price, active=1;

INSERT INTO products (id, tenant_id, name, weight, price, desc, image, badge, stock, active, display_order) 
VALUES ('baakal-p4', 'baakal', 'Mantenimiento a Cisterna & Sistema Hidroneumático', 'Servicio preventivo o correctivo', 1800.0, 'Lavado, desinfección con grado alimenticio, purgado de bomba y calibración de presostato.', '/images/baakal/favicon.svg', 'INTEGRAL', 999, 1, 4) 
ON CONFLICT(id) DO UPDATE SET price=excluded.price, active=1;
