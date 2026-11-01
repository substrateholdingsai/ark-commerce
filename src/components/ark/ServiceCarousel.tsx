import React from 'react';
import { SERVICES } from '../../data/services';

const WHATSAPP_NUMBER = '529994918221';

export default function ServiceCarousel() {
  return (
    <div className="relative">
      <div
        className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-4 scrollbar-thin"
        role="region"
        aria-label="Tiendas y Servicios de la Red Ark Commerce"
      >
        {SERVICES.map((s) => (
          <article
            key={s.id}
            className="snap-start shrink-0 w-[85%] sm:w-[60%] lg:w-[48%] rounded-2xl border border-white/10 bg-[#121417] overflow-hidden shadow-xl flex flex-col justify-between"
          >
            <div>
              <div className="relative h-44 sm:h-48">
                <img
                  src={s.image}
                  alt={s.title}
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#121417] via-[#121417]/50 to-transparent" />
                <div className="absolute top-3 left-4">
                  {s.badge && (
                    <span className="font-mono text-[10px] font-bold text-[#0B0C0E] bg-[#B4FF00] px-2.5 py-0.5 rounded-full shadow-md">
                      {s.badge}
                    </span>
                  )}
                </div>
                <div className="absolute bottom-3 left-4 right-4">
                  <h3 className="font-display font-bold text-lg text-white leading-tight">{s.title}</h3>
                  <p className="text-xs text-[#A7AEB8] line-clamp-1">{s.subtitle}</p>
                </div>
              </div>

              <div className="p-4 space-y-2">
                {s.services.map((svc, i) => (
                  <div key={i} className="flex items-center justify-between text-xs py-1 border-b border-white/[0.04] last:border-0">
                    <span className="text-zinc-200">{svc.name}</span>
                    <span className="font-mono font-bold text-[#B4FF00] ml-2 shrink-0">{svc.price}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 pt-0 grid grid-cols-2 gap-2 mt-2">
              <a
                href={s.url}
                className="h-9 rounded-lg bg-white/[0.08] hover:bg-white/[0.15] border border-white/10 font-display font-semibold text-white text-xs flex items-center justify-center gap-1 transition"
              >
                <span>Visitar</span>
                <span className="text-[#B4FF00]">→</span>
              </a>
              <a
                href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(s.whatsappMsg)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="h-9 rounded-lg bg-[#25D366] hover:bg-[#22bf5b] font-display font-bold text-white text-xs flex items-center justify-center gap-1.5 transition"
              >
                <span>💬 WhatsApp</span>
              </a>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
