import { MessageCircle } from "lucide-react";
import { SITE } from "@/lib/content";
import { wa, WA_PHONE_DISPLAY } from "@/lib/whatsapp";

export default function Footer() {
  return (
    <footer>
      <div className="wrap">
        <div className="fgrid">
          <div>
            <div className="brand">
              <img
                src="/img/landing/logo-white.png"
                alt="Meproind"
                style={{ height: 50, width: "auto" }}
              />
            </div>
            <p className="tag">
              Mejorando procesos industriales. Especialistas en mesas gravimétricas para la
              recuperación de oro y otros metales.
            </p>
          </div>
          <div>
            <h5>Modelos</h5>
            <ul>
              <li>
                <a href="#modelos">XL-25</a>
              </li>
              <li>
                <a href="#modelos">XL-50</a>
              </li>
              <li>
                <a href="#modelos">XL-75</a>
              </li>
              <li>
                <a href="#modelos">XL-100</a>
              </li>
            </ul>
          </div>
          <div>
            <h5>Empresa</h5>
            <ul>
              <li>
                <a href="#tecnologia">Tecnología</a>
              </li>
              <li>
                <a href="#comparativa">Comparativa</a>
              </li>
              <li>
                <a href="#contacto">Contacto</a>
              </li>
              <li>
                <a href={SITE.appUrl}>Acceso clientes</a>
              </li>
            </ul>
          </div>
          <div>
            <h5>Contacto</h5>
            <ul>
              <li>
                <a href={wa()} target="_blank" rel="noopener">
                  <MessageCircle
                    style={{ width: 15, height: 15, display: "inline", verticalAlign: -2 }}
                  />{" "}
                  WhatsApp: {WA_PHONE_DISPLAY}
                </a>
              </li>
              <li>
                <a href={`mailto:${SITE.email}`}>{SITE.email}</a>
              </li>
              <li>Arequipa: A.HH. Horacio Zeballos Gomez, Zona Industrial</li>
              <li>Lima: {SITE.lima}</li>
            </ul>
          </div>
        </div>
        <div className="fbottom">
          <span>© 2026 MEPROIND · {SITE.legal} Todos los derechos reservados.</span>
          <span>Mesas gravimétricas XL-25 · XL-50 · XL-75 · XL-100</span>
        </div>
      </div>
    </footer>
  );
}
