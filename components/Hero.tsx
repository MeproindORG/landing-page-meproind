import { MessageCircle, ArrowDown, BadgeCheck } from "lucide-react";
import { wa } from "@/lib/whatsapp";

export default function Hero() {
  return (
    <section className="hero">
      <div className="wrap">
        <div className="reveal in" style={{ maxWidth: 680 }}>
          <span className="eyebrow">Especialistas en recuperación de oro</span>
          <h1 style={{ marginTop: 18 }}>
            Recupera más Oro
            <br />
            <span className="mark">Sin Mercurio</span>
            <br />
            Sin depender de Nadie
          </h1>
          <p className="lead">
            Mesas gravimétricas de alta precisión, fabricadas en el Perú. Separación
            únicamente con agua — captura partículas finas y gruesas, sin químicos tóxicos.
          </p>
          <div className="hero-cta">
            <a className="btn btn-o" href={wa()} target="_blank" rel="noopener">
              <MessageCircle />
              Solicitar cotización
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
