import { Fragment } from "react";
import Reveal from "./Reveal";
import { COMPARE_ROWS } from "@/lib/content";

/** Renderiza segmentos marcados con **negrita** dentro de un string. */
function withBold(text: string) {
  return text
    .split(/\*\*(.+?)\*\*/g)
    .map((seg, i) =>
      i % 2 === 1 ? <b key={i}>{seg}</b> : <Fragment key={i}>{seg}</Fragment>,
    );
}

export default function ComparisonTable() {
  return (
    <section className="section comparison">
      <div className="wrap">
        <Reveal className="shead center">
          <span className="eyebrow">Comparativa técnica</span>
          <h2>
            MEPROIND <span className="o">XL-100</span> frente a otras marcas
          </h2>
        </Reveal>
        <Reveal className="table-scroll">
          <table className="ctable">
            <thead>
              <tr>
                <th>Característica</th>
                <th className="hl">Mesa MEPROIND (XL-100)</th>
                <th>Otras marcas</th>
              </tr>
            </thead>
            <tbody>
              {COMPARE_ROWS.map((r, i) => (
                <tr key={i}>
                  <td className="feat">{r.feat}</td>
                  <td className="mep">{withBold(r.mep)}</td>
                  <td className="oth">{r.oth}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Reveal>
      </div>
    </section>
  );
}
