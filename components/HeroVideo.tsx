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
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            if (!v.getAttribute("src")) {
              v.setAttribute("src", "/video/meproind-web.mp4");
            }
            v.play().catch(() => {});
          } else {
            v.pause();
          }
        });
      },
      { threshold: 0.25 },
    );
    io.observe(v);
    return () => io.disconnect();
  }, []);

  return (
    <section className="herovid" aria-label="Video Meproind">
      <div className="wrap">
        <div className="herovid-frame">
          <video ref={ref} muted loop playsInline preload="none" />
        </div>
      </div>
    </section>
  );
}
