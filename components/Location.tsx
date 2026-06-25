import { MapPin, Navigation, MessageCircle } from "lucide-react";
import Reveal from "./Reveal";
import { WA_PHONE_DISPLAY, WA_PHONE_ALT_DISPLAY } from "@/lib/whatsapp";

export default function Location() {
  return (
    <section className="section location" style={{ background: "var(--canvas)" }}>
      <div className="wrap">
        <Reveal className="shead center">
          <span className="eyebrow">Visítenos</span>
          <h2>
            Nuestro local en <span className="o">Arequipa</span>
          </h2>
        </Reveal>
        <Reveal className="gold-wrap">
          <img
            src="/img/landing/local-arequipa.jpg"
            alt="Local Meproind en Arequipa — A.HH. Horacio Zeballos Gomez, Zona Industrial"
            style={{
              width: "100%",
              borderRadius: "var(--r-lg)",
              boxShadow: "var(--sh2)",
              border: "1px solid var(--line)",
            }}
          />
          <div>
            <span className="eyebrow">Ubicación estratégica</span>
            <h3 style={{ fontSize: "1.6rem", margin: "12px 0 14px" }}>
              Encuéntranos en Arequipa
            </h3>
            <p style={{ fontSize: "1.05rem", color: "var(--ink2)", marginBottom: 8 }}>
              A.HH. Horacio Zeballos Gomez, Sector 6, Mz 3 Lote 10. Av. Socabaya Uchumayo,
              Zona Industrial – Arequipa.
            </p>
            <p style={{ fontSize: ".95rem", color: "var(--ink3)", marginBottom: 22 }}>
              Búscanos como <b style={{ color: "var(--ink)" }}>MEPROIND</b> en Google Maps
              o Waze.
            </p>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <a
                className="btn btn-o"
                target="_blank"
                rel="noopener"
                href="https://www.google.com/maps/search/MEPROIND+Arequipa"
              >
                <MapPin />
                Google Maps
              </a>
              <a
                className="btn btn-ghost-ink"
                target="_blank"
                rel="noopener"
                href="https://www.waze.com/ul?q=MEPROIND%20Arequipa"
              >
                <Navigation />
                Waze
              </a>
            </div>
            <p style={{ fontSize: ".95rem", color: "var(--ink2)", marginTop: 20 }}>
              <MessageCircle
                style={{
                  width: 16,
                  height: 16,
                  display: "inline",
                  verticalAlign: -3,
                  color: "var(--wa)",
                }}
              />{" "}
              WhatsApp: <b style={{ color: "var(--ink)" }}>{WA_PHONE_DISPLAY}</b> ó{" "}
              <b style={{ color: "var(--ink)" }}>{WA_PHONE_ALT_DISPLAY}</b>
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
