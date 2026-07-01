import { MessageCircle, ArrowDown, BadgeCheck } from "lucide-react";
import { wa } from "@/lib/whatsapp";

export default function Hero() {
  return (
    <section className="hero">
      {/* Fondo rotativo SOLO en celular (3 fotos, crossfade CSS). Oculto en desktop/tablet. */}
      <div className="hero-mshots" aria-hidden="true">
        <div className="hero-mshot" style={{ backgroundImage: "url('/img/landing/hero-m1.jpg')" }} />
        <div className="hero-mshot" style={{ backgroundImage: "url('/img/landing/hero-m2.jpg')" }} />
        <div className="hero-mshot" style={{ backgroundImage: "url('/img/landing/hero-m3.jpg')" }} />
      </div>
      <div className="wrap">
        <div className="reveal in" style={{ maxWidth: 680 }}>
          <h1 style={{ marginTop: 0 }}>
            <span className="hl-top">Recupera MÁS ORO</span>
            <br />
            <span className="mark">SIN MERCURIO</span>
            <br />
            <span className="hl-bot">sin depender de nadie</span>
          </h1>
          <p className="lead">
            Mesas gravimétricas hechas en Perú que recuperan hasta el 91% en el
            concentrado de tu mineral utilizando solo agua y electricidad.
          </p>
          <div className="hero-cta">
            <a className="btn btn-o" href={wa()} target="_blank" rel="noopener">
              <MessageCircle />
              Prueba gratis
            </a>
            <a className="btn btn-ghost" href="#modelos">
              Ver modelos
              <ArrowDown />
            </a>
          </div>
          <div className="hero-trust">
            <BadgeCheck />
            Tecnología propia GoldTech Pro Slots® · Fabricación en Arequipa, Perú
          </div>
        </div>
      </div>
    </section>
  );
}
