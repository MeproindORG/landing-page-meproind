import { MessageCircle, Download, FileDown } from "lucide-react";
import Reveal from "./Reveal";
import { MODELS } from "@/lib/content";
import { wa } from "@/lib/whatsapp";

export default function Models() {
  return (
    <section className="section models" id="modelos">
      <div className="wrap">
        <Reveal className="shead center">
          <span className="eyebrow">Línea XL</span>
          <h2>
            Elija la mesa ideal <span className="o">para su operación</span>
          </h2>
          <p className="lead" style={{ margin: "0 auto" }}>
            Desde la minería artesanal hasta la producción industrial. Todos los modelos
            con hasta 91% de recuperación.
          </p>
        </Reveal>
        <Reveal className="mgrid">
          {MODELS.map((m) => (
            <div className={m.popular ? "mcard pop" : "mcard"} key={m.code}>
              {m.popular && <span className="pop-badge">Más popular</span>}
              <img className="photo" src={m.img} alt={m.alt} />
              <div className="mbody">
                <a
                  className="btn btn-wa btn-sm"
                  href={wa(m.waMsg)}
                  target="_blank"
                  rel="noopener"
                >
                  <MessageCircle />
                  Consultar
                </a>
                <a className="btn btn-ghost-ink btn-sm" target="_blank" href={m.plano}>
                  <Download />
                  Descargar plano
                </a>
              </div>
            </div>
          ))}
        </Reveal>
        <Reveal style={{ textAlign: "center", marginTop: 34 }}>
          <a className="btn btn-ghost-ink" target="_blank" href="/planos/xl-100.pdf">
            <FileDown />
            Descargar ficha técnica completa
          </a>
        </Reveal>
      </div>
    </section>
  );
}
