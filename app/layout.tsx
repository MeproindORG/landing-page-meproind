import type { Metadata } from "next";
import { Archivo } from "next/font/google";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { SITE, MODELS } from "@/lib/content";
import { WA_PHONE } from "@/lib/whatsapp";
import "./globals.css";

// Archivo se auto-aloja vía next/font (sin layout shift, sin red externa → ideal para
// zonas de baja conectividad). Es una fuente variable: cargamos el eje de ancho `wdth`
// para reproducir el look "Expanded" de los números display vía font-stretch, sin
// depender de un segundo archivo de fuente.
const archivo = Archivo({
  subsets: ["latin"],
  axes: ["wdth"],
  variable: "--font-archivo",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: SITE.title,
  description: SITE.description,
  keywords: [
    "mesas gravimétricas",
    "mesa concentradora de oro",
    "recuperación de oro sin mercurio",
    "mesa vibratoria para oro",
    "concentrador gravimétrico",
    "Meproind",
    "Arequipa",
    "XL-25",
    "XL-50",
    "XL-75",
    "XL-100",
  ],
  authors: [{ name: SITE.name }],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "es_PE",
    url: SITE.url,
    siteName: SITE.name,
    title: SITE.title,
    description: SITE.description,
    images: [
      {
        url: "/img/landing/m1.jpg",
        width: 1200,
        height: 630,
        alt: "Mesa gravimétrica Meproind",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE.title,
    description: SITE.description,
    images: ["/img/landing/m1.jpg"],
  },
  robots: { index: true, follow: true },
};

/** Datos estructurados (JSON-LD): Organization + LocalBusiness + Productos. */
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE.url}/#organization`,
      name: SITE.name,
      legalName: SITE.legal,
      url: SITE.url,
      logo: `${SITE.url}/img/landing/favicon.png`,
      email: SITE.email,
      sameAs: [SITE.appUrl],
    },
    {
      "@type": "LocalBusiness",
      "@id": `${SITE.url}/#localbusiness`,
      name: SITE.name,
      image: `${SITE.url}/img/landing/local-arequipa.jpg`,
      url: SITE.url,
      telephone: `+${WA_PHONE}`,
      email: SITE.email,
      priceRange: "$$$",
      address: {
        "@type": "PostalAddress",
        streetAddress:
          "A.HH. Horacio Zeballos Gomez, Sector 6, Mz 3 Lote 10. Av. Socabaya Uchumayo, Zona Industrial",
        addressLocality: "Arequipa",
        addressRegion: "Arequipa",
        addressCountry: "PE",
      },
      areaServed: "PE",
    },
    {
      "@type": "WebSite",
      "@id": `${SITE.url}/#website`,
      url: SITE.url,
      name: SITE.name,
      inLanguage: "es-PE",
      publisher: { "@id": `${SITE.url}/#organization` },
    },
    ...MODELS.map((m) => ({
      "@type": "Product",
      name: `Mesa gravimétrica MEPROIND ${m.code}`,
      sku: m.code,
      category: "Mesa gravimétrica / concentrador de oro",
      image: `${SITE.url}${m.img}`,
      description: m.alt,
      brand: { "@type": "Brand", name: SITE.name },
      additionalProperty: [
        {
          "@type": "PropertyValue",
          name: "Capacidad",
          value: m.capacity,
        },
        {
          "@type": "PropertyValue",
          name: "Recuperación de oro",
          value: "Hasta 91%",
        },
      ],
    })),
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className={archivo.variable}>
      <body>
        <Header />
        {children}
        <Footer />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </body>
    </html>
  );
}
