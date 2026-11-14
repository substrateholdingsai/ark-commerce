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

export interface ServicioContacto {
  telefono?: string;
  email?: string;
  persona?: string;
}

export interface Servicio {
  categoria: string;
  descripcion: string;
  departamento: string;
  contacto?: ServicioContacto;
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
  catalogo_servicios: [
    {
      categoria: "Representación Institucional",
      descripcion:
        "Representación ante instituciones públicas como IMSS, INFONAVIT, SAT, PROFECO, entre otras.",
      departamento: "General",
    },
    {
      categoria: "Red de Afiliados",
      descripcion:
        "Vinculación entre empresas afiliadas para fomentar oportunidades de negocio y colaboración estratégica.",
      departamento: "General",
    },
    {
      categoria: "Pago recuperable y deducible",
      descripcion:
        "Cuota de afiliación 100% recuperable y deducible de impuestos.",
      departamento: "Registro",
    },
    {
      categoria: "Expansión y Vinculación",
      descripcion:
        "Expande red de contactos y alianzas empresariales a través de CANACO Networking y Leader Session.",
      departamento: "Desarrollo Comercial",
      contacto: {
        telefono: "999 942 8850 Ext. 1109 / 999 593 9889",
        email: "coordinador.socios@canacomerida.com",
      },
    },
    {
      categoria: "Expansión y Vinculación Turística",
      descripcion:
        "Programa 'Sabor a Yucatán' (promoción de negocios y vinculación con clientes y proveedores). Portafolio en Tianguis Turístico y Yucatán Travel Mart (promoción a nivel nacional e internacional).",
      departamento: "Coordinación de Atención a Socios",
      contacto: {
        telefono: "999 942 8850 Ext. 1109 / 999 593 9889",
        email: "coordinador.socios@canacomerida.com",
      },
    },
    {
      categoria: "Crecimiento y Posicionamiento",
      descripcion:
        "Organización de Eventos comerciales, Carreras, Ferias y Exposiciones (EXPO FORO AMBIENTAL, EXPO FERIA DEL COMERCIO). Precios preferenciales y posicionamiento para socios.",
      departamento: "Dirección de Desarrollo Comercial",
      contacto: {
        telefono: "999 942 8850 Ext. 1126 / 999 301 0416",
        email: "desarrollocomercial@canacomerida.com",
      },
    },
    {
      categoria: "Renta de Salones",
      descripcion:
        "Salones adaptados a la medida de su evento. #SocioCanaco cuenta con tarifa preferencial. (Convenciones hasta 800 personas, Capacitación 18 personas, Lobby 150 personas, Consejo 70 personas).",
      departamento: "Salones",
      contacto: {
        telefono: "999 942 8850 Ext. 1146",
        email: "salones@canacomerida.com",
      },
    },
    {
      categoria: "Publicidad y Promoción",
      descripcion:
        "Difusión y promoción empresarial en medios: Mailing masivo, Servicio de mensajería (WhatsApp), Redes Sociales (@canacomerida, Canaco Mérida) y portal web.",
      departamento: "Comunicación",
      contacto: {
        telefono: "999 942 8850 Ext. 1132",
        email: "comunicacion@canacomerida.com",
      },
    },
    {
      categoria: "Capacitación",
      descripcion:
        "Cursos, conferencias y pláticas presenciales y online a precio preferencial para socios. Temas: Atención a clientes, Ventas, Entrevista laboral, Reformas fiscales, Habilidades administrativas, Productividad, Especializados en turismo. Cursos privados a la medida.",
      departamento: "Capacitación",
      contacto: {
        telefono: "999 942 8850 Ext. 1133",
        email: "capacitacion@canacomerida.com",
      },
    },
    {
      categoria: "Delegaciones",
      descripcion:
        "Presencia y representación en el interior del Estado con 6 delegaciones: Valladolid, Tizimín, Ticul, Tekax, Peto y Motul.",
      departamento: "Delegaciones",
    },
    {
      categoria: "Asuntos Legales",
      descripcion:
        "Asesoría y representación legal en materia laboral, mercantil, civil y administrativo. Difusión de disposiciones legales. Asesoría especializada sobre el IMSS. Representación ante Juntas Especiales Tres y Cuatro y Conciliación y Arbitraje.",
      departamento: "Dirección de Asuntos Jurídicos",
      contacto: {
        telefono: "999 942 8850 Ext. 1114 / 999 301 0415",
        email: "juridico@canacomerida.com",
      },
    },
    {
      categoria: "Bienestar Social",
      descripcion:
        "Guardería participativa gratuita para hijos de padres trabajadores inscritos al IMSS (Manzana 115). Enlaces con asociaciones de beneficencia a través de Fundación Yucatán, A.C.",
      departamento: "Dirección de Bienestar Social",
      contacto: {
        telefono: "999 942 8850 Ext. 1110 / 999 301 0424",
        email: "bienestarsocial@canacomerida.com",
      },
    },
    {
      categoria: "Registro y Afiliación",
      descripcion:
        "Atención para el alta de nuevos socios y gestión de registro.",
      departamento: "Registro",
      contacto: {
        persona: "Lic. Karen Lizama (Encargada de Registro)",
        telefono: "999 942 8850 Ext. 1108",
        email: "registro@canacomerida.com",
      },
    },
  ],
};
