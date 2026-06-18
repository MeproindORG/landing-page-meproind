import { Sparkles, Target, TrendingUp, Sun, MessageCircle } from "lucide-react";
import Reveal from "./Reveal";
import { wa } from "@/lib/whatsapp";

export default function GoldTech() {
  return (
    <section className="section gold" id="tecnologia">
      <div className="wrap">
        <div className="gold-wrap">
          <Reveal className="gold-visual">
            <img
              src="/img/landing/goldtech.jpg"
              alt="Ranuras GoldTech Pro Slots de la mesa Meproind"
            />
          </Reveal>
          <Reveal>
            <span className="gtag">
              <Sparkles style={{ width: 15, height: 15 }} />
              Tecnología propia
            </span>
            <h2>GoldTech Pro Slots®</h2>
            <p className="lead">
              La tecnología de ranuras más avanzada en recuperación de oro, desarrollada
              en colaboración con científicos e ingenieros de mina para capturar hasta la
              partícula más fina y difícil.
            </p>
            <ul className="gold-points">
              <li>
                <Target />
                Geometría optimizada que retiene oro fino que otras mesas dejan escapar.
              </li>
              <li>
                <TrendingUp />
                Eficiencia de recuperación sin precedentes — hasta 91% — y mayor retorno
                sobre la inversión.
              </li>
              <li>
                <Sun />
                Funciona con paneles solares para sitios remotos.
              </li>
            </ul>
            <div className="hero-cta" style={{ marginTop: 28 }}>
              <a
                className="btn btn-o"
                href={wa(
                  "Hola, deseo más información sobre la tecnología GoldTech Pro Slots de Meproind.",
                )}
                target="_blank"
                rel="noopener"
              >
                <MessageCircle />
                Solicitar más información
              </a>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
