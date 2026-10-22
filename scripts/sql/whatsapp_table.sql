CREATE TABLE IF NOT EXISTS whatsapp_messages (
  id TEXT PRIMARY KEY,
  tenant_id TEXT,
  phone TEXT NOT NULL,
  sender_name TEXT,
  direction TEXT NOT NULL, -- 'inbound' | 'outbound'
  message_text TEXT NOT NULL,
  matched_tenant TEXT,
  matched_service TEXT,
  estimated_price REAL,
  status TEXT DEFAULT 'processed',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_wa_phone ON whatsapp_messages(phone);
CREATE INDEX IF NOT EXISTS idx_wa_created ON whatsapp_messages(created_at);
