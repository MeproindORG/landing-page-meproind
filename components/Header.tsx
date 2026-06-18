"use client";

import { useEffect, useState } from "react";
import { MessageCircle } from "lucide-react";
import { NAV_LINKS, SITE } from "@/lib/content";
import { wa } from "@/lib/whatsapp";

export default function Header() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={scrolled ? "scrolled" : ""}>
      <div className="wrap nav">
        <a className="brand" href="#top" aria-label="Meproind — inicio">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/img/landing/logo-white.png"
            alt="Meproind"
            style={{ height: "clamp(46px,6.4vw,68px)", width: "auto", display: "block" }}
          />
        </a>
        <nav className="nav-links">
          {NAV_LINKS.map((l) => (
            <a key={l.href} href={l.href}>
              {l.label}
            </a>
          ))}
        </nav>
        <div className="nav-cta">
          <a className="btn btn-ghost btn-sm" href={SITE.appUrl}>
            Acceso clientes
          </a>
          <a className="btn btn-o btn-sm" href={wa()} target="_blank" rel="noopener">
            <MessageCircle />
            Cotizar
          </a>
        </div>
      </div>
    </header>
  );
}
