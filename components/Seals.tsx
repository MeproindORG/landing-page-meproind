import Reveal from "./Reveal";

export default function Seals() {
  return (
    <section
      className="seals"
      style={{ background: "var(--dark)", padding: "clamp(44px,6vw,72px) 0", textAlign: "center" }}
    >
      <Reveal className="wrap">
        <img
          src="/img/landing/seals.png"
          alt="Garantía hasta 1 año, compra 100% segura, 91% de recuperación"
          style={{ maxWidth: 620, width: "100%", margin: "0 auto" }}
        />
      </Reveal>
    </section>
  );
}
