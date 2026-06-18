import { MessageCircle, FileText } from "lucide-react";
import Reveal from "./Reveal";
import { wa } from "@/lib/whatsapp";

export default function CtaBand() {
  return (
    <section className="section ctaband" id="contacto">
      <Reveal className="wrap">
        <span className="eyebrow" style={{ justifyContent: "center", display: "flex" }}>
          Hablemos de su operación
        </span>
        <h2 style={{ marginTop: 16 }}>Aumente la recuperación de su planta</h2>
        <p>
          Cuéntenos su capacidad y el tipo de mineral. Le recomendamos el modelo ideal y le
          enviamos una cotización a su medida.
        </p>
        <div className="hero-cta">
          <a className="btn btn-wa" href={wa()} target="_blank" rel="noopener">
            <MessageCircle />
            Escribir por WhatsApp
          </a>
          <a
            className="btn btn-ghost"
            href={wa("Hola, deseo solicitar una cotización de las mesas gravimétricas Meproind.")}
            target="_blank"
            rel="noopener"
          >
            <FileText />
            Solicitar cotización
          </a>
        </div>
      </Reveal>
    </section>
  );
}
