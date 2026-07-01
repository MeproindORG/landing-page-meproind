"use client";

import { useRef, useState } from "react";
import { Hand } from "lucide-react";
import { ANATOMY_PARTS } from "@/lib/content";
import Reveal from "./Reveal";

const BASE = "/img/landing/anat-base.jpg";

export default function Anatomy() {
  const [active, setActive] = useState(ANATOMY_PARTS[0]);
  const stageRef = useRef<HTMLDivElement>(null);

  // Micro-interacción 3D: la mesa se inclina siguiendo el cursor (solo desktop).
  const tilt = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = stageRef.current;
    if (
      !el ||
      window.matchMedia("(hover: none)").matches ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    )
      return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    el.style.transform = `perspective(1100px) rotateX(${(-py * 8).toFixed(
      2,
    )}deg) rotateY(${(px * 12).toFixed(2)}deg)`;
  };
  const resetTilt = () => {
    if (stageRef.current) stageRef.current.style.transform = "";
  };

  return (
    <section className="section anatomy">
      <div className="wrap">
        <Reveal className="shead">
          <span className="eyebrow">Anatomía de la mesa</span>
          <h2>Ingeniería en cada componente</h2>
          <p className="lead">
            Toque cada punto para ver el detalle de cada parte de la mesa.
          </p>
        </Reveal>
        <Reveal className="anat-wrap">
          <div
            className="anat-stage"
            ref={stageRef}
            onMouseMove={tilt}
            onMouseLeave={resetTilt}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={BASE}
              alt="Mesa gravimétrica Meproind con sus componentes"
            />
            {ANATOMY_PARTS.map((p) => (
              <button
                key={p.key}
                className={p.key === active.key ? "hot active" : "hot"}
                style={{ left: `${p.x}%`, top: `${p.y}%` }}
                aria-label={p.t}
                onClick={() => setActive(p)}
              />
            ))}
          </div>
          <div className="anat-panel">
            {active.img ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={active.img} alt={active.t} />
            ) : (
              <div
                className="anat-zoom"
                role="img"
                aria-label={active.t}
                style={{
                  backgroundImage: `url(${BASE})`,
                  backgroundPosition: `${active.x}% ${active.y}%`,
                }}
              />
            )}
            <div className="pt">{active.t}</div>
            <div className="pd">{active.d}</div>
            <div className="anat-hint">
              <Hand />
              Toque los puntos naranjas sobre la mesa
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
