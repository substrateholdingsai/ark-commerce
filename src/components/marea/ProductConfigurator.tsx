import { useEffect, useMemo, useState } from 'react';
import { useCartStore } from '@/stores/cart';
import { calcularPrecio } from '@/utils/pricing';
import type { Product } from '@/types/product';

interface Design {
  id: string;
  slug: string;
  name: string;
  image_url: string;
  technique_recommended: string;
}

interface MareaMetadata {
  colores: string[];
  tallas: string[];
  tecnicas_soportadas: string[];
  tecnicas_recomendadas?: string[];
  base_cost: Record<string, number>;
  print_cost: Record<string, number>;
  margin_pct?: number;
}

export default function ProductConfigurator({ tenant = 'marea' }: { tenant?: string }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [designs, setDesigns] = useState<Design[]>([]);
  const [productId, setProductId] = useState<string>('');
  const [color, setColor] = useState<string>('');
  const [talla, setTalla] = useState<string>('');
  const [tecnica, setTecnica] = useState<string>('');
  const [designId, setDesignId] = useState<string>('');

  useEffect(() => {
    fetch(`/api/products?tenant=${tenant}`)
      .then((r) => r.json())
      .then((d: any) => {
        const list = Array.isArray(d?.data) ? d.data : [];
        setProducts(list);
        if (list.length) setProductId(list[0].id);
      })
      .catch(() => {});
    fetch(`/api/designs?tenant=${tenant}`)
      .then((r) => r.json())
      .then((d: any) => {
        const list = Array.isArray(d?.data) ? d.data : [];
        setDesigns(list);
      })
      .catch(() => {});
  }, [tenant]);

  const product = products.find((p) => p.id === productId);
  const md = (product?.metadata || {}) as unknown as MareaMetadata;

  const tecnicas = md.tecnicas_soportadas || [];
  const tallas = md.tallas || [];
  const colores = md.colores || [];

  useEffect(() => {
    if (colores.length && !colores.includes(color)) setColor(colores[0]);
  }, [colores.join('|')]);
  useEffect(() => {
    if (tallas.length && !tallas.includes(talla)) {
      const nonUni = tallas.find((t) => t.toLowerCase() !== 'unitalle');
      setTalla(tallas.includes('Unitalle') && tallas.length === 1 ? tallas[0] : (nonUni || tallas[0]));
    }
  }, [tallas.join('|')]);
  useEffect(() => {
    if (tecnicas.length && !tecnicas.includes(tecnica)) {
      setTecnica(md.tecnicas_recomendadas?.[0] || tecnicas[0]);
    }
  }, [tecnicas.join('|')]);

  const breakdown = useMemo(() => {
    if (!product) return null;
    return calcularPrecio({ product, talla, color, tecnica });
  }, [product, talla, color, tecnica]);

  const handleAdd = () => {
    if (!product || !breakdown?.valid) return;
    useCartStore.getState().addItemConfigured({
      product,
      design_id: designId,
      talla,
      color,
      tecnica,
      precio_calculado: breakdown.totalConIva,
      breakdown,
      qty: 1,
    });
  };

  const showTalla = !(tallas.length === 1 && tallas[0].toLowerCase() === 'unitalle');

  return (
    <div className="rounded-2xl border border-gray-200 p-4 space-y-4">
      <div>
        <label className="text-xs font-bold uppercase">Prenda</label>
        <select value={productId} onChange={(e) => setProductId(e.target.value)} className="w-full rounded border p-2">
          {products.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="text-xs font-bold uppercase">Color</label>
        <select value={color} onChange={(e) => setColor(e.target.value)} className="w-full rounded border p-2">
          {colores.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {showTalla && (
        <div>
          <label className="text-xs font-bold uppercase">Talla</label>
          <select value={talla} onChange={(e) => setTalla(e.target.value)} className="w-full rounded border p-2">
            {tallas.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
      )}

      <div>
        <label className="text-xs font-bold uppercase">Técnica</label>
        <select value={tecnica} onChange={(e) => setTecnica(e.target.value)} className="w-full rounded border p-2">
          {tecnicas.map((t) => (
            <option key={t} value={t}>
              {md.tecnicas_recomendadas?.includes(t) ? `★ ${t}` : t}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="text-xs font-bold uppercase">Diseño</label>
        <select value={designId} onChange={(e) => setDesignId(e.target.value)} className="w-full rounded border p-2">
          <option value="">Sin diseño</option>
          {designs.map((d) => (
            <option key={d.id} value={d.id}>{d.name}</option>
          ))}
        </select>
      </div>

      {breakdown && (
        <div className="rounded bg-gray-50 p-3 text-sm">
          {breakdown.valid ? (
            <>
              <div>Base: ${breakdown.base}</div>
              <div>Impresión: ${breakdown.print}</div>
              <div className="font-bold">Total: ${breakdown.total} (IVA incl. ${breakdown.totalConIva})</div>
            </>
          ) : (
            <div className="text-red-600">{breakdown.error}</div>
          )}
        </div>
      )}

      <button
        onClick={handleAdd}
        disabled={!breakdown?.valid}
        className="w-full rounded-full bg-black py-3 text-white disabled:opacity-40"
      >
        Agregar al carrito
      </button>
    </div>
  );
}
