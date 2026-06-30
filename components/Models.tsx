"use client";

import { useState } from "react";
import { MessageCircle } from "lucide-react";
import Reveal from "./Reveal";
import { MODELS } from "@/lib/content";
import { wa } from "@/lib/whatsapp";

export default function Models() {
  const [active, setActive] = useState(0);
  const m = MODELS[active];

  return (
    <section className="section models" id="modelos">
      <div className="wrap">
        <Reveal className="shead center">
          <span className="eyebrow">Línea XL</span>
          <h2>
            Elija la mesa ideal <span className="o">para su operación</span>
          </h2>
          <p className="lead" style={{ margin: "0 auto" }}>
            Misma tecnología y misma calidad en todas. Lo que cambia es el tamaño y la
            capacidad — elige según cuánto procesas.
          </p>
        </Reveal>

        <Reveal className="msel">
          {/* Pestañas */}
          <div className="msel-tabs" role="tablist" aria-label="Modelos de mesa">
            {MODELS.map((mm, i) => (
              <button
                key={mm.code}
                type="button"
                role="tab"
                aria-selected={i === active}
                className={i === active ? "msel-tab active" : "msel-tab"}
                onClick={() => setActive(i)}
              >
                <span className="msel-tab-code">{mm.code}</span>
              </button>
            ))}
          </div>

          {/* Panel del modelo activo */}
          <div className="msel-panel">
            <div className="msel-photo">
              <img src={m.img} alt={m.alt} />
            </div>
            <div className="msel-info">
              <span className="msel-eyebrow">{m.eyebrow}</span>
              <p className="msel-desc">{m.desc}</p>

              <ul className="msel-specs">
                <li>
                  <span>Capacidad</span>
                  <b className="o">{m.capacity}</b>
                </li>
                <li>
                  <span>Tamaño total</span>
                  <b>{m.size}</b>
                </li>
                <li>
                  <span>Energía</span>
                  <b>{m.energy}</b>
                </li>
                <li>
                  <span>Recuperación</span>
                  <b className="o">{m.recovery}</b>
                </li>
              </ul>

              <div className="msel-cta">
                <a className="btn btn-o" href={wa(m.waMsg)} target="_blank" rel="noopener">
                  <MessageCircle />
                  Cotizar aquí
                </a>
              </div>
            </div>
          </div>

          <p className="msel-foot">
            ¿No sabes cuál te conviene? Te asesoramos sin compromiso por WhatsApp.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
