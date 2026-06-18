"use client";

import { useState } from "react";
import { Hand } from "lucide-react";
import { ANATOMY_PARTS } from "@/lib/content";
import Reveal from "./Reveal";

export default function Anatomy() {
  const [active, setActive] = useState(ANATOMY_PARTS[0]);

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
          <div className="anat-stage">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/img/landing/m3.jpg"
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
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={active.img} alt={active.t} />
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
