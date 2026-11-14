-- ============================================================================
-- MIGRACIÓN: AUDIT LOG DE OPERADOR STAYPUFT (Ark Commerce Connector)
-- Número de migración: 10 (despues de schema.sql, schema_auth.sql,
-- schema_auth2.sql, schema_auth3.sql, schema_shipping.sql, whatsapp_table.sql,
-- schema_designs.sql, baakal.sql, marea.sql)
--
-- Tabla inmutable de auditoría: cada llamada del operador StayPuft a los
-- endpoints internos (/api/internal/*) queda registrada con timestamp,
-- operador, método, ruta, tenant, objetivo y resultado.
-- Sin PII, sin contraseñas, sin claves bancarias completas, sin datos de pago.
-- ============================================================================

CREATE TABLE IF NOT EXISTS staypuft_audit_log (
  id TEXT PRIMARY KEY,
  operator TEXT NOT NULL DEFAULT 'staypuft',
  method TEXT NOT NULL,
  path TEXT NOT NULL,
  tenant_slug TEXT,
  target_type TEXT,
  target_id TEXT,
  status_code INTEGER NOT NULL,
  result TEXT NOT NULL CHECK (result IN ('ok', 'error')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_staypuft_audit_created ON staypuft_audit_log(created_at);
CREATE INDEX IF NOT EXISTS idx_staypuft_audit_tenant ON staypuft_audit_log(tenant_slug);
CREATE INDEX IF NOT EXISTS idx_staypuft_audit_target ON staypuft_audit_log(target_type, target_id);
