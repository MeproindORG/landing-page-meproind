"use client";

import { useEffect, useMemo, useState, type ChangeEvent } from "react";
import { Gauge, Gem, Clock, Percent, Cpu, MessageCircle, FileDown } from "lucide-react";
import Viewer3D from "./Viewer3D";
import Reveal from "./Reveal";
import {
  gramsPerDay,
  gramsToUsd,
  recommendModel,
  fmtMass,
  fmtUsd,
  PERIODS,
  GRAMS_PER_OZT,
} from "@/lib/calc";
import { wa } from "@/lib/whatsapp";

interface GoldPrice {
  usdPerOz: number;
  usdPerGram: number;
  source: "vivo" | "referencia";
  updatedAt: string;
}

function useGoldPrice() {
  const [price, setPrice] = useState<GoldPrice | null>(null);
  useEffect(() => {
    let alive = true;
    const load = async () => {
      try {
        const r = await fetch("/api/gold-price");
        if (r.ok) {
          const d = (await r.json()) as GoldPrice;
          if (alive) setPrice(d);
        }
      } catch {
        /* mantiene el último valor */
      }
    };
    load();
    const id = setInterval(load, 90000); // refresca cada 90 s
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, []);
  return price;
}

export default function RecoverySimulator() {
  const [capacity, setCapacity] = useState(10);
  const [grade, setGrade] = useState(8);
  const [hours, setHours] = useState(12);
  const [recovery, setRecovery] = useState(91);

  const price = useGoldPrice();
  const usdPerOz = price ? price.usdPerOz : 2600;
  const usdPerGram = price ? price.usdPerGram : 2600 / GRAMS_PER_OZT;

  const gpd = useMemo(
    () => gramsPerDay(capacity, grade, recovery),
    [capacity, grade, recovery],
  );
  const reco = useMemo(() => recommendModel(capacity, hours), [capacity, hours]);

  const updatedAt = price
    ? new Date(price.updatedAt).toLocaleTimeString("es-PE", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  const quoteMsg =
    `Hola, quiero una cotización. Proceso ${capacity} tn/día con ley ${grade} g/t ` +
    `(${hours} h/día). Según el simulador recuperaría ~${fmtMass(gpd)} de oro al día ` +
    `y me recomiendan la mesa ${reco.code}${reco.needsMultiple ? ` (x${reco.unitsNeeded})` : ""}. ` +
    `¿Me ayudan?`;

  const num = (setter: (n: number) => void) => (e: ChangeEvent<HTMLInputElement>) =>
    setter(Math.max(0, Number(e.target.value) || 0));

  return (
    <section className="section sim" id="simulador">
      <div className="wrap">
        <Reveal className="shead center" style={{ marginLeft: "auto", marginRight: "auto" }}>
          <span className="eyebrow">Simulador de recuperación</span>
          <h2 style={{ color: "#fff" }}>
            ¿Cuánto oro <span className="o">recuperaría</span> con MEPROIND?
          </h2>
          <p className="lead" style={{ margin: "0 auto" }}>
            Ingrese su capacidad y la ley de su mineral. Calculamos cuánto oro recupera —en
            gramos y en dólares— al precio del oro de hoy, y le recomendamos la mesa ideal.
          </p>
        </Reveal>

        <div className="sim-grid">
          {/* Columna izquierda: entradas + resultados + recomendación */}
          <div className="sim-left">
            <div className="sim-panel">
              <div className="gold-chip">
                <span className={price?.source === "vivo" ? "gc-dot live" : "gc-dot"} />
                <span>
                  Oro hoy: <b>{fmtUsd(usdPerOz)}/oz</b>
                </span>
                <span className="gc-meta">
                  {price
                    ? price.source === "vivo"
                      ? `en vivo · ${updatedAt}`
                      : "referencia"
                    : "cargando…"}
                </span>
              </div>

              <div className="sim-fields">
                <label className="sim-field">
                  <span>
                    <Gauge /> Capacidad
                  </span>
                  <div className="sim-input">
                    <input type="number" min={0} step={1} value={capacity} onChange={num(setCapacity)} />
                    <em>tn/día</em>
                  </div>
                </label>
                <label className="sim-field">
                  <span>
                    <Gem /> Ley de oro
                  </span>
                  <div className="sim-input">
                    <input type="number" min={0} step={0.1} value={grade} onChange={num(setGrade)} />
                    <em>g/t</em>
                  </div>
                </label>
                <label className="sim-field">
                  <span>
                    <Clock /> Operación
                  </span>
                  <div className="sim-input">
                    <input type="number" min={1} max={24} step={1} value={hours} onChange={num(setHours)} />
                    <em>h/día</em>
                  </div>
                </label>
                <label className="sim-field sim-field-range">
                  <span>
                    <Percent /> Recuperación: <b style={{ color: "var(--o)" }}>{recovery}%</b>
                  </span>
                  <input
                    type="range"
                    min={70}
                    max={95}
                    step={1}
                    value={recovery}
                    onChange={(e) => setRecovery(Number(e.target.value))}
                  />
                </label>
              </div>
            </div>

            <div className="sim-results">
              {PERIODS.map((p) => {
                const grams = gpd * p.days;
                return (
                  <div className={`sim-rcard${p.key === "year" ? " hl" : ""}`} key={p.key}>
                    <div className="rc-period">{p.label}</div>
                    <div className="rc-mass">{fmtMass(grams)}</div>
                    <div className="rc-usd">{fmtUsd(gramsToUsd(grams, usdPerOz))}</div>
                  </div>
                );
              })}
            </div>

            <div className="sim-reco">
              <div className="reco-head">
                <Cpu />
                <span>Le recomendamos</span>
              </div>
              <div className="reco-model">
                Mesa <b>{reco.code}</b>
                {reco.needsMultiple && <em> × {reco.unitsNeeded} unidades</em>}
              </div>
              <p className="reco-note">
                Para {capacity} tn/día en {hours} h ({reco.reqTnH.toFixed(2)} tn/h).
              </p>
              <div className="reco-cta">
                <a className="btn btn-o" href={wa(quoteMsg)} target="_blank" rel="noopener">
                  <MessageCircle />
                  Solicitar esta cotización
                </a>
                <a className="btn btn-ghost" href={reco.plano} target="_blank">
                  <FileDown />
                  Ver plano {reco.code}
                </a>
              </div>
            </div>
          </div>

          {/* Columna derecha: visor 3D conectado a los datos */}
          <div className="sim-right">
            <Viewer3D grade={grade} gramsPerDay={gpd} usdPerGram={usdPerGram} />
          </div>
        </div>
      </div>
    </section>
  );
}
