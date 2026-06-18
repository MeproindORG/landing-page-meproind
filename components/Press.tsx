import Reveal from "./Reveal";

export default function Press() {
  return (
    <section className="section" style={{ background: "var(--canvas)" }}>
      <div className="wrap">
        <Reveal className="shead center">
          <span className="eyebrow">En la prensa</span>
          <h2>
            Reportado por <span className="o">El Comercio</span>
          </h2>
        </Reveal>
        <Reveal style={{ maxWidth: 760, margin: "0 auto" }}>
          <img
            src="/img/landing/comercio.png"
            alt="Nota de El Comercio: Mesas gravimétricas para concentrar oro, una solución frente al mercurio"
            style={{
              width: "100%",
              borderRadius: "var(--r-lg)",
              border: "1px solid var(--line)",
              boxShadow: "var(--sh2)",
            }}
          />
        </Reveal>
      </div>
    </section>
  );
}
