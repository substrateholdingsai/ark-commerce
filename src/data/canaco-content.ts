// src/data/canaco-content.ts — Contenido dinámico CANACO SERVYTUR Mérida
export interface Beneficio {
  texto: string;
}

export interface Patrocinio {
  nivel: string;
  costo: number;
  moneda: string;
  beneficios: Beneficio[];
}

export interface Evento {
  nombre: string;
  descripcion: string;
  alcance?: string;
  formato?: string;
  proxima_fecha?: string;
  fecha?: string;
  lugar?: string;
  expectativa?: string;
  actividades?: string[];
  patrocinios?: Patrocinio[];
  costos_stands_preventa?: Array<{ tipo: string; costo: number; moneda: string }>;
}

export interface ContactoGeneral {
  departamento: string;
  correo: string;
  telefono: string;
  telefonos_expo_feria: string[];
}

export interface CanacoContent {
  camara: string;
  anio: number;
  eventos: Evento[];
  contacto_general: ContactoGeneral;
}

export const CANACO_CONTENT: CanacoContent = {
  camara: "CANACO SERVYTUR Mérida",
  anio: 2026,
  eventos: [
    {
      nombre: "Desayuno Networking",
      descripcion:
        "Actividad empresarial entre los afiliados de CANACO-SERVYTUR Mérida que busca detonar el desarrollo y la promoción de sus participantes. En formato de desayuno, los participantes cuentan con un espacio para entablar relaciones comerciales, promover sus servicios y productos, y ampliar su cartera de clientes.",
      alcance: "Conexión con 50 socios de manera directa y más de 100 indirectos.",
      proxima_fecha: "26 de Agosto",
      patrocinios: [
        {
          nivel: "Oro",
          costo: 9500.00,
          moneda: "MXN",
          beneficios: [
            "Banner publicitario 'in situ' durante el evento.",
            "Presencia de marca durante toda la promoción del evento.",
            "Promoción dentro del salón (muestras, flyers).",
            "Actividad durante el evento, con los socios.",
            "10 minutos de presentación de empresa con o sin apoyo audiovisual.",
            "4 pases al evento.",
            "Presencia en redes sociales de Canaco.",
          ],
        },
        {
          nivel: "Plata",
          costo: 5500.00,
          moneda: "MXN",
          beneficios: [
            "Banner publicitario 'in situ' durante el evento.",
            "Presencia de marca durante toda la promoción del evento.",
            "Promoción dentro del salón (muestras, flyers).",
            "Actividad durante el evento, con los socios.",
            "2 pases al evento.",
            "Presencia en redes sociales de Canaco.",
          ],
        },
      ],
    },
    {
      nombre: "Leader Session",
      descripcion:
        "Iniciativa estratégica de CANACO SERVYTUR Mérida diseñada para inspirar, conectar y potenciar a la nueva generación de empresarios, emprendedores y líderes emergentes. Es un espacio exclusivo para escuchar historias, desafíos y aprendizajes de líderes consolidados del ámbito empresarial.",
      formato: "Íntimo tipo entrevista y cóctel, con aforo selecto para networking estratégico.",
      proxima_fecha: "01 de Octubre",
      patrocinios: [
        {
          nivel: "Oro",
          costo: 12500.00,
          moneda: "MXN",
          beneficios: [
            "Exposición estratégica de marca en el evento.",
            "Difusión de marca en el material impreso.",
            "Imagen en la publicidad del evento.",
            "Promoción personalizada en redes sociales de CANACO.",
            "Directorio de las empresas participantes en el evento.",
            "Intervención en el escenario, de máximo cinco minutos para el posicionamiento.",
            "4 pases al evento.",
            "Área de exposición para interacción directa con los asistentes.",
          ],
        },
        {
          nivel: "Plata",
          costo: 8500.00,
          moneda: "MXN",
          beneficios: [
            "Exposición estratégica de marca en el evento.",
            "Difusión de marca en el material impreso.",
            "Imagen en la publicidad del evento.",
            "Promoción personalizada en redes sociales de CANACO.",
            "Directorio de las empresas participantes en el evento.",
            "2 pases al evento.",
          ],
        },
      ],
    },
    {
      nombre: "Expo Feria del Comercio 2026",
      descripcion:
        "El escenario ideal para impulsar ventas, fortalecer el posicionamiento del negocio, conectar con nuevos clientes y generar oportunidades de negocio.",
      fecha: "Del 15 al 18 de octubre de 2026",
      lugar: "Centro de Convenciones Yucatán Siglo XXI - Salones Uxmal y Chichén Itzá",
      expectativa: "Más de 30,000 visitantes esperados",
      actividades: [
        "Venta directa al público",
        "Networking con empresarios, emprendedores y compradores",
        "Espectáculos, conferencias y actividades para toda la familia",
      ],
      costos_stands_preventa: [
        { tipo: "Stand estándar (2x2)", costo: 8000.00, moneda: "MXN" },
        { tipo: "Stand mediano (3x2)", costo: 11500.00, moneda: "MXN" },
        { tipo: "Stand amplio (3x3)", costo: 19500.00, moneda: "MXN" },
        { tipo: "Zona de comida (3x3)", costo: 10000.00, moneda: "MXN" },
        { tipo: "Stand mediano (6x6)", costo: 28000.00, moneda: "MXN" },
        { tipo: "Isla (8x10)", costo: 100000.00, moneda: "MXN" },
      ],
      patrocinios: [
        {
          nivel: "Paquete Oro",
          costo: 120000.00,
          moneda: "MXN",
          beneficios: [
            "Imagen de banderolas en la rueda de prensa",
            "1 banderola con su marca en la entrada del recinto",
            "Mención como patrocinador en la Inauguración",
            "Marca en materiales publicitarios (gráficos y digitales)",
            "Derecho de uso del logotipo del evento en su publicidad",
            "Reconocimiento oficial de CANACO como patrocinador",
            "Asistencia al Networking de la Expo",
            "Asistencia en presídium a una rueda de prensa",
            "Mención de su marca en spots radiofónicos",
            "1 banderola con su marca en el escenario",
            "Trivia con un producto de su marca en el escenario",
            "1 edecán con su marca en la inauguración",
            "Entrevista con medios de comunicación durante la Expo",
          ],
        },
        {
          nivel: "Paquete Plata",
          costo: 90000.00,
          moneda: "MXN",
          beneficios: [
            "Imagen de banderolas en la rueda de prensa",
            "1 banderola con su marca en la entrada del recinto",
            "Mención como patrocinador en la Inauguración",
            "Marca en materiales publicitarios (gráficos y digitales)",
            "Derecho de uso del logotipo del evento en su publicidad",
            "Reconocimiento oficial de CANACO como patrocinador",
            "Espacio de 1 stand de 3x3 mts",
            "Asistencia al Networking de la Expo",
          ],
        },
      ],
    },
  ],
  contacto_general: {
    departamento: "Dirección de Atención a Socios de CANACO Mérida",
    correo: "atencionasocios@canacomerida.com",
    telefono: "9993-010423",
    telefonos_expo_feria: ["999 301 0416", "999 225 1621", "999 128 2591"],
  },
};
