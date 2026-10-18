-- Tabla de Tenants (Tiendas)
CREATE TABLE IF NOT EXISTS tenants (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  domain TEXT,
  whatsapp TEXT,
  clabe TEXT,
  bank TEXT,
  clabe_holder TEXT,
  btcpay_pos_url TEXT,
  sats_rate REAL DEFAULT 2.5,
  logo_url TEXT,
  theme_color TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Usuarios del Panel Admin por Tenant
CREATE TABLE IF NOT EXISTS tenant_users (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'owner',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Productos
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  weight TEXT NOT NULL,
  price REAL NOT NULL,
  desc TEXT NOT NULL,
  image TEXT NOT NULL,
  badge TEXT,
  stock INTEGER NOT NULL DEFAULT 0,
  active INTEGER NOT NULL DEFAULT 1,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Ordenes (Pedidos)
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  order_number TEXT NOT NULL UNIQUE,
  customer_name TEXT NOT NULL,
  customer_address TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_notes TEXT,
  payment_method TEXT NOT NULL,
  total REAL NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Items de la Orden (Detalle)
CREATE TABLE IF NOT EXISTS order_items (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL,
  product_id TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  price REAL NOT NULL,
  name TEXT NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id)
);

-- Indices
CREATE INDEX IF NOT EXISTS idx_products_tenant ON products(tenant_id, active);
CREATE INDEX IF NOT EXISTS idx_products_display_order ON products(display_order);
CREATE INDEX IF NOT EXISTS idx_orders_tenant ON orders(tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);
CREATE INDEX IF NOT EXISTS idx_tenant_users_tenant ON tenant_users(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tenants_slug ON tenants(slug);
CREATE INDEX IF NOT EXISTS idx_tenants_domain ON tenants(domain);

-- ============================================================================
-- SEED DATA
-- ============================================================================

-- Tenant 1: Ark Systems (Nuestra Plataforma / Tienda Principal por Defecto)
INSERT OR IGNORE INTO tenants (id, name, slug, domain, whatsapp, clabe, bank, clabe_holder, btcpay_pos_url, sats_rate, logo_url, theme_color)
VALUES ('ark', 'Ark Systems', 'ark', NULL, '529994918221', '123456789012345678', 'BBVA', 'Ark Systems', 'https://btcpay.arksystems.ai', 2.5, '/favicon.svg', '#FF6B1A');

-- Superadmin Ark Systems (password: admin123)
INSERT OR IGNORE INTO tenant_users (id, tenant_id, email, password_hash, role)
VALUES ('user-ark', 'ark', 'admin@arksystems.ai', '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9', 'superadmin');

-- Producto base Ark Systems
INSERT OR IGNORE INTO products (id, tenant_id, name, weight, price, desc, image, badge, stock, active, display_order) VALUES
('kit-landing-express', 'ark', 'Landing Express Kit', 'Digital', 990, 'Kit de 5 templates en 1 archivo HTML listos para cobrar con Stripe, Mercado Pago y Lightning.', '/images/products/kit.jpg', 'BEST SELLER', 999, 1, 1);

-- Tenant 2: Temozonia (Cliente de Carnes Ahumadas)
INSERT OR IGNORE INTO tenants (id, name, slug, domain, whatsapp, clabe, bank, clabe_holder, btcpay_pos_url, sats_rate, logo_url, theme_color)
VALUES ('temozonia', 'Temozonia Carnes Ahumadas', 'temozonia', 'temozonia.substrateholdingsai.workers.dev', '529994918221', '123456789012345678', 'BBVA', 'Temozonia Carnes Ahumadas', 'https://btcpay.temozonia.com/pos', 2.5, '/images/logo.png', '#b45309');

-- Admin Temozonia (password: admin123)
INSERT OR IGNORE INTO tenant_users (id, tenant_id, email, password_hash, role)
VALUES ('user-temozonia', 'temozonia', 'admin@temozonia.com', '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9', 'owner');

-- Productos Temozonia
INSERT OR IGNORE INTO products (id, tenant_id, name, weight, price, desc, image, badge, stock, active, display_order) VALUES
('carne','temozonia','Carne Ahumada','1kg',380,'Brisquet ahumado 8h con mezquite.','/images/products/carne-ahumada.jpg','MÁS VENDIDA',12,1,1),
('costillas','temozonia','Costillas BBQ','1kg',420,'Costillas de cerdo ahumadas 6h.','/images/products/costillas-bbq.jpg','NUEVO',8,1,2),
('chorizo','temozonia','Chorizo Artesanal','500g',180,'Chorizo estilo oaxaqueño.','/images/products/chorizo.jpg',NULL,20,1,3),
('salchichon','temozonia','Salchichón Ibérico','300g',250,'Curado 90 días en bodega natural.','/images/products/salchichon.jpg','PREMIUM',15,1,4),
('pack-degustacion','temozonia','Pack Degustación','2.3kg',980,'La experiencia completa.','/images/products/pack-degustacion.jpg','MEJOR VALOR',5,1,5);
