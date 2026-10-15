-- ============================================================
-- SEED SCRIPT — Sprint 2
-- Pobla la tabla `products` con datos de prueba realistas.
-- Idempotente: seguro para ejecutar múltiples veces.
-- Compatible con el esquema definido en schema.sql.
-- ============================================================

-- Limpiar datos previos (opcional, descomenta si quieres reset total)
-- DELETE FROM order_items;
-- DELETE FROM orders;
-- DELETE FROM products;

INSERT OR REPLACE INTO products (
  id, name, weight, price, "desc", image, badge, stock, active, display_order
)
VALUES
  -- Cafés
  ('CAF-001', 'Café de Olla 250g', '250g', 189.00, 'Café artesanal de Veracruz con piloncillo y canela. Molido fino.', '/images/products/cafe-olla-250g.webp', 'TRADICIONAL', 10, 1, 1),
  ('CAF-002', 'Café de Olla 500g', '500g', 349.00, 'Café artesanal de Veracruz con piloncillo y canela. Molido fino.', '/images/products/cafe-olla-500g.webp', 'TRADICIONAL', 10, 1, 2),
  ('CAF-003', 'Café Chiapas Orgánico 250g', '250g', 219.00, 'Café de altura 100% arábica, tostado medio. Certificación orgánica.', '/images/products/cafe-chiapas-250g.webp', 'ORGÁNICO', 10, 1, 3),
  ('CAF-004', 'Café Chiapas Orgánico 1kg', '1kg', 749.00, 'Café de altura 100% arábica, tostado medio. Certificación orgánica.', '/images/products/cafe-chiapas-1kg.webp', 'ORGÁNICO', 10, 1, 4),

  -- Chocolates
  ('CHO-001', 'Chocolate Oaxaqueño 500g', '500g', 159.00, 'Chocolate de metate tradicional. Tablilla para preparar a la taza.', '/images/products/chocolate-oaxaca-500g.webp', 'TRADICIONAL', 10, 1, 5),
  ('CHO-002', 'Chocolate Amargo 70% 200g', '200g', 129.00, 'Chocolate fino de aroma, cacao criollo de Tabasco. Sin azúcar añadida.', '/images/products/chocolate-amargo-200g.webp', '70% CACAO', 10, 1, 6),

  -- Tés e infusiones
  ('TE-001', 'Té de Jamaica Orgánica 100g', '100g', 79.00, 'Flor de jamaica deshidratada de Guerrero. Ideal para agua fresca.', '/images/products/te-jamaica-100g.webp', 'ORGÁNICO', 10, 1, 7),
  ('TE-002', 'Infusión de Manzanilla 50g', '50g', 69.00, 'Manzanilla entera de Michoacán. Relajante y digestiva.', '/images/products/te-manzanilla-50g.webp', NULL, 10, 1, 8),

  -- Mermeladas y mieles
  ('MIE-001', 'Miel de Abeja Multifloral 500ml', '500ml', 199.00, 'Miel cruda sin pasteurizar de apiarios de Yucatán.', '/images/products/miel-multifloral-500ml.webp', 'CRUDA', 10, 1, 9),
  ('MER-001', 'Mermelada de Frutos Rojos 350g', '350g', 119.00, 'Mermelada artesanal con trozos de fruta. Sin conservadores.', '/images/products/mermelada-frutos-rojos-350g.webp', 'ARTESANAL', 10, 1, 10),

  -- Producto inactivo (para probar filtros)
  ('CAF-999', 'Café Edición Limitada (Agotado)', '250g', 499.00, 'Edición especial de temporada. Ya no disponible.', '/images/products/cafe-limitado.webp', 'AGOTADO', 0, 0, 11);
