export interface MareaMetadata {
  base_cost: Record<string, number>;
  print_cost: Record<string, number>;
  tallas: string[];
  colores: string[];
  tecnicas_soportadas: string[];
  tecnicas_recomendadas?: string[];
  margin_pct?: number;
  surcharge_xxl?: number;
}

export interface PriceInput {
  product: { metadata?: MareaMetadata | Record<string, unknown> | null };
  talla: string;
  color: string;
  tecnica: string;
}

export interface PriceBreakdown {
  base: number;
  print: number;
  total: number;
  totalConIva: number;
  valid: boolean;
  error?: string;
}

function asMetadata(m: unknown): MareaMetadata | null {
  if (!m || typeof m !== 'object') return null;
  const md = m as Record<string, unknown>;
  if (!md.base_cost || !md.print_cost || !Array.isArray(md.tallas) || !Array.isArray(md.tecnicas_soportadas)) return null;
  return md as unknown as MareaMetadata;
}

function colorBucket(color: string): 'blanco' | 'color' {
  const c = (color || '').trim().toLowerCase();
  if (c === 'blanco' || c === 'white' || c.includes('blanco')) return 'blanco';
  return 'color';
}

function sizeBucket(talla: string): 'sxl' | 'xxl' | 'unitalle' {
  const t = (talla || '').trim().toUpperCase();
  if (t === 'XXL') return 'xxl';
  if (t === 'UNITALLE' || t === 'UNISIZE') return 'unitalle';
  return 'sxl';
}

export function calcularPrecio(input: PriceInput): PriceBreakdown {
  const md = asMetadata(input.product?.metadata);
  if (!md) {
    return { base: 0, print: 0, total: 0, totalConIva: 0, valid: false, error: 'Producto sin metadata válida' };
  }

  const tecnica = (input.tecnica || '').trim();
  if (!md.tecnicas_soportadas.includes(tecnica)) {
    return { base: 0, print: 0, total: 0, totalConIva: 0, valid: false, error: `Técnica no soportada: ${tecnica}` };
  }

  const talla = (input.talla || '').trim();
  if (!md.tallas.includes(talla) && !md.tallas.map((t) => t.toUpperCase()).includes(talla.toUpperCase())) {
    return { base: 0, print: 0, total: 0, totalConIva: 0, valid: false, error: `Talla no disponible: ${talla}` };
  }

  const cb = colorBucket(input.color);
  const sb = sizeBucket(talla);
  let baseKey: string;
  if (sb === 'unitalle') baseKey = 'unitalle';
  else baseKey = `${cb}_${sb}`;

  const base = md.base_cost[baseKey];
  if (typeof base !== 'number') {
    return { base: 0, print: 0, total: 0, totalConIva: 0, valid: false, error: `Costo base no definido para ${baseKey}` };
  }

  const print = md.print_cost[tecnica];
  if (typeof print !== 'number') {
    return { base: 0, print: 0, total: 0, totalConIva: 0, valid: false, error: `Costo de impresión no definido para ${tecnica}` };
  }

  const total = Math.round((base + print) * 100) / 100;
  const margin = typeof md.margin_pct === 'number' ? md.margin_pct : 0;
  const pvpSinIva = Math.ceil((total * (1 + margin / 100)) / 10) * 10;
  const totalConIva = Math.round(pvpSinIva * 1.16 * 100) / 100;

  return { base, print, total, totalConIva, valid: true };
}
