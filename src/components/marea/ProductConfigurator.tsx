import { useEffect, useMemo, useState } from 'react';
import { useCartStore } from '@/stores/cart';
import { calcularPrecio } from '@/utils/pricing';
import type { Product } from '@/types/product';
import { FALLBACK_DESIGNS, type Design } from './DesignGallery';

interface MareaMetadata {
  supplier?: string;
  supplier_sku?: string;
  supplier_brand?: string;
  garment_type?: string;
  composition?: string;
  weight_gsm?: number | null;
  colores: string[];
  tallas: string[];
  tecnicas_soportadas: string[];
  tecnicas_recomendadas?: string[];
  base_cost: Record<string, number>;
  print_cost: Record<string, number>;
  margin_pct?: number;
  surcharge_xxl?: number;
}

export const FALLBACK_PRODUCTS: Product[] = [
  {
    id: 'MAREA-TEE-64000',
    name: 'Playera Skin Lab Clásica',
    weight: '153g',
    price: 299.00,
    desc: 'Playera Gildan Softstyle 64000, 100% algodón peinado 153g. Estampado full-color. Tacto ultrasuave.',
    image: '/images/marea/tee-64000.png',
    stock: 100,
    metadata: {
      supplier: 'cotexsa',
      supplier_sku: '64000',
      supplier_brand: 'Gildan',
      garment_type: 'playera',
      composition: '100% algodón peinado',
      weight_gsm: 153,
      tallas: ['S', 'M', 'L', 'XL', 'XXL'],
      colores: ['Blanco', 'Cereza', 'Morado', 'Rey', 'Carbón', 'Marino', 'Jaspe Obscuro', 'Jaspe', 'Negro'],
      base_cost: { blanco_sxl: 43.60, blanco_xxl: 55.30, color_sxl: 54.95, color_xxl: 66.00 },
      tecnicas_soportadas: ['DTG', 'DTF', 'Serigrafía', 'Transfer', 'Vinil textil', 'Bordado'],
      print_cost: { DTG: 120.00, DTF: 110.00, Serigrafía: 80.00, Transfer: 90.00, 'Vinil textil': 80.00, Bordado: 150.00 },
      tecnicas_recomendadas: ['DTG', 'DTF'],
      margin_pct: 60,
      surcharge_xxl: 0
    } as any
  },
  {
    id: 'MAREA-DF-950C',
    name: 'Playera Skin Lab Dry Fit',
    weight: '150g',
    price: 339.00,
    desc: 'Playera deportiva Dry Fit Playerytees 950C, 100% poliéster 150g. Secado rápido, colores flúor. Sublimación full-color.',
    image: '/images/marea/dryfit-950c.png',
    stock: 100,
    metadata: {
      supplier: 'cotexsa',
      supplier_sku: '950C',
      supplier_brand: 'Playerytees',
      garment_type: 'dryfit',
      composition: '100% poliéster',
      weight_gsm: 150,
      tallas: ['S', 'M', 'L', 'XL', 'XXL'],
      colores: ['Blanco', 'Verde', 'Coral', 'Verde Irlandés', 'Rojo', 'Fiusha F', 'Rey', 'Carbón', 'Marino', 'Amarillo', 'Azul Eléctrico', 'Lima Fluor', 'Naranja Fluor', 'Negro'],
      base_cost: { blanco_sxl: 89.00, blanco_xxl: 103.00, color_sxl: 96.00, color_xxl: 112.00 },
      tecnicas_soportadas: ['Sublimación', 'DTF', 'Serigrafía', 'Transfer', 'Vinil textil', 'Bordado'],
      print_cost: { Sublimación: 110.00, DTF: 110.00, Serigrafía: 80.00, Transfer: 90.00, 'Vinil textil': 80.00, Bordado: 150.00 },
      tecnicas_recomendadas: ['Sublimación', 'DTF'],
      margin_pct: 60,
      surcharge_xxl: 0
    } as any
  },
  {
    id: 'MAREA-POLO-700D',
    name: 'Polo Skin Lab Premier',
    weight: '230g',
    price: 449.00,
    desc: 'Polo Playerytees 700D Premier, 50% poliéster / 50% algodón, 230g. Manga corta deportiva, ideal para bordado premium.',
    image: '/images/marea/polo-700d.png',
    stock: 100,
    metadata: {
      supplier: 'cotexsa',
      supplier_sku: '700D',
      supplier_brand: 'Playerytees',
      garment_type: 'polo',
      composition: '50% poliéster / 50% algodón',
      weight_gsm: 230,
      tallas: ['S', 'M', 'L', 'XL', 'XXL'],
      colores: ['Blanco', 'Rojo', 'Morado', 'Manzana', 'Aqua', 'Rey', 'Marino', 'Jaspe', 'Negro'],
      base_cost: { blanco_sxl: 112.00, blanco_xxl: 122.00, color_sxl: 126.00, color_xxl: 140.00 },
      tecnicas_soportadas: ['Bordado', 'DTG', 'DTF', 'Serigrafía', 'Transfer', 'Vinil textil'],
      print_cost: { Bordado: 150.00, DTG: 120.00, DTF: 110.00, Serigrafía: 80.00, Transfer: 90.00, 'Vinil textil': 80.00 },
      tecnicas_recomendadas: ['Bordado', 'DTG'],
      margin_pct: 60,
      surcharge_xxl: 0
    } as any
  },
  {
    id: 'MAREA-HOODIE-18600',
    name: 'Sudadera Skin Lab con Capucha',
    weight: '271g',
    price: 599.00,
    desc: 'Sudadera Gildan 18600 con capucha y cremallera, 50/50, 271 g/m². Unisex. Ideal para bordado o DTF.',
    image: '/images/marea/hoodie-18600.png',
    stock: 100,
    metadata: {
      supplier: 'cotexsa',
      supplier_sku: '18600',
      supplier_brand: 'Gildan',
      garment_type: 'sudadera',
      composition: '50% poliéster / 50% algodón',
      weight_gsm: 271,
      tallas: ['S', 'M', 'L', 'XL', 'XXL'],
      colores: ['Blanco', 'Rojo', 'Marrón', 'Morado', 'Rey', 'Marino', 'Jaspe Obscuro', 'Jaspe', 'Verde Fluor', 'Negro'],
      base_cost: { blanco_sxl: 174.15, blanco_xxl: 208.73, color_sxl: 200.15, color_xxl: 235.20 },
      tecnicas_soportadas: ['Bordado', 'DTF', 'Serigrafía', 'Transfer', 'Vinil textil'],
      print_cost: { Bordado: 150.00, DTF: 110.00, Serigrafía: 90.00, Transfer: 90.00, 'Vinil textil': 80.00 },
      tecnicas_recomendadas: ['Bordado', 'DTF'],
      margin_pct: 50,
      surcharge_xxl: 0
    } as any
  },
  {
    id: 'MAREA-GORRA-G011',
    name: 'Gorra Skin Lab Dry Fit',
    weight: 'Unitalle',
    price: 299.00,
    desc: 'Gorra deportiva dry fit Club Cabo G011, 100% poliéster, unitalle. Frente estructurado.',
    image: '/images/marea/gorra-g011.png',
    stock: 100,
    metadata: {
      supplier: 'cotexsa',
      supplier_sku: 'G011',
      supplier_brand: 'Club Cabo',
      garment_type: 'gorra',
      composition: '100% poliéster dry fit',
      weight_gsm: null,
      tallas: ['Unitalle'],
      colores: ['Blanco', 'Verde', 'Rojo', 'Rey', 'Marino', 'Negro'],
      base_cost: { unitalle: 42.40 },
      tecnicas_soportadas: ['DTF', 'Bordado', 'Sublimación', 'Serigrafía', 'Transfer', 'Vinil textil'],
      print_cost: { DTF: 110.00, Bordado: 150.00, Sublimación: 100.00, Serigrafía: 70.00, Transfer: 90.00, 'Vinil textil': 80.00 },
      tecnicas_recomendadas: ['DTF', 'Bordado'],
      margin_pct: 100,
      surcharge_xxl: 0
    } as any
  }
];

const COLOR_MAP: Record<string, string> = {
  Blanco: '#FFFFFF',
  Negro: '#18181B',
  Marino: '#1E3A8A',
  Rey: '#2563EB',
  Carbón: '#374151',
  Cereza: '#991B1B',
  Rojo: '#DC2626',
  Coral: '#E94E49',
  Verde: '#16A34A',
  'Verde Irlandés': '#15803D',
  'Verde Fluor': '#22C55E',
  Amarillo: '#FACC15',
  'Lima Fluor': '#A3E635',
  'Naranja Fluor': '#FB923C',
  'Azul Eléctrico': '#0284C7',
  Aqua: '#06B6D4',
  Manzana: '#84CC16',
  Morado: '#7C3AED',
  'Fiusha F': '#E11D48',
  Jaspe: '#94A3B8',
  'Jaspe Obscuro': '#64748B',
  Marrón: '#78350F',
};

export default function ProductConfigurator({ tenant = 'marea' }: { tenant?: string }) {
  const [products, setProducts] = useState<Product[]>(FALLBACK_PRODUCTS);
  const [designs, setDesigns] = useState<Design[]>(FALLBACK_DESIGNS);
  const [productId, setProductId] = useState<string>(FALLBACK_PRODUCTS[0].id);
  const [color, setColor] = useState<string>('Blanco');
  const [talla, setTalla] = useState<string>('L');
  const [tecnica, setTecnica] = useState<string>('DTF');
  const [designId, setDesignId] = useState<string>('design-ola-nocturna');
  const [addedAnimation, setAddedAnimation] = useState<boolean>(false);

  useEffect(() => {
    fetch(`/api/products?tenant=${tenant}`)
      .then((r) => r.json())
      .then((d: any) => {
        const list = Array.isArray(d?.data) && d.data.length > 0 ? d.data : FALLBACK_PRODUCTS;
        setProducts(list);
        if (list.length && !list.some((p: Product) => p.id === productId)) {
          setProductId(list[0].id);
        }
      })
      .catch(() => setProducts(FALLBACK_PRODUCTS));

    fetch(`/api/designs?tenant=${tenant}`)
      .then((r) => r.json())
      .then((d: any) => {
        const list = Array.isArray(d?.data) && d.data.length > 0 ? d.data : FALLBACK_DESIGNS;
        setDesigns(list);
      })
      .catch(() => setDesigns(FALLBACK_DESIGNS));
  }, [tenant]);

  // Escuchar selección desde DesignGallery
  useEffect(() => {
    const handleDesignEvent = (e: any) => {
      if (e.detail?.id) {
        setDesignId(e.detail.id);
        if (e.detail.technique && tecnicas.includes(e.detail.technique)) {
          setTecnica(e.detail.technique);
        }
      }
    };
    window.addEventListener('marea:select-design', handleDesignEvent);
    return () => window.removeEventListener('marea:select-design', handleDesignEvent);
  }, [productId]);

  const product = products.find((p) => p.id === productId) || products[0];
  const md = (product?.metadata || {}) as unknown as MareaMetadata;

  const tecnicas = md.tecnicas_soportadas || ['DTF'];
  const tallas = md.tallas || ['M', 'L'];
  const colores = md.colores || ['Blanco', 'Negro'];

  useEffect(() => {
    if (colores.length && !colores.includes(color)) {
      setColor(colores[0]);
    }
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

  const selectedDesign = designs.find((d) => d.id === designId);

  const handleAdd = () => {
    if (!product || !breakdown?.valid) return;

    const precioFinal = breakdown.totalConIva;
    const configItem = {
      product,
      design_id: designId || undefined,
      talla,
      color,
      tecnica,
      precio_calculado: precioFinal,
      breakdown,
      qty: 1,
    };

    useCartStore.getState().addItemConfigured(configItem);

    // Notificar al storefront de marea.astro
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('marea:cart-add', {
          detail: {
            ...configItem,
            nombre: `${product.name} (${selectedDesign ? selectedDesign.name : 'Personalizada'})`,
            precio: precioFinal,
          },
        })
      );
    }

    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 2000);
  };

  const showTalla = !(tallas.length === 1 && tallas[0].toLowerCase() === 'unitalle');

  return (
    <div className="rounded-3xl border-2 border-marea-arena-b bg-marea-blanco p-6 shadow-ola space-y-6">
      {/* Encabezado */}
      <div className="flex items-center justify-between pb-4 border-b border-marea-arena-b">
        <div>
          <span className="font-mono text-xs uppercase tracking-widest text-marea-teal-dk font-bold">Skin Lab Clothing Club</span>
          <h3 className="font-display font-800 text-2xl text-marea-tinta">Configura tu prenda</h3>
        </div>
        <span className="px-3 py-1 rounded-full bg-marea-teal/15 text-marea-teal-dk font-mono text-xs font-bold border border-marea-teal/30">
          Cotexsa Directo
        </span>
      </div>

      {/* Selector de Prenda Base */}
      <div>
        <label className="block text-xs font-mono font-bold uppercase tracking-wider text-marea-tinta mb-2">
          1. Selecciona la Prenda Base
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {products.map((p) => {
            const isSelected = p.id === productId;
            return (
              <button
                type="button"
                key={p.id}
                onClick={() => setProductId(p.id)}
                className={`flex flex-col items-center text-center p-2.5 rounded-2xl border-2 transition-all ${
                  isSelected
                    ? 'border-marea-teal bg-marea-teal/10 shadow-sm ring-1 ring-marea-teal'
                    : 'border-marea-arena-b bg-marea-arena hover:border-marea-teal/60'
                }`}
              >
                <img src={p.image} alt={p.name} className="w-16 h-16 object-contain mb-1.5" />
                <span className="font-display font-700 text-xs text-marea-tinta leading-tight">{p.name}</span>
                <span className="font-mono text-[11px] font-bold text-marea-teal-dk mt-1">${p.price} MXN</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Previsualización visual de la combinación */}
      <div className="rounded-2xl bg-marea-arena-2 p-4 border border-marea-arena-b flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative w-16 h-16 rounded-xl bg-white border border-marea-arena-b flex items-center justify-center shrink-0 overflow-hidden">
            <img src={product.image} alt={product.name} className="w-full h-full object-contain p-1" />
            {selectedDesign && (
              <img
                src={selectedDesign.image_url}
                alt={selectedDesign.name}
                className="absolute inset-0 m-auto w-7 h-7 object-cover rounded-full border border-white shadow-sm"
                onError={(e) => {
                  const target = e.currentTarget;
                  if (target.src.endsWith('.png')) {
                    target.src = target.src.replace(/\.png$/, '.jpg');
                  }
                }}
              />
            )}
          </div>
          <div className="min-w-0">
            <p className="font-display font-700 text-sm text-marea-tinta truncate">{product.name}</p>
            <p className="font-mono text-xs text-marea-tinta-2">
              Color: <strong className="text-marea-tinta">{color}</strong> · Talla: <strong className="text-marea-tinta">{talla}</strong>
            </p>
            <p className="text-[11px] text-marea-teal-dk font-semibold truncate">
              {selectedDesign ? `Estampa: ${selectedDesign.name}` : 'Sin estampa'} ({tecnica})
            </p>
          </div>
        </div>
        <div className="text-right shrink-0">
          <div className="text-[10px] font-mono uppercase text-marea-tinta-3">Precio final</div>
          <div className="font-mono font-800 text-lg text-marea-coral-dk">
            ${breakdown?.totalConIva || product.price} MXN
          </div>
        </div>
      </div>

      {/* Selector de Color (Swatches interactivos) */}
      <div>
        <label className="block text-xs font-mono font-bold uppercase tracking-wider text-marea-tinta mb-2 flex items-center justify-between">
          <span>2. Color de tela</span>
          <span className="text-marea-teal-dk font-bold">{color}</span>
        </label>
        <div className="flex flex-wrap gap-2">
          {colores.map((c) => {
            const isSelected = c === color;
            const hex = COLOR_MAP[c] || '#CBD5E1';
            return (
              <button
                type="button"
                key={c}
                onClick={() => setColor(c)}
                title={c}
                className={`relative w-8 h-8 rounded-full border-2 transition-transform ${
                  isSelected ? 'scale-110 border-marea-coral ring-2 ring-marea-coral/40' : 'border-gray-300 hover:scale-105'
                }`}
                style={{ backgroundColor: hex }}
              >
                {isSelected && (
                  <span className="absolute inset-0 flex items-center justify-center text-xs font-bold" style={{ color: hex === '#FFFFFF' ? '#000' : '#FFF' }}>
                    ✓
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selector de Tallas */}
      {showTalla && (
        <div>
          <label className="block text-xs font-mono font-bold uppercase tracking-wider text-marea-tinta mb-2">
            3. Talla Mexicana
          </label>
          <div className="flex flex-wrap gap-2">
            {tallas.map((t) => {
              const isSelected = t === talla;
              return (
                <button
                  type="button"
                  key={t}
                  onClick={() => setTalla(t)}
                  className={`min-w-[46px] h-11 px-3 rounded-xl font-mono font-bold text-sm transition-all border-2 ${
                    isSelected
                      ? 'bg-marea-teal text-marea-tinta border-marea-teal shadow-sm'
                      : 'bg-marea-arena border-marea-arena-b text-marea-tinta-2 hover:border-marea-teal'
                  }`}
                >
                  {t}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Selector de Técnica de Impresión */}
      <div>
        <label className="block text-xs font-mono font-bold uppercase tracking-wider text-marea-tinta mb-2">
          4. Técnica de Estampado
        </label>
        <div className="flex flex-wrap gap-2">
          {tecnicas.map((t) => {
            const isSelected = t === tecnica;
            const isRecommended = md.tecnicas_recomendadas?.includes(t);
            return (
              <button
                type="button"
                key={t}
                onClick={() => setTecnica(t)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${
                  isSelected
                    ? 'bg-marea-tinta text-white border-marea-tinta shadow-sm'
                    : 'bg-marea-arena border-marea-arena-b text-marea-tinta-2 hover:border-marea-tinta'
                }`}
              >
                {isRecommended ? `★ ${t}` : t}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selector de Diseño */}
      <div>
        <label className="block text-xs font-mono font-bold uppercase tracking-wider text-marea-tinta mb-2">
          5. Estampa de la Colección
        </label>
        <select
          value={designId}
          onChange={(e) => setDesignId(e.target.value)}
          className="w-full rounded-xl border-2 border-marea-arena-b bg-marea-arena p-2.5 font-body text-sm font-semibold text-marea-tinta focus:outline-none focus:border-marea-teal"
        >
          <option value="">(Sin diseño / Lisa para bordar o rotular)</option>
          {designs.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name} — Recomendado: {d.technique_recommended}
            </option>
          ))}
        </select>
      </div>

      {/* Desglose de Precios */}
      {breakdown && (
        <div className="rounded-2xl bg-marea-arena p-4 border border-marea-arena-b text-xs font-mono space-y-1.5">
          <div className="flex justify-between text-marea-tinta-2">
            <span>Prenda base ({product.weight}):</span>
            <span>${breakdown.base.toFixed(2)} MXN</span>
          </div>
          <div className="flex justify-between text-marea-tinta-2">
            <span>Impresión / Estampado ({tecnica}):</span>
            <span>${breakdown.print.toFixed(2)} MXN</span>
          </div>
          <div className="flex justify-between font-bold text-sm text-marea-tinta pt-2 border-t border-marea-arena-b">
            <span>Total neto con IVA (PVP):</span>
            <span className="text-marea-coral-dk text-base font-800">${breakdown.totalConIva} MXN</span>
          </div>
          {!breakdown.valid && (
            <div className="text-red-600 font-bold mt-1">⚠️ {breakdown.error}</div>
          )}
        </div>
      )}

      {/* Botón de Agregar */}
      <button
        type="button"
        onClick={handleAdd}
        disabled={!breakdown?.valid}
        className={`w-full py-4 rounded-full font-800 text-base transition-all flex items-center justify-center gap-2 shadow-coral ${
          addedAnimation
            ? 'bg-emerald-600 text-white scale-[0.98]'
            : 'bg-marea-coral text-white hover:bg-marea-coral-dk hover:scale-[1.01] active:scale-[0.98]'
        } disabled:opacity-40 disabled:cursor-not-allowed`}
      >
        {addedAnimation ? (
          <>
            <span>¡Agregado a tu carrito!</span> 🌊
          </>
        ) : (
          <>
            <span>Agregar prenda a mi carrito</span> 🌊
          </>
        )}
      </button>
    </div>
  );
}
