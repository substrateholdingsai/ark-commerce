import { useEffect, useState } from 'react';

interface Design {
  id: string;
  slug: string;
  name: string;
  image_url: string;
  technique_recommended: string;
}

export default function DesignGallery({ tenant = 'marea' }: { tenant?: string }) {
  const [designs, setDesigns] = useState<Design[]>([]);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    fetch(`/api/designs?tenant=${tenant}`)
      .then((r) => r.json())
      .then((d: any) => setDesigns(Array.isArray(d?.data) ? d.data : []))
      .catch(() => {});
  }, [tenant]);

  const filtered = filter === 'all' ? designs : designs.filter((d) => d.technique_recommended === filter);
  const techniques = Array.from(new Set(designs.map((d) => d.technique_recommended)));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <button onClick={() => setFilter('all')} className={`rounded-full px-3 py-1 text-xs ${filter === 'all' ? 'bg-black text-white' : 'bg-gray-100'}`}>Todos</button>
        {techniques.map((t) => (
          <button key={t} onClick={() => setFilter(t)} className={`rounded-full px-3 py-1 text-xs ${filter === t ? 'bg-black text-white' : 'bg-gray-100'}`}>{t}</button>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {filtered.map((d) => (
          <div key={d.id} className="rounded-xl border p-2">
            <img src={d.image_url} alt={d.name} className="h-32 w-full rounded object-cover" />
            <div className="mt-1 text-xs font-bold">{d.name}</div>
            <div className="text-[10px] text-gray-500">{d.technique_recommended}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
