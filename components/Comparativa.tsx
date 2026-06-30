"use client";

import { useEffect, useRef, useState } from "react";
import { MessageCircle, Volume2, VolumeX } from "lucide-react";
import Reveal from "./Reveal";
import { wa } from "@/lib/whatsapp";

/**
 * "Por qué MEPROIND": video vertical (la mesa en acción) a la derecha; a la
 * izquierda, las frases clave que se muestran UNA A UNA, sincronizadas con el
 * tramo del video, con líneas de progreso navegables (clic = salta a ese punto).
 * Al terminar, el video hace loop.
 *
 * `start` = segundo del video donde empieza cada frase. ←★ AJUSTAR con los
 * tiempos reales de la narración (ahora reparte en partes iguales como base).
 */
// `start` = segundo del video donde empieza cada frase. Tiempos del cliente:
// GoldTech aparece 3-4s · mezcla 70/30 ~21s · reutilizar agua ~28s.
// (1 y 5 estimados: arranque y cierre.)
const POINTS = [
  { start: 0, t: "Maximiza tu recuperación", d: "Logra hasta un 91% de eficiencia capturando tanto oro fino como grueso." },
  { start: 3.5, t: "Tecnología GoldTech Pro Slots®", d: "Ranuras con geometría avanzada diseñadas exclusivamente para una captura especializada de oro y otros metales." },
  { start: 21, t: "Consumo optimizado", d: "Mezcla eficiente de 70% agua y 30% mineral para garantizar el máximo rendimiento." },
  { start: 28, t: "Sistema de circuito cerrado", d: "Permite reutilizar el agua en cada jornada, reduciendo costos operativos drásticamente." },
  { start: 35, t: "Impacto ambiental", d: "Proceso 100% limpio que opera únicamente con agua y electricidad, libre de químicos." },
];
const SRC = "/video/meproind-vert.mp4";

export default function Comparativa() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [active, setActive] = useState(0);
  const [prog, setProg] = useState(0); // avance 0..1 dentro de la frase activa
  const [muted, setMuted] = useState(true);

  const ensureSrc = (v: HTMLVideoElement) => {
    if (!v.getAttribute("src")) {
      v.setAttribute("src", SRC);
      v.load();
    }
  };

  // Carga diferida + autoplay al entrar en pantalla; pausa al salir.
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const io = new IntersectionObserver(
      (entries) => {
        const e = entries[0];
        if (!e) return;
        if (e.intersectionRatio >= 0.3) {
          ensureSrc(v);
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

  // Sincroniza la frase activa + el progreso con el tiempo del video.
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const onTime = () => {
      const tt = v.currentTime;
      let i = 0;
      for (let k = 0; k < POINTS.length; k++) if (tt >= POINTS[k].start) i = k;
      setActive(i);
      const end = i + 1 < POINTS.length ? POINTS[i + 1].start : v.duration || POINTS[i].start + 10;
      const span = Math.max(0.1, end - POINTS[i].start);
      setProg(Math.min(1, Math.max(0, (tt - POINTS[i].start) / span)));
    };
    v.addEventListener("timeupdate", onTime);
    return () => v.removeEventListener("timeupdate", onTime);
  }, []);

  // Clic en una línea → salta a ese punto del video (navegación por capítulos).
  const seekTo = (i: number) => {
    const v = videoRef.current;
    if (!v) return;
    ensureSrc(v);
    const go = () => {
      v.currentTime = POINTS[i].start + 0.05;
      v.play().catch(() => {});
    };
    if (v.readyState >= 1) go();
    else v.addEventListener("loadedmetadata", go, { once: true });
  };

  const toggleMute = () => {
    const v = videoRef.current;
    if (!v) return;
    ensureSrc(v);
    v.muted = !v.muted;
    setMuted(v.muted);
    v.play().catch(() => {});
  };

  const cur = POINTS[active];

  return (
    <section className="section" id="comparativa">
      <div className="wrap">
        <Reveal className="vfeat">
          {/* Izquierda: título + líneas de progreso navegables + frase activa (una a una) */}
          <div className="vfeat-rail">
            <div className="vfeat-head">
              <h2>
                Descubre la
                <br />
                mejor manera de
                <br />
                <span className="mark">procesar oro</span> y
                <br />
                otros minerales
              </h2>
            </div>

            <div className="vfeat-bars" role="tablist" aria-label="Capítulos del video">
              {POINTS.map((p, i) => (
                <button
                  key={i}
                  type="button"
                  role="tab"
                  aria-selected={i === active}
                  className={i === active ? "vfb on" : "vfb"}
                  onClick={() => seekTo(i)}
                  aria-label={`Ir a: ${p.t}`}
                >
                  <span
                    className="vfb-fill"
                    style={{ transform: `scaleX(${i < active ? 1 : i === active ? prog : 0})` }}
                  />
                </button>
              ))}
            </div>

            <div className="vfeat-active" key={active}>
              <span className="vfeat-step">
                {String(active + 1).padStart(2, "0")}
                <em> / {String(POINTS.length).padStart(2, "0")}</em>
              </span>
              <h3>{cur.t}</h3>
              <p>{cur.d}</p>
            </div>

            <a
              className="btn btn-o vfeat-cta"
              href={wa("Hola, quiero agendar mi prueba gratis de las mesas gravimétricas Meproind.")}
              target="_blank"
              rel="noopener"
            >
              <MessageCircle />
              Agenda tu Prueba Gratis
            </a>
          </div>

          {/* Derecha: video vertical */}
          <div className="vfeat-stage">
            <div className="vfeat-frame">
              {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
              <video ref={videoRef} muted loop playsInline preload="none" poster="/img/landing/m3.jpg" />
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
