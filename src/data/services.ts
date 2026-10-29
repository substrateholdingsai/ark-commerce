export interface ServiceItem {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  store: string;
  services: { name: string; price: string }[];
  whatsappMsg: string;
}

export const SERVICES: ServiceItem[] = [
  {
    id: 'plomeria',
    title: 'Plomería & Drenajes',
    subtitle: 'Fugas de agua, tinacos y bombas',
    image: 'https://images.unsplash.com/photo-OwrSEoLpG6A?auto=format&fit=crop&w=800&q=80',
    store: 'baakal.ark.mx',
    services: [
      { name: 'Destape de Drenaje con Sonda Eléctrica', price: '$850' },
      { name: 'Detección y Reparación de Fuga de Agua', price: '$650' },
      { name: 'Instalación de Tinaco / Bomba', price: '$1,400' },
    ],
    whatsappMsg: 'Hola Baakal! Solicito técnico para Destape de Drenaje con Sonda. Tarifa base: $850 MXN. Ubicación: Col. García Ginerés.',
  },
  {
    id: 'gas',
    title: 'Gas LP & Boilers',
    subtitle: 'Líneas de gas, calentadores y fugas',
    image: 'https://images.unsplash.com/photo-qz2_K9MNKlI?auto=format&fit=crop&w=800&q=80',
    store: 'baakal.ark.mx',
    services: [
      { name: 'Instalación de Boiler (Gas o Solar)', price: '$1,250' },
      { name: 'Prueba de Hermeticidad y Fuga de Gas', price: '$950' },
      { name: 'Cambio de Válvulas y Regulador', price: '$750' },
    ],
    whatsappMsg: 'Hola Baakal! Requiero instalación de Boiler con prueba de hermeticidad. Total: $1,250 MXN. ¿Tienen disponibilidad hoy?',
  },
  {
    id: 'climas',
    title: 'Climas & Minisplits (HVAC)',
    subtitle: 'Mantenimiento, lavado y recarga de gas',
    image: 'https://images.unsplash.com/photo-ItJsBJlf5Qw?auto=format&fit=crop&w=800&q=80',
    store: 'climasdeleste.ark.mx',
    services: [
      { name: 'Lavado Profundo de Minisplit', price: '$550' },
      { name: 'Recarga de Gas Refrigerante R410A', price: '$850' },
      { name: 'Instalación Completa Minisplit Inverter', price: '$1,450' },
    ],
    whatsappMsg: 'Hola! Quiero agendar servicio de lavado profundo para 2 minisplits. Total: $1,100 MXN. Paso mi dirección.',
  },
  {
    id: 'electricidad',
    title: 'Electricidad & Cuadros de Carga',
    subtitle: 'Cortocircuitos, cableado y centros de carga',
    image: 'https://images.unsplash.com/photo-LMb98OOtoYU?auto=format&fit=crop&w=800&q=80',
    store: 'voltia.ark.mx',
    services: [
      { name: 'Reparación de Cortocircuito', price: '$750' },
      { name: 'Instalación de Centro de Carga', price: '$1,350' },
      { name: 'Cableado y Balanceo de Cargas', price: '$1,800' },
    ],
    whatsappMsg: 'Hola! Tengo una falla en el centro de carga principal de mi casa. Solicito electricista urgente.',
  },
];
