"use client";

import { useEffect, useState } from "react";
import { MessageCircle, Menu, X } from "lucide-react";
import { NAV_LINKS, SITE } from "@/lib/content";
import { wa } from "@/lib/whatsapp";

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Cerrar el menú móvil con Escape o al hacer clic fuera del header.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const onDocClick = (e: MouseEvent) => {
      if (!(e.target as Element).closest("header")) setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    document.addEventListener("click", onDocClick);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("click", onDocClick);
    };
  }, [open]);

  const close = () => setOpen(false);
  const headerClass = `${scrolled ? "scrolled" : ""}${open ? " menu-open" : ""}`.trim();

  return (
    <header className={headerClass}>
      <div className="wrap nav">
        <a className="brand" href="#top" aria-label="Meproind — inicio" onClick={close}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/img/landing/logo-white.png"
            alt="Meproind"
            style={{ height: "clamp(42px,6vw,64px)", width: "auto", display: "block" }}
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
        <button
          className="nav-toggle"
          type="button"
          aria-label={open ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X /> : <Menu />}
        </button>
      </div>

      {/* Menú móvil (≤920px) */}
      <div className={open ? "mobile-menu open" : "mobile-menu"}>
        <nav className="mobile-links" onClick={close}>
          {NAV_LINKS.map((l) => (
            <a key={l.href} href={l.href}>
              {l.label}
            </a>
          ))}
        </nav>
        <div className="mobile-cta">
          <a
            className="btn btn-o"
            href={wa()}
            target="_blank"
            rel="noopener"
            onClick={close}
          >
            <MessageCircle />
            Cotizar por WhatsApp
          </a>
          <a className="btn btn-ghost" href={SITE.appUrl} onClick={close}>
            Acceso clientes
          </a>
        </div>
      </div>
    </header>
  );
}
