import Reveal from "./Reveal";

export default function ValueBand() {
  return (
    <section
      style={{
        background: "var(--dark)",
        color: "#fff",
        textAlign: "center",
        padding: "46px 0",
        borderTop: "1px solid var(--dark-line)",
        borderBottom: "1px solid var(--dark-line)",
      }}
    >
      <Reveal className="wrap">
        <p
          style={{
            fontFamily: "var(--fhead)",
            fontWeight: 800,
            fontSize: "clamp(1.3rem,2.7vw,2.05rem)",
            lineHeight: 1.22,
            maxWidth: 920,
            margin: "0 auto",
            color: "#fff",
          }}
        >
          <span style={{ color: "var(--o)" }}>10% más de recuperación de oro</span> que
          cualquier otra mesa en el Perú. Por cada 10 kilos, eso significa{" "}
          <span style={{ color: "var(--o)" }}>1 kilo —o US$ 77,000— más</span> para su
          operación.
        </p>
      </Reveal>
    </section>
  );
}
