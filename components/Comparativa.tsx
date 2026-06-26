import { Check, X } from "lucide-react";
import Reveal from "./Reveal";

const WIN = [
  "Recoge más oro y minerales — hasta 91% de recuperación.",
  "Captura partículas finas y gruesas.",
  "Estructura de acero reforzada + piedra carburada con fibra de vidrio.",
  "Resiste el sol y la intemperie — diseñada para durar años.",
  "Separación solo con agua, reutilizable y sin químicos.",
];
const LOSE = [
  "Solo 70 – 80% de recuperación, perdiendo las partículas finas.",
  "La mesa se raja en cuestión de meses.",
  "Estructura metálica débil que no soporta la intemperie.",
  "Canal de irrigación de madera que se pudre con el agua.",
  "Mayor consumo de agua y uso de mercurio o cianuro.",
];

export default function Comparativa() {
  return (
    <section className="section" id="comparativa">
      <div className="wrap">
        <Reveal className="shead center">
          <span className="eyebrow">Por qué MEPROIND</span>
          <h2>
            Descubre la mejor manera de procesar{" "}
            <span className="o">oro y otros minerales</span>
          </h2>
          <p className="lead" style={{ margin: "0 auto" }}>
            La diferencia entre recuperar el 70% y recuperar el 91% es la rentabilidad de
            toda su operación.
          </p>
        </Reveal>
        <Reveal className="vs">
          <div className="vcard win">
            <span className="badge">
              <Check />
            </span>
            <h3>Mesa MEPROIND</h3>
            <div className="uline" />
            <ul className="vlist">
              {WIN.map((t, i) => (
                <li key={i}>
                  <Check />
                  {t}
                </li>
              ))}
            </ul>
          </div>
          <div className="vcard lose">
            <span className="badge">
              <X />
            </span>
            <h3>Otras mesas</h3>
            <div className="uline" />
            <ul className="vlist">
              {LOSE.map((t, i) => (
                <li key={i}>
                  <X />
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
