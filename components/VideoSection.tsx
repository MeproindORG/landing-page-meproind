import Reveal from "./Reveal";

export default function VideoSection() {
  return (
    <section className="section" style={{ background: "var(--panel)" }}>
      <div className="wrap">
        <Reveal className="shead center">
          <span className="eyebrow">Conoce Meproind</span>
          <h2>
            Vea nuestras mesas <span className="o">en acción</span>
          </h2>
        </Reveal>
        <Reveal
          style={{
            maxWidth: 880,
            margin: "0 auto",
            borderRadius: "var(--r-lg)",
            overflow: "hidden",
            boxShadow: "var(--sh3)",
            border: "1px solid var(--line)",
          }}
        >
          <video
            controls
            preload="metadata"
            playsInline
            poster="/img/landing/m3.jpg"
            style={{ width: "100%", maxHeight: "74vh", display: "block", background: "#000" }}
          >
            <source src="/video/presentacion.mp4" type="video/mp4" />
            Su navegador no soporta la reproducción de video.
          </video>
        </Reveal>
      </div>
    </section>
  );
}
