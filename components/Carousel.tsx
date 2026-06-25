"use client";

import { useEffect, useState } from "react";

/**
 * Carrusel full-bleed (ancho completo) bajo el trust strip. Crossfade automático
 * cada 6 s en loop infinito; NO es controlable por el usuario (sin botones,
 * `pointer-events:none`, imágenes no arrastrables). Cada imagen lleva una frase
 * de impacto que entra animada (barra naranja + texto que sube) al activarse la
 * slide. Respeta `prefers-reduced-motion` (se queda en la primera, sin avanzar).
 */
const SLIDES = [
  {
    src: "/img/landing/carrusel-1.jpg",
    alt: "Bateo de oro artesanal con agua",
    cap: "Deja de perder oro con métodos tradicionales",
  },
  {
    src: "/img/landing/carrusel-2.jpg",
    alt: "Planta de procesamiento de mineral",
    cap: "Deja de depender de terceros para procesar tu mineral",
  },
  {
    src: "/img/landing/carrusel-3.jpg",
    alt: "Intervención a la minería informal",
    cap: "Deja de trabajar con químicos que ponen en riesgo tu mina",
  },
];

const INTERVAL = 6000;

export default function Carousel() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(
      () => setActive((a) => (a + 1) % SLIDES.length),
      INTERVAL,
    );
    return () => clearInterval(id);
  }, []);

  return (
    <section className="carousel" aria-label="Galería Meproind">
      <div className="carousel-frame">
        {SLIDES.map((s, i) => (
          <div
            className={i === active ? "carousel-slide active" : "carousel-slide"}
            key={s.src}
            aria-hidden={i !== active}
          >
            <img
              src={s.src}
              alt={s.alt}
              draggable={false}
              loading={i === 0 ? "eager" : "lazy"}
            />
            <div className="carousel-cap">
              <span className="carousel-cap-bar" aria-hidden="true" />
              <p className="carousel-cap-text">{s.cap}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
