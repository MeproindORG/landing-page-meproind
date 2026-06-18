import { Star } from "lucide-react";
import Reveal from "./Reveal";
import { TESTIMONIALS } from "@/lib/content";

export default function Testimonials() {
  return (
    <section className="section" style={{ background: "var(--panel)" }}>
      <div className="wrap">
        <Reveal className="shead center">
          <span className="eyebrow">Testimonios</span>
          <h2>
            Lo que dicen <span className="o">nuestros clientes</span>
          </h2>
        </Reveal>
        <Reveal className="tgrid">
          {TESTIMONIALS.map((t) => (
            <figure className="tcard" key={t.name}>
              <img src={t.img} alt={t.name} />
              <div className="tstars">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} />
                ))}
              </div>
              <blockquote>&ldquo;{t.quote}&rdquo;</blockquote>
              <figcaption>
                <b>{t.name}</b>
                {t.company}
              </figcaption>
            </figure>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
