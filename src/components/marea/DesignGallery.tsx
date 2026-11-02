import { useEffect, useState } from 'react';

export interface Design {
  id: string;
  slug: string;
  name: string;
  image_url: string;
  technique_recommended: string;
}

export const FALLBACK_DESIGNS: Design[] = [
  { id: 'design-ola-nocturna', slug: 'ola-nocturna', name: 'Ola Nocturna', image_url: '/images/marea/designs/ola-nocturna.jpg', technique_recommended: 'DTF' },
  { id: 'design-sol-de-tulum', slug: 'sol-de-tulum', name: 'Sol de Tulum', image_url: '/images/marea/designs/sol-de-tulum.jpg', technique_recommended: 'DTF' },
  { id: 'design-espiritu-selva', slug: 'espiritu-selva', name: 'Espíritu Selva', image_url: '/images/marea/designs/espiritu-selva.jpg', technique_recommended: 'DTG' },
  { id: 'design-marea-tricolor', slug: 'marea-tricolor', name: 'Skin Lab Tricolor', image_url: '/images/marea/designs/marea-tricolor.jpg', technique_recommended: 'DTF' },
  { id: 'design-coral-vivo', slug: 'coral-vivo', name: 'Coral Vivo', image_url: '/images/marea/designs/coral-vivo.jpg', technique_recommended: 'DTG' },
  { id: 'design-mango-beach', slug: 'mango-beach', name: 'MANGO Beach', image_url: '/images/marea/designs/mango-beach.jpg', technique_recommended: 'DTF' },
  { id: 'design-mascara-marina', slug: 'mascara-marina', name: 'Máscara Marina', image_url: '/images/marea/designs/mascara-marina.jpg', technique_recommended: 'DTG' },
  { id: 'design-ola-espuma', slug: 'ola-espuma', name: 'Ola Espuma', image_url: '/images/marea/designs/ola-espuma.jpg', technique_recommended: 'DTF' },
];

export default function DesignGallery({ tenant = 'marea' }: { tenant?: string }) {
  const [designs, setDesigns] = useState<Design[]>(FALLBACK_DESIGNS);
  const [filter, setFilter] = useState<string>('all');
  const [selectedId, setSelectedId] = useState<string>('');

  useEffect(() => {
    fetch(`/api/designs?tenant=${tenant}`)
      .then((r) => r.json())
      .then((d: any) => {
        const list = Array.isArray(d?.data) && d.data.length > 0 ? d.data : FALLBACK_DESIGNS;
        setDesigns(list);
      })
      .catch(() => {
        setDesigns(FALLBACK_DESIGNS);
      });
  }, [tenant]);

  const handleSelectDesign = (d: Design) => {
    setSelectedId(d.id);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('marea:select-design', {
          detail: { id: d.id, slug: d.slug, name: d.name, image_url: d.image_url, technique: d.technique_recommended },
        })
      );
      const conf = document.getElementById('personaliza') || document.getElementById('marea-configurator');
      if (conf) {
        conf.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  const filtered = filter === 'all' ? designs : designs.filter((d) => d.technique_recommended === filter);
  const techniques = Array.from(new Set(designs.map((d) => d.technique_recommended)));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <span className="font-mono text-xs uppercase tracking-widest text-marea-coral-dk font-bold">Catálogo de Arte</span>
          <h3 className="font-display font-800 text-2xl text-marea-tinta">Estampas disponibles</h3>
        </div>
        <span className="font-mono text-xs text-marea-tinta-3">{filtered.length} diseños</span>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`rounded-full px-4 py-1.5 text-xs font-bold transition-all ${
            filter === 'all'
              ? 'bg-marea-teal text-marea-tinta shadow-sm'
              : 'bg-marea-blanco border border-marea-arena-b text-marea-tinta-2 hover:border-marea-teal'
          }`}
        >
          Todos
        </button>
        {techniques.map((t) => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            className={`rounded-full px-4 py-1.5 text-xs font-bold transition-all ${
              filter === t
                ? 'bg-marea-teal text-marea-tinta shadow-sm'
                : 'bg-marea-blanco border border-marea-arena-b text-marea-tinta-2 hover:border-marea-teal'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 max-h-[520px] overflow-y-auto pr-1">
        {filtered.map((d) => {
          const isSelected = selectedId === d.id;
          return (
            <div
              key={d.id}
              onClick={() => handleSelectDesign(d)}
              className={`group relative rounded-2xl border-2 p-2.5 transition-all cursor-pointer bg-white flex flex-col justify-between ${
                isSelected
                  ? 'border-marea-coral ring-2 ring-marea-coral/30 shadow-md'
                  : 'border-marea-arena-b hover:border-marea-teal hover:shadow-ola'
              }`}
            >
              <div className="overflow-hidden rounded-xl bg-marea-arena-2 relative aspect-square flex items-center justify-center">
                <img
                  src={d.image_url}
                  alt={d.name}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  onError={(e) => {
                    const target = e.currentTarget;
                    if (target.src.endsWith('.png')) {
                      target.src = target.src.replace(/\.png$/, '.jpg');
                    } else if (target.src.endsWith('.jpg')) {
                      target.src = target.src.replace(/\.jpg$/, '.jpeg');
                    }
                  }}
                />
                <span className="absolute bottom-1.5 right-1.5 rounded-md bg-marea-noche/75 px-1.5 py-0.5 font-mono text-[10px] font-bold text-white uppercase backdrop-blur-xs">
                  {d.technique_recommended}
                </span>
              </div>
              <div className="mt-2 text-center">
                <div className="font-display font-700 text-sm text-marea-tinta leading-tight truncate">{d.name}</div>
                <div className="mt-1 text-[11px] font-bold text-marea-teal-dk group-hover:underline">
                  {isSelected ? '✓ Seleccionado' : 'Elegir diseño →'}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
