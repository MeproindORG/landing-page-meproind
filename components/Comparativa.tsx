"use client";

import { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import Reveal from "./Reveal";

/**
 * Sección "Por qué MEPROIND": video vertical (la presentación de la mesa) a la
 * derecha y las frases clave a la izquierda, que se resaltan SINCRONIZADAS con el
 * avance del video (cada frase corresponde a lo que se escucha en ese tramo).
 *
 * Baja conectividad: el video (~MB) se carga sólo cuando la sección entra en
 * pantalla (preload="none" + carga diferida), autoplay silenciado + loop, con
 * botón para activar el sonido y oír la narración.
 */
const POINTS = [
  {
    t: "Maximiza tu recuperación",
    d: "Hasta 91% de recuperación de oro y otros minerales, para partículas finas y gruesas.",
  },
  {
    t: "Tecnología GoldTech Pro Slots®",
    d: "Ranuras con geometría avanzada para una captura especializada en oro y otros metales.",
  },
  {
    t: "Cero químicos",
    d: "Sistema de separación únicamente con agua y electricidad — sin mercurio ni cianuro.",
  },
  {
    t: "Reutiliza el agua",
    d: "Consumo optimizado con una relación de 70% agua y 30% material.",
  },
];

export default function Comparativa() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [active, setActive] = useState(0);
  const [muted, setMuted] = useState(true);

  // Carga diferida + autoplay al entrar en pantalla; pausa al salir.
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const io = new IntersectionObserver(
      (entries) => {
        const e = entries[0];
        if (!e) return;
        if (e.intersectionRatio >= 0.3) {
          if (!v.getAttribute("src")) {
            v.setAttribute("src", "/video/meproind-vert.mp4");
            v.load();
          }
          const tryPlay = () => v.play().catch(() => {});
          if (v.readyState >= 2) tryPlay();
          else v.addEventListener("canplay", tryPlay, { once: true });
        } else if (e.intersectionRatio <= 0) {
          v.pause();
        }
      },
      { threshold: [0, 0.3] },
    );
    io.observe(v);
    return () => io.disconnect();
  }, []);

  // Resalta la frase que corresponde al tramo actual del video. Por ahora reparte
  // las 4 frases en partes iguales de la duración (robusto sin timestamps exactos);
  // si se quieren tiempos precisos, basta con definir un `start` por frase.
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const onTime = () => {
      if (!v.duration) return;
      const i = Math.min(
        POINTS.length - 1,
        Math.floor((v.currentTime / v.duration) * POINTS.length),
      );
      setActive(i);
    };
    v.addEventListener("timeupdate", onTime);
    return () => v.removeEventListener("timeupdate", onTime);
  }, []);

  const toggleMute = () => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
    v.play().catch(() => {});
  };

  return (
    <section className="section" id="comparativa">
      <div className="wrap">
        <Reveal className="shead center">
          <span className="eyebrow">Por qué MEPROIND</span>
          <h2>
            Descubre la mejor manera de procesar{" "}
            <span className="o">oro y otros minerales</span>
          </h2>
        </Reveal>

        <Reveal className="vfeat">
          {/* Frases sincronizadas con el video */}
          <ul className="vfeat-points">
            {POINTS.map((p, i) => (
              <li
                key={i}
                className={i === active ? "vfeat-point on" : "vfeat-point"}
                aria-current={i === active}
              >
                <span className="vfeat-num">{i + 1}</span>
                <div className="vfeat-copy">
                  <h3>{p.t}</h3>
                  <p>{p.d}</p>
                </div>
              </li>
            ))}
          </ul>

          {/* Video vertical de la mesa en acción */}
          <div className="vfeat-stage">
            <div className="vfeat-frame">
              <div className="vfeat-dots" aria-hidden="true">
                {POINTS.map((_, i) => (
                  <span key={i} className={i === active ? "on" : ""} />
                ))}
              </div>
              {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
              <video
                ref={videoRef}
                muted
                loop
                playsInline
                preload="none"
                poster="/img/landing/m3.jpg"
              />
              <button
                type="button"
                className="vfeat-mute"
                onClick={toggleMute}
                aria-label={muted ? "Activar sonido" : "Silenciar"}
              >
                {muted ? <VolumeX /> : <Volume2 />}
              </button>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
