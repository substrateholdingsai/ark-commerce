export interface ServiceItem {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  store: string;
  badge?: string;
  url: string;
  services: { name: string; price: string }[];
  whatsappMsg: string;
}

export const SERVICES: ServiceItem[] = [
  {
    id: 'marea',
    title: 'MAREA · Moda del Sureste',
    subtitle: 'Playeras personalizadas y serigrafía artesanal',
    image: '/images/marea/seo/og-image.png',
    store: 'tiendas.arksystems.site/marea',
    badge: 'RETAIL & MODA',
    url: '/marea',
    services: [
      { name: 'Playera "Ola Nocturna" (100% Algodón)', price: '$349' },
      { name: 'Playera "Sol de Tulum" Edición Coral', price: '$329' },
      { name: 'Playera "MANGO Beach" Edición Festiva', price: '$339' },
    ],
    whatsappMsg: 'Hola MAREA! 🌊 Quiero pedir playeras personalizadas con envío a mi domicilio.',
  },
  {
    id: 'temozonia',
    title: 'Temozonia · Carnes Ahumadas',
    subtitle: 'Ahumados lentos al estilo Valladolid con leña local',
    image: '/images/temozonia/smoke_hero.png',
    store: 'tiendas.arksystems.site/temozonia',
    badge: 'GOURMET & ALIMENTOS',
    url: '/temozonia',
    services: [
      { name: 'Pork Belly Ahumado en Leña de Jabín (500g)', price: '$269' },
      { name: 'Costillas BBQ Ahumadas 12 horas (1kg)', price: '$389' },
      { name: 'Longaniza Artesanal de Valladolid (500g)', price: '$195' },
    ],
    whatsappMsg: 'Hola Temozonia! 🥩 Quiero ordenar un paquete de carnes ahumadas con envío a mi código postal.',
  },
  {
    id: 'baakal',
    title: 'BAAKAL · Plomería & Gas LP',
    subtitle: 'Técnicos certificados, desazolve y redes hidráulicas',
    image: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?auto=format&fit=crop&w=800&q=80',
    store: 'tiendas.arksystems.site/baakal',
    badge: 'SERVICIOS TÉCNICOS',
    url: '/baakal',
    services: [
      { name: 'Destape de Drenaje con Sonda Eléctrica', price: '$850' },
      { name: 'Instalación de Boiler con Prueba Hermética', price: '$1,250' },
      { name: 'Detección y Reparación de Fuga de Agua', price: '$650' },
    ],
    whatsappMsg: 'Hola Baakal! 🔧 Solicito técnico para diagnóstico y reparación de fuga. Mi código postal es...',
  },
  {
    id: 'climas',
    title: 'Climas del Sureste · HVAC',
    subtitle: 'Mantenimiento preventivo, lavado y recarga de gas',
    image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=800&q=80',
    store: 'climas.arksystems.site',
    badge: 'CLIMATIZACIÓN',
    url: 'https://wa.me/529994918221?text=Hola!%20Requiero%20mantenimiento%20para%20minisplit.',
    services: [
      { name: 'Lavado Profundo de Minisplit (Desinfección)', price: '$550' },
      { name: 'Recarga de Gas Refrigerante Ecológico R410A', price: '$850' },
      { name: 'Instalación Completa Minisplit Inverter', price: '$1,450' },
    ],
    whatsappMsg: 'Hola! Quiero agendar servicio de lavado profundo y revisión para mis climas.',
  },
];
