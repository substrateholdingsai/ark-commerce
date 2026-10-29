import React from 'react';
import { SERVICES } from '../../data/services';

const WHATSAPP_NUMBER = '529994918221';

export default function ServiceCarousel() {
  return (
    <div className="relative">
      <div
        className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-4 scrollbar-thin"
        role="region"
        aria-label="Servicios disponibles"
      >
        {SERVICES.map((s) => (
          <article
            key={s.id}
            className="snap-start shrink-0 w-[85%] sm:w-[60%] lg:w-[45%] rounded-2xl border border-white/10 bg-[#121417] overflow-hidden shadow-xl"
          >
            <div className="relative h-40 sm:h-48">
              <img
                src={s.image}
                alt={s.title}
                loading="lazy"
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#121417] via-[#121417]/40 to-transparent" />
              <div className="absolute bottom-3 left-4 right-4">
                <h3 className="font-display font-bold text-lg text-white">{s.title}</h3>
                <p className="text-xs text-[#A7AEB8]">{s.subtitle}</p>
                <span className="mt-1 inline-block font-mono text-[10px] text-[#B4FF00] bg-[#B4FF00]/10 px-2 py-0.5 rounded border border-[#B4FF00]/20">
                  {s.store}
                </span>
              </div>
            </div>
            <div className="p-4 space-y-2">
              {s.services.map((svc, i) => (
                <div key={i} className="flex items-center justify-between text-xs">
                  <span className="text-zinc-200">{svc.name}</span>
                  <span className="font-mono font-bold text-[#B4FF00]">{svc.price}</span>
                </div>
              ))}
              <a
                href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(s.whatsappMsg)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 w-full h-10 rounded-lg bg-[#25D366] hover:bg-[#22bf5b] font-bold text-white text-xs flex items-center justify-center gap-2 transition"
              >
                💬 Cotizar por WhatsApp
              </a>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
