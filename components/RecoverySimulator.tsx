"use client";

import { useEffect, useMemo, useState, type ChangeEvent } from "react";
import dynamic from "next/dynamic";
import { Gauge, Gem, Clock, Percent, Cpu, MessageCircle, FileDown } from "lucide-react";
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

// El visor 3D (Three.js, ~140 kB) se carga sólo en cliente y bajo demanda → no infla el JS inicial.
const Viewer3D = dynamic(() => import("./Viewer3D"), {
  ssr: false,
  loading: () => (
    <div className="viewer3d-stage" style={{ display: "grid", placeItems: "center" }}>
      <span style={{ color: "rgba(255,255,255,.5)", fontSize: ".9rem" }}>Cargando vista 3D…</span>
    </div>
  ),
});

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
  // Límites de QA por campo: evita valores infinitos, negativos o absurdos.
  const LIM = {
    capacity: { min: 0, max: 500, def: 10 },
    grade: { min: 0, max: 250, def: 8 },
    hours: { min: 1, max: 24, def: 12 },
  } as const;
  type Lim = { min: number; max: number; def: number };
  const parseClamp = (s: string, L: Lim) => {
    const n = Number(s);
    if (s.trim() === "" || !Number.isFinite(n)) return L.def;
    return Math.min(Math.max(n, L.min), L.max);
  };

  const [capacityStr, setCapacityStr] = useState("10");
  const [gradeStr, setGradeStr] = useState("8");
  const [hoursStr, setHoursStr] = useState("12");
  const [recovery, setRecovery] = useState(91);

  // Valores ya validados/acotados que alimentan el cálculo y el 3D.
  const capacity = parseClamp(capacityStr, LIM.capacity);
  const grade = parseClamp(gradeStr, LIM.grade);
  const hours = parseClamp(hoursStr, LIM.hours);

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

  // Permite escribir libre (vacío/parcial/decimales) pero bloquea no-numérico,
  // Infinity/NaN, negativos y sobre el máximo; al salir del campo normaliza al valor válido.
  const onField =
    (setStr: (s: string) => void, L: Lim) => (e: ChangeEvent<HTMLInputElement>) => {
      const s = e.target.value;
      if (s === "") return setStr("");
      const n = Number(s);
      if (!Number.isFinite(n)) return; // ignora Infinity / NaN / texto
      if (n > L.max) return setStr(String(L.max));
      if (n < 0) return setStr("0");
      setStr(s);
    };
  const onFieldBlur = (setStr: (s: string) => void, str: string, L: Lim) => () =>
    setStr(String(parseClamp(str, L)));

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
                    <input
                      type="number"
                      inputMode="numeric"
                      min={LIM.capacity.min}
                      max={LIM.capacity.max}
                      step={1}
                      value={capacityStr}
                      onChange={onField(setCapacityStr, LIM.capacity)}
                      onBlur={onFieldBlur(setCapacityStr, capacityStr, LIM.capacity)}
                    />
                    <em>tn/día</em>
                  </div>
                </label>
                <label className="sim-field">
                  <span>
                    <Gem /> Ley de oro
                  </span>
                  <div className="sim-input">
                    <input
                      type="number"
                      inputMode="decimal"
                      min={LIM.grade.min}
                      max={LIM.grade.max}
                      step={0.1}
                      value={gradeStr}
                      onChange={onField(setGradeStr, LIM.grade)}
                      onBlur={onFieldBlur(setGradeStr, gradeStr, LIM.grade)}
                    />
                    <em>g/t</em>
                  </div>
                </label>
                <label className="sim-field">
                  <span>
                    <Clock /> Operación
                  </span>
                  <div className="sim-input">
                    <input
                      type="number"
                      inputMode="numeric"
                      min={LIM.hours.min}
                      max={LIM.hours.max}
                      step={1}
                      value={hoursStr}
                      onChange={onField(setHoursStr, LIM.hours)}
                      onBlur={onFieldBlur(setHoursStr, hoursStr, LIM.hours)}
                    />
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
                <a className="btn btn-ghost" href={reco.plano} target="_blank" rel="noopener">
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
