import { AlertTriangle, Leaf } from "lucide-react";
import Reveal from "./Reveal";

const RISKS = [
  "Daña el sistema nervioso, los riñones y los pulmones.",
  "Contamina ríos, suelos y el agua que consumen las comunidades.",
  "El cianuro es altamente tóxico y persiste en el ambiente.",
  "Expone su operación a riesgos legales y sanitarios.",
];

export default function MercurySection() {
  return (
    <section className="section mercury" style={{ background: "var(--canvas)" }}>
      <div className="wrap">
        <Reveal className="shead center">
          <span className="eyebrow">El método tradicional</span>
          <h2>
            El mercurio y el cianuro{" "}
            <span className="o">dañan tu salud y el ambiente</span>
          </h2>
          <p className="lead" style={{ margin: "0 auto" }}>
            Los métodos tradicionales de recuperación de oro usan químicos tóxicos que
            ponen en riesgo a su equipo, a las comunidades y al planeta.
          </p>
        </Reveal>
        <Reveal className="gold-wrap">
          <img
            src="/img/landing/panning.jpg"
            alt="Recuperación de oro con el método tradicional que usa mercurio"
            style={{
              width: "100%",
              borderRadius: "var(--r-lg)",
              boxShadow: "var(--sh2)",
              border: "1px solid var(--line)",
            }}
          />
          <div>
            <ul className="vlist" style={{ marginBottom: 24 }}>
              {RISKS.map((t, i) => (
                <li key={i} style={{ color: "var(--ink2)" }}>
                  <AlertTriangle style={{ color: "#E0413E" }} />
                  {t}
                </li>
              ))}
            </ul>
            <div
              style={{
                background: "var(--osoft)",
                border: "1px solid rgba(252,143,51,.35)",
                borderRadius: "var(--r-md)",
                padding: 20,
              }}
            >
              <div
                style={{
                  fontFamily: "var(--fhead)",
                  fontWeight: 800,
                  color: "var(--ink)",
                  fontSize: "1.12rem",
                  marginBottom: 6,
                }}
              >
                La alternativa limpia
              </div>
              <p style={{ fontSize: ".98rem", color: "var(--ink2)", marginBottom: 16 }}>
                La mesa MEPROIND recupera{" "}
                <b style={{ color: "var(--od)" }}>hasta 91% de su oro solo con agua</b> —
                0% mercurio, 0% químicos.
              </p>
              <a className="btn btn-o" href="#modelos">
                <Leaf />
                Conozca la alternativa limpia
              </a>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
