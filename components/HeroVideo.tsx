"use client";

import { useEffect, useRef } from "react";

/**
 * Video de marca justo después del hero. Carga diferida: el archivo (~24 MB) NO
 * se descarga al cargar la página, sólo cuando la sección entra en pantalla
 * (ideal para baja conectividad). Autoplay silenciado + loop; pausa al salir de vista.
 */
export default function HeroVideo() {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    // Histéresis: reproduce cuando entra (≥15% visible) y pausa SÓLO cuando sale del
    // todo (≤0). Evita el toggle play/pause al cruzar un umbral (lag/parpadeo).
    const io = new IntersectionObserver(
      (entries) => {
        const e = entries[0];
        if (!e) return;
        if (e.intersectionRatio >= 0.15) {
          if (!v.getAttribute("src")) {
            v.setAttribute("src", "/video/meproind-web.mp4");
            v.load();
          }
          // reproducir sólo cuando haya datos (si no, play() se rechaza y no arranca)
          const tryPlay = () => v.play().catch(() => {});
          if (v.readyState >= 2) tryPlay();
          else v.addEventListener("canplay", tryPlay, { once: true });
        } else if (e.intersectionRatio <= 0) {
          v.pause();
        }
      },
      { threshold: [0, 0.15] },
    );
    io.observe(v);
    return () => io.disconnect();
  }, []);

  return (
    <section className="herovid" aria-label="Video Meproind">
      <div className="wrap">
        <div className="herovid-frame">
          <video ref={ref} muted loop playsInline autoPlay preload="none" />
        </div>
      </div>
    </section>
  );
}
