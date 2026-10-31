-- Provisioning Tenant: marea (MAREA — Playeras Personalizadas del Sureste)
INSERT INTO tenants (id, name, slug, domain, whatsapp, clabe, bank, clabe_holder, btcpay_pos_url, sats_rate, logo_url, theme_color) 
VALUES ('marea', 'MAREA · Playeras Personalizadas', 'marea', NULL, '529990000000', '0121 8000 1234 5678 90', 'BBVA', 'Marea Playeras del Sureste', NULL, 1.0, '/images/marea/favicon.svg', '#0EA9A8') 
ON CONFLICT(id) DO UPDATE SET 
  name=excluded.name, 
  whatsapp=excluded.whatsapp, 
  clabe=excluded.clabe, 
  bank=excluded.bank, 
  clabe_holder=excluded.clabe_holder, 
  logo_url=excluded.logo_url, 
  theme_color=excluded.theme_color;

-- Usuario Administrador de Marea (admin@marea.mx / admin123)
INSERT INTO tenant_users (id, tenant_id, email, password_hash, role)
VALUES ('user-marea-admin', 'marea', 'admin@marea.mx', '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9', 'owner')
ON CONFLICT(id) DO UPDATE SET email=excluded.email, password_hash=excluded.password_hash;

-- Desactivar productos previos o sincronizar
UPDATE products SET active = 0 WHERE tenant_id = 'marea';

-- Catálogo Oficial MAREA
INSERT INTO products (id, tenant_id, name, weight, price, desc, image, badge, stock, active, display_order) 
VALUES ('marea-1', 'marea', 'Ola Nocturna', '100% Algodón Peinado · Tallas S-XL', 349.0, 'Playera teal con estampado de ola nocturna en serigrafía de alta duración.', '/images/marea/favicon.svg', 'NUEVO', 100, 1, 1) 
ON CONFLICT(id) DO UPDATE SET price=excluded.price, active=1;

INSERT INTO products (id, tenant_id, name, weight, price, desc, image, badge, stock, active, display_order) 
VALUES ('marea-2', 'marea', 'Sol de Tulum', '100% Algodón Peinado · Tallas S-XXL', 329.0, 'Playera arena con estampado de sol coral inspirado en los atardeceres de Tulum.', '/images/marea/favicon.svg', NULL, 100, 1, 2) 
ON CONFLICT(id) DO UPDATE SET price=excluded.price, active=1;

INSERT INTO products (id, tenant_id, name, weight, price, desc, image, badge, stock, active, display_order) 
VALUES ('marea-3', 'marea', 'Espíritu Selva', '100% Algodón Peinado · Tallas M-XL', 359.0, 'Playera verde selva con estampado orgánico de palmera caribeña.', '/images/marea/favicon.svg', NULL, 100, 1, 3) 
ON CONFLICT(id) DO UPDATE SET price=excluded.price, active=1;

INSERT INTO products (id, tenant_id, name, weight, price, desc, image, badge, stock, active, display_order) 
VALUES ('marea-4', 'marea', 'Marea Tricolor', '100% Algodón Peinado · Tallas S-L', 379.0, 'Playera noche oscura con triángulo geométrico y detalles mango vibrante.', '/images/marea/favicon.svg', 'LIMITADA', 40, 1, 4) 
ON CONFLICT(id) DO UPDATE SET price=excluded.price, active=1;

INSERT INTO products (id, tenant_id, name, weight, price, desc, image, badge, stock, active, display_order) 
VALUES ('marea-5', 'marea', 'Coral Vivo', '100% Algodón Peinado · Tallas S-XL', 349.0, 'Playera coral caribeño con ola estampada en tinta ecológica blanca.', '/images/marea/favicon.svg', NULL, 100, 1, 5) 
ON CONFLICT(id) DO UPDATE SET price=excluded.price, active=1;

INSERT INTO products (id, tenant_id, name, weight, price, desc, image, badge, stock, active, display_order) 
VALUES ('marea-6', 'marea', 'MANGO Beach', '100% Algodón Peinado · Tallas S-XXL', 339.0, 'Edición festiva en amarillo mango con tipografía MAREA en tinta profunda.', '/images/marea/favicon.svg', 'OFERTA', 60, 1, 6) 
ON CONFLICT(id) DO UPDATE SET price=excluded.price, active=1;

INSERT INTO products (id, tenant_id, name, weight, price, desc, image, badge, stock, active, display_order) 
VALUES ('marea-7', 'marea', 'Máscara Marina', '100% Algodón Peinado · Tallas M-XL', 399.0, 'Playera lavanda con máscara abstracta estilizada del Sureste.', '/images/marea/favicon.svg', 'LIMITADA', 30, 1, 7) 
ON CONFLICT(id) DO UPDATE SET price=excluded.price, active=1;

INSERT INTO products (id, tenant_id, name, weight, price, desc, image, badge, stock, active, display_order) 
VALUES ('marea-8', 'marea', 'Ola Espuma', '100% Algodón Peinado · Tallas S-XXL', 329.0, 'Playera blanca pura con trazo minimalista de ola en teal caribeño.', '/images/marea/favicon.svg', NULL, 100, 1, 8) 
ON CONFLICT(id) DO UPDATE SET price=excluded.price, active=1;
