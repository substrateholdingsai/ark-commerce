-- Seed: productos base MAREA (prendas configurables) con metadata
-- Ejecutar tras schema_designs.sql

INSERT INTO products (id, tenant_id, name, weight, price, desc, image, badge, stock, active, display_order, metadata)
VALUES (
  'MAREA-TEE-64000', 'marea', 'Playera Marea Clásica', '153g', 299.00,
  'Playera Gildan Softstyle 64000, 100% algodón peinado 153g. Estampado full-color. Diseño original Marea.',
  '/images/marea/tee-64000.png', NULL, 100, 1, 1,
  '{"supplier":"cotexsa","supplier_sku":"64000","supplier_brand":"Gildan","supplier_url":"https://cotexsa.com.mx/64000-PLAY-GILDAN-SOFTSTYLE-MC-CR-_46","garment_type":"playera","composition":"100% algodón peinado","weight_gsm":153,"tallas":["S","M","L","XL","XXL"],"colores":["Blanco","Cereza","Morado","Rey","Carbón","Marino","Jaspe Obscuro","Jaspe","Negro"],"base_cost":{"blanco_sxl":43.60,"blanco_xxl":55.30,"color_sxl":54.95,"color_xxl":66.00},"tecnicas_soportadas":["DTG","DTF","Serigrafía","Transfer","Vinil textil","Bordado"],"print_cost":{"DTG":120.00,"DTF":110.00,"Serigrafía":80.00,"Transfer":90.00,"Vinil textil":80.00,"Bordado":150.00},"tecnicas_recomendadas":["DTG","DTF"],"margin_pct":60,"surcharge_xxl":0}'
)
ON CONFLICT(id) DO UPDATE SET price=excluded.price, active=1, metadata=excluded.metadata;

INSERT INTO products (id, tenant_id, name, weight, price, desc, image, badge, stock, active, display_order, metadata)
VALUES (
  'MAREA-DF-950C', 'marea', 'Playera Marea Dry Fit', '150g', 339.00,
  'Playera deportiva Dry Fit Playerytees 950C, 100% poliéster 150g. Secado rápido, colores fluor. Sublimación full-color.',
  '/images/marea/dryfit-950c.png', NULL, 100, 1, 2,
  '{"supplier":"cotexsa","supplier_sku":"950C","supplier_brand":"Playerytees","supplier_url":"https://cotexsa.com.mx/PLAY-PLAYERYTEES-DEP-CAB-DRY-FIT-950-C-100-POL-_64","garment_type":"dryfit","composition":"100% poliéster","weight_gsm":150,"tallas":["S","M","L","XL","XXL"],"colores":["Blanco","Verde","Coral","Verde Irlandés","Rojo","Fiusha F","Rey","Carbón","Marino","Amarillo","Azul Eléctrico","Lima Fluor","Naranja Fluor","Negro"],"base_cost":{"blanco_sxl":89.00,"blanco_xxl":103.00,"color_sxl":96.00,"color_xxl":112.00},"tecnicas_soportadas":["Sublimación","DTF","Serigrafía","Transfer","Vinil textil","Bordado"],"print_cost":{"Sublimación":110.00,"DTF":110.00,"Serigrafía":80.00,"Transfer":90.00,"Vinil textil":80.00,"Bordado":150.00},"tecnicas_recomendadas":["Sublimación","DTF"],"margin_pct":60,"surcharge_xxl":0}'
)
ON CONFLICT(id) DO UPDATE SET price=excluded.price, active=1, metadata=excluded.metadata;

INSERT INTO products (id, tenant_id, name, weight, price, desc, image, badge, stock, active, display_order, metadata)
VALUES (
  'MAREA-POLO-700D', 'marea', 'Polo Marea Premier', '230g', 449.00,
  'Polo Playerytees 700D Premier, 50% poliéster / 50% algodón, 230g. Manga corta deportiva, ideal para bordado premium.',
  '/images/marea/polo-700d.png', NULL, 100, 1, 3,
  '{"supplier":"cotexsa","supplier_sku":"700D","supplier_brand":"Playerytees","supplier_url":"https://cotexsa.com.mx/PLAY-PLAYERYTEES-DEP-DAMA-700-D-PREMIER-5050-_54","garment_type":"polo","composition":"50% poliéster / 50% algodón","weight_gsm":230,"tallas":["S","M","L","XL","XXL"],"colores":["Blanco","Rojo","Morado","Manzana","Aqua","Rey","Marino","Jaspe","Negro"],"base_cost":{"blanco_sxl":112.00,"blanco_xxl":122.00,"color_sxl":126.00,"color_xxl":140.00},"tecnicas_soportadas":["Bordado","DTG","DTF","Serigrafía","Transfer","Vinil textil"],"print_cost":{"Bordado":150.00,"DTG":120.00,"DTF":110.00,"Serigrafía":80.00,"Transfer":90.00,"Vinil textil":80.00},"tecnicas_recomendadas":["Bordado","DTG"],"margin_pct":60,"surcharge_xxl":0}'
)
ON CONFLICT(id) DO UPDATE SET price=excluded.price, active=1, metadata=excluded.metadata;

INSERT INTO products (id, tenant_id, name, weight, price, desc, image, badge, stock, active, display_order, metadata)
VALUES (
  'MAREA-HOODIE-18600', 'marea', 'Sudadera Marea con Capucha', '271g', 599.00,
  'Sudadera Gildan 18600 con capucha y cremallera, 50/50, 271 g/m². Unisex. Ideal para bordado o DTF.',
  '/images/marea/hoodie-18600.png', NULL, 100, 1, 4,
  '{"supplier":"cotexsa","supplier_sku":"18600","supplier_brand":"Gildan","supplier_url":"https://cotexsa.com.mx/18600_SUDADERA_CCREMALLERA_Y_CAPUCHA_97","garment_type":"sudadera","composition":"50% poliéster / 50% algodón","weight_gsm":271,"tallas":["S","M","L","XL","XXL"],"colores":["Blanco","Rojo","Marrón","Morado","Rey","Marino","Jaspe Obscuro","Jaspe","Verde Fluor","Negro"],"base_cost":{"blanco_sxl":174.15,"blanco_xxl":208.73,"color_sxl":200.15,"color_xxl":235.20},"tecnicas_soportadas":["Bordado","DTF","Serigrafía","Transfer","Vinil textil"],"print_cost":{"Bordado":150.00,"DTF":110.00,"Serigrafía":90.00,"Transfer":90.00,"Vinil textil":80.00},"tecnicas_recomendadas":["Bordado","DTF"],"margin_pct":50,"surcharge_xxl":0,"notes":"Artículo no de línea en sucursal — puede generar costo de traslado."}'
)
ON CONFLICT(id) DO UPDATE SET price=excluded.price, active=1, metadata=excluded.metadata;

INSERT INTO products (id, tenant_id, name, weight, price, desc, image, badge, stock, active, display_order, metadata)
VALUES (
  'MAREA-GORRA-G011', 'marea', 'Gorra Marea Dry Fit', 'Unitalle', 299.00,
  'Gorra deportiva dry fit Club Cabo G011, 100% poliéster, unitalle. Diseño estampado en frente.',
  '/images/marea/gorra-g011.png', NULL, 100, 1, 5,
  '{"supplier":"cotexsa","supplier_sku":"G011","supplier_brand":"Club Cabo","supplier_url":"https://cotexsa.com.mx/11-GORRA-CLUB-CABO-DEPORTIVA-DRY-FIT-_73","garment_type":"gorra","composition":"100% poliéster dry fit","weight_gsm":null,"tallas":["Unitalle"],"colores":["Blanco","Verde","Rojo","Rey","Marino","Negro"],"base_cost":{"unitalle":42.40},"tecnicas_soportadas":["DTF","Bordado","Sublimación","Serigrafía","Transfer","Vinil textil"],"print_cost":{"DTF":110.00,"Bordado":150.00,"Sublimación":100.00,"Serigrafía":70.00,"Transfer":90.00,"Vinil textil":80.00},"tecnicas_recomendadas":["DTF","Bordado"],"margin_pct":100,"surcharge_xxl":0}'
)
ON CONFLICT(id) DO UPDATE SET price=excluded.price, active=1, metadata=excluded.metadata;
