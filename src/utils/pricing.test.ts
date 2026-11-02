import { describe, it, expect } from 'vitest';
import { calcularPrecio } from './pricing';

const baseProduct = {
  metadata: {
    base_cost: { blanco_sxl: 43.6, blanco_xxl: 55.3, color_sxl: 54.95, color_xxl: 66.0, unitalle: 42.4 },
    print_cost: { DTG: 120, DTF: 110, Serigrafía: 80, Transfer: 90, 'Vinil textil': 80, Bordado: 150, Sublimación: 110 },
    tallas: ['S', 'M', 'L', 'XL', 'XXL'],
    colores: ['Blanco', 'Negro'],
    tecnicas_soportadas: ['DTG', 'DTF', 'Serigrafía', 'Transfer', 'Vinil textil', 'Bordado'],
    margin_pct: 60,
  },
};

describe('calcularPrecio', () => {
  it('técnica inválida => invalid', () => {
    const r = calcularPrecio({ product: baseProduct, talla: 'M', color: 'blanco', tecnica: 'Sublimación' });
    expect(r.valid).toBe(false);
  });

  it('talla inválida => invalid', () => {
    const r = calcularPrecio({ product: baseProduct, talla: 'XXXL', color: 'blanco', tecnica: 'DTG' });
    expect(r.valid).toBe(false);
  });

  it('blanco S vs color M', () => {
    const b = calcularPrecio({ product: baseProduct, talla: 'S', color: 'blanco', tecnica: 'DTG' });
    const c = calcularPrecio({ product: baseProduct, talla: 'M', color: 'Negro', tecnica: 'DTG' });
    expect(b.valid).toBe(true);
    expect(c.valid).toBe(true);
    expect(b.base).toBe(43.6);
    expect(c.base).toBe(54.95);
  });

  it('XXL usa costo xxl', () => {
    const r = calcularPrecio({ product: baseProduct, talla: 'XXL', color: 'blanco', tecnica: 'DTG' });
    expect(r.base).toBe(55.3);
  });

  it('unitalle (gorra)', () => {
    const gorra = { metadata: { ...baseProduct.metadata, tallas: ['Unitalle'], base_cost: { unitalle: 42.4 }, tecnicas_soportadas: ['DTF'] } };
    const r = calcularPrecio({ product: gorra, talla: 'Unitalle', color: 'Blanco', tecnica: 'DTF' });
    expect(r.valid).toBe(true);
    expect(r.base).toBe(42.4);
  });

  it('total = base + print', () => {
    const r = calcularPrecio({ product: baseProduct, talla: 'S', color: 'blanco', tecnica: 'DTG' });
    expect(r.total).toBe(43.6 + 120);
  });

  it('totalConIva incluye margen e IVA', () => {
    const r = calcularPrecio({ product: baseProduct, talla: 'S', color: 'blanco', tecnica: 'DTG' });
    expect(r.totalConIva).toBeGreaterThan(r.total);
  });
});
