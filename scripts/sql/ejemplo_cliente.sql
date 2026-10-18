-- Provisioning Tenant: cafe-mayab (Café Artesanal del Mayab)
INSERT INTO tenants (id, name, slug, domain, whatsapp, clabe, bank, clabe_holder, btcpay_pos_url, sats_rate, logo_url, theme_color) 
VALUES ('cafe-mayab', 'Café Artesanal del Mayab', 'cafe-mayab', NULL, '529991234567', '0121 8009 8765 4321 00', 'BBVA', 'Café Artesanal del Mayab', 'https://btcpay.cafemayab.mx/pos', 2.5, '/favicon.svg', '#C68B59') 
ON CONFLICT(id) DO UPDATE SET name=excluded.name, whatsapp=excluded.whatsapp, clabe=excluded.clabe, bank=excluded.bank, sats_rate=excluded.sats_rate, theme_color=excluded.theme_color;

-- Admin User (Password temporal: admin123)
INSERT OR IGNORE INTO tenant_users (id, tenant_id, email, password_hash, role) 
VALUES ('user-cafe-mayab', 'cafe-mayab', 'admin@cafe-mayab.com', '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9', 'owner');

-- Desactivar productos previos o sincronizar
UPDATE products SET active = 0 WHERE tenant_id = 'cafe-mayab';

INSERT INTO products (id, tenant_id, name, weight, price, desc, image, badge, stock, active, display_order) VALUES ('cafe-mayab-p1', 'cafe-mayab', 'Café Maya Tostado Oscuro 500g', '500g grano o molido', 240.0, 'Notas a chocolate amargo, nuez de castilla y caramelo. Cosechado a 1,200 msnm.', '/favicon.svg', 'FAVORITO', 40, 1, 1) ON CONFLICT(id) DO UPDATE SET price=excluded.price, stock=excluded.stock, active=1;
INSERT INTO products (id, tenant_id, name, weight, price, desc, image, badge, stock, active, display_order) VALUES ('cafe-mayab-p2', 'cafe-mayab', 'Blend Espresso Barista 1kg', '1kg grano entero', 420.0, 'Mezcla premium con cuerpo denso y crema dorada persistente.', '/favicon.svg', 'BARISTA', 25, 1, 2) ON CONFLICT(id) DO UPDATE SET price=excluded.price, stock=excluded.stock, active=1;
INSERT INTO products (id, tenant_id, name, weight, price, desc, image, badge, stock, active, display_order) VALUES ('cafe-mayab-p3', 'cafe-mayab', 'Prensa Francesa Vidrio Borosilicato', '600ml', 350.0, 'Cafetera de émbolo para una extracción limpia y balanceada.', '/favicon.svg', 'EQUIPO', 12, 1, 3) ON CONFLICT(id) DO UPDATE SET price=excluded.price, stock=excluded.stock, active=1;