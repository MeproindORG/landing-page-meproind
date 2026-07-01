/* ============================================================
   Contenido de la landing de MEPROIND (data-driven).
   Strings de cara al cliente en español; claves técnicas en inglés.
   ============================================================ */

export const SITE = {
  name: "MEPROIND",
  legal: "DeChinaAPeru.com E.I.R.L.",
  url: "https://www.meproind.com",
  email: "admin@dechinaaperu.com",
  appUrl: "https://app.meproind.com",
  title:
    "Meproind | Mesas gravimétricas de alta precisión — recuperación de oro sin mercurio",
  description:
    "Mesas gravimétricas de alta precisión: hasta 91% de recuperación de oro, 0% mercurio, solo agua. Modelos XL-25 a XL-100. Fabricación en Arequipa, Perú.",
  arequipa:
    "A.HH. Horacio Zeballos Gomez, Sector 6, Mz 3 Lote 10. Av. Socabaya Uchumayo, Zona Industrial – Arequipa.",
  lima: "Av. Don Diego de Día 228, Surco",
} as const;

export const NAV_LINKS = [
  { href: "#modelos", label: "Modelos" },
  { href: "#tecnologia", label: "Tecnología" },
  { href: "#comparativa", label: "Comparativa" },
  { href: "#contacto", label: "Contacto" },
] as const;

/** Iconos de lucide-react referenciados por nombre PascalCase. */
export const TRUST_ITEMS = [
  { icon: "Microscope", label: "Desarrollada con ingenieros de mina" },
  { icon: "Cpu", label: "Tecnología propia GoldTech Pro Slots®" },
  { icon: "ShieldCheck", label: "Estructura de acero reforzada" },
  { icon: "Leaf", label: "0% mercurio · ecoamigable" },
] as const;

export interface StatItem {
  /** valor a animar (count-up); null = texto estático */
  count: number | null;
  prefix?: string;
  suffix?: string;
  text?: string;
  label: string;
  accent?: boolean;
}
export const STATS: StatItem[] = [
  { count: 165, prefix: "+", accent: true, label: "Mesas instaladas en el Perú" },
  { count: 6, prefix: "+", accent: true, label: "Años de experiencia" },
  { count: 4, accent: true, label: "Modelos disponibles" },
];

export interface Model {
  code: string;
  capacity: string;
  img: string;
  alt: string;
  plano: string;
  popular?: boolean;
  waMsg: string;
  desc: string;
  size: string;
  weight: string;
  energy: string;
  tech: string;
}
export const MODELS: Model[] = [
  {
    code: "XL-25",
    capacity: "Hasta 200 kg/h",
    img: "/img/landing/model-1.jpg",
    alt: "Mesa gravimétrica XL-25 — hasta 200 kg/h, ideal para operaciones artesanales",
    plano: "/planos/xl-25.pdf",
    waMsg:
      "Hola, deseo más información sobre la mesa gravimétrica XL-25 de 200 kg/h.",
    desc: "Alta precisión en formato compacto.",
    size: "2,050 × 620 × 730 mm",
    weight: "150 kg",
    energy: "1.1 kW (220V monofásico)",
    tech: "GoldTech Pro Slots® · 91% recuperación",
  },
  {
    code: "XL-50",
    capacity: "Hasta 1 t/h",
    img: "/img/landing/model-2.jpg",
    alt: "Mesa gravimétrica XL-50 — hasta 1 t/h, la más popular",
    plano: "/planos/xl-50.pdf",
    popular: true,
    waMsg:
      "Hola, deseo más información sobre la mesa gravimétrica XL-50 de 1 t/h.",
    desc: "Equilibrio perfecto entre capacidad y tamaño.",
    size: "3,000 × 1,100 × 750 mm",
    weight: "400 kg",
    energy: "2.2 kW (380V trifásico)",
    tech: "GoldTech Pro Slots® · 91% recuperación",
  },
  {
    code: "XL-75",
    capacity: "Hasta 1.5 t/h",
    img: "/img/landing/model-3.jpg",
    alt: "Mesa gravimétrica XL-75 — hasta 1.5 t/h, plantas semi-industriales",
    plano: "/planos/xl-75.pdf",
    waMsg:
      "Hola, deseo más información sobre la mesa gravimétrica XL-75 de 1.5 t/h.",
    desc: "Mayor rendimiento para plantas semi-industriales.",
    size: "3,930 × 1,520 × 750 mm",
    weight: "500 kg",
    energy: "2.2 kW (380V trifásico)",
    tech: "GoldTech Pro Slots® · 91% recuperación",
  },
  {
    code: "XL-100",
    capacity: "Hasta 2.5 t/h",
    img: "/img/landing/model-4.jpg",
    alt: "Mesa gravimétrica XL-100 — hasta 2.5 t/h, producción a gran escala",
    plano: "/planos/xl-100.pdf",
    waMsg:
      "Hola, deseo más información sobre la mesa gravimétrica XL-100 de 2.5 t/h.",
    desc: "Capacidad masiva a escala industrial.",
    size: "5,630 × 1,850 × 770 mm",
    weight: "1,000 kg",
    energy: "2.2 kW (380V trifásico)",
    tech: "GoldTech Pro Slots® · 91% recuperación",
  },
];

/** Filas de la comparativa técnica. `**texto**` se renderiza en negrita. */
export interface CompareRow {
  feat: string;
  mep: string;
  oth: string;
}
export const COMPARE_ROWS: CompareRow[] = [
  {
    feat: "Eficiencia y recuperación",
    mep: "**Hasta 91%** de recuperación de oro y otros metales, para partículas finas y gruesas.",
    oth: "70 – 80%, perdiendo las partículas finas.",
  },
  {
    feat: "Materiales de construcción",
    mep: "Fibra de vidrio + soporte metálico reforzado. Canal de plástico ABS para años de uso.",
    oth: "Canal de irrigación de madera que se pudre con el agua.",
  },
  {
    feat: "Tecnología de ranuras",
    mep: "**GoldTech Pro Slots:** geometría avanzada para captura especializada.",
    oth: "Ranuras en V con menor retención de minerales.",
  },
  {
    feat: "Consumo de agua",
    mep: "Optimizado, relación 70% agua / 30% material.",
    oth: "Más alto: 80% agua / 20% material.",
  },
  {
    feat: "Capacidad de procesamiento",
    mep: "Ajustable: **0.2 – 2.5 tn/h** según el mineral.",
    oth: "Menor flexibilidad de capacidad y ajuste.",
  },
  {
    feat: "Operación y ajustes",
    mep: "Carrera, velocidad de vibración y pendiente personalizables.",
    oth: "Una sola velocidad de motor; desperdicia material.",
  },
  {
    feat: "Impacto ambiental",
    mep: "Separación solo con agua, reutilizable y sin químicos.",
    oth: "Mayor impacto, sin opciones claras de mitigación.",
  },
  {
    feat: "Versatilidad de uso",
    mep: "Oro, plata, tungsteno y más, con alta eficiencia.",
    oth: "Limitada en la variedad de minerales que procesa.",
  },
];

export interface AnatomyPart {
  key: string;
  t: string;
  d: string;
  img: string;
  /** posición del hotspot en % sobre la imagen */
  x: number;
  y: number;
}
export const ANATOMY_PARTS: AnatomyPart[] = [
  {
    key: "ranuras",
    t: "Mesa ranurada · GoldTech Pro Slots®",
    d: "Geometría de ranuras que captura hasta la partícula más fina de oro — hasta 91% de recuperación.",
    img: "/img/landing/m7.jpg",
    x: 52,
    y: 41,
  },
  {
    key: "alimentador",
    t: "Alimentador y canal ABS",
    d: "El alimentador reparte la pulpa de forma pareja sobre la mesa; el canal de irrigación de plástico ABS resiste años sin pudrirse.",
    img: "/img/landing/m5.jpg",
    x: 25,
    y: 39,
  },
  {
    key: "motor",
    t: "Motor 2.2 kW + variador",
    d: "Velocidad ajustable para adaptarse a cualquier tipo de material, maximizando la productividad y el control.",
    img: "/img/landing/m6.jpg",
    x: 44,
    y: 67,
  },
  {
    key: "estructura",
    t: "Estructura de acero reforzada",
    d: "Soporte metálico reforzado y tablero de piedra carburada con fibra de vidrio. Resiste el sol y la intemperie.",
    img: "/img/landing/m3.jpg",
    x: 61,
    y: 77,
  },
];

export interface Testimonial {
  name: string;
  company: string;
  img: string;
  quote: string;
}
export const TESTIMONIALS: Testimonial[] = [
  {
    name: "Luis Ramírez",
    company: "Minerales del Sur E.I.R.L.",
    img: "/img/landing/t1.png",
    quote:
      "Gracias a la mesa de Meproind logramos una notable mejora en la precisión de nuestros procesos. El servicio ha sido impecable. Una inversión acertada.",
  },
  {
    name: "Carla Gutiérrez",
    company: "Compañía Minera Andina",
    img: "/img/landing/t2.png",
    quote:
      "Destacan por su durabilidad y rendimiento. Tras años de uso continuo en condiciones exigentes, siguen funcionando sin problemas.",
  },
  {
    name: "Jorge Quispe",
    company: "Tecnología Minera del Perú S.A.C.",
    img: "/img/landing/t3.png",
    quote:
      "Lo que más nos impresionó fue su capacidad para personalizar el equipo. El soporte técnico siempre ha sido rápido y eficiente.",
  },
  {
    name: "Fernando Paredes",
    company: "Industria Minera Lima",
    img: "/img/landing/t4.png",
    quote:
      "Aumentaron nuestra capacidad de producción en un 30%. Equipos robustos, fáciles de operar y mantener.",
  },
];
