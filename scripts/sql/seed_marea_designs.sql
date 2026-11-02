-- Seed: diseños MAREA (estampas aplicables a prendas)

INSERT INTO designs (id, tenant_id, slug, name, image_url, technique_recommended, active, display_order)
VALUES ('design-ola-nocturna','marea','ola-nocturna','Ola Nocturna','/images/marea/designs/ola-nocturna.png','DTF',1,1)
ON CONFLICT(tenant_id, slug) DO UPDATE SET name=excluded.name, image_url=excluded.image_url, technique_recommended=excluded.technique_recommended, active=1;

INSERT INTO designs (id, tenant_id, slug, name, image_url, technique_recommended, active, display_order)
VALUES ('design-sol-de-tulum','marea','sol-de-tulum','Sol de Tulum','/images/marea/designs/sol-de-tulum.png','DTF',1,2)
ON CONFLICT(tenant_id, slug) DO UPDATE SET name=excluded.name, image_url=excluded.image_url, technique_recommended=excluded.technique_recommended, active=1;

INSERT INTO designs (id, tenant_id, slug, name, image_url, technique_recommended, active, display_order)
VALUES ('design-espiritu-selva','marea','espiritu-selva','Espíritu Selva','/images/marea/designs/espiritu-selva.png','DTG',1,3)
ON CONFLICT(tenant_id, slug) DO UPDATE SET name=excluded.name, image_url=excluded.image_url, technique_recommended=excluded.technique_recommended, active=1;

INSERT INTO designs (id, tenant_id, slug, name, image_url, technique_recommended, active, display_order)
VALUES ('design-marea-tricolor','marea','marea-tricolor','Marea Tricolor','/images/marea/designs/marea-tricolor.png','DTF',1,4)
ON CONFLICT(tenant_id, slug) DO UPDATE SET name=excluded.name, image_url=excluded.image_url, technique_recommended=excluded.technique_recommended, active=1;

INSERT INTO designs (id, tenant_id, slug, name, image_url, technique_recommended, active, display_order)
VALUES ('design-coral-vivo','marea','coral-vivo','Coral Vivo','/images/marea/designs/coral-vivo.png','DTG',1,5)
ON CONFLICT(tenant_id, slug) DO UPDATE SET name=excluded.name, image_url=excluded.image_url, technique_recommended=excluded.technique_recommended, active=1;

INSERT INTO designs (id, tenant_id, slug, name, image_url, technique_recommended, active, display_order)
VALUES ('design-mango-beach','marea','mango-beach','MANGO Beach','/images/marea/designs/mango-beach.png','DTF',1,6)
ON CONFLICT(tenant_id, slug) DO UPDATE SET name=excluded.name, image_url=excluded.image_url, technique_recommended=excluded.technique_recommended, active=1;

INSERT INTO designs (id, tenant_id, slug, name, image_url, technique_recommended, active, display_order)
VALUES ('design-mascara-marina','marea','mascara-marina','Máscara Marina','/images/marea/designs/mascara-marina.png','DTG',1,7)
ON CONFLICT(tenant_id, slug) DO UPDATE SET name=excluded.name, image_url=excluded.image_url, technique_recommended=excluded.technique_recommended, active=1;

INSERT INTO designs (id, tenant_id, slug, name, image_url, technique_recommended, active, display_order)
VALUES ('design-ola-espuma','marea','ola-espuma','Ola Espuma','/images/marea/designs/ola-espuma.png','DTF',1,8)
ON CONFLICT(tenant_id, slug) DO UPDATE SET name=excluded.name, image_url=excluded.image_url, technique_recommended=excluded.technique_recommended, active=1;
