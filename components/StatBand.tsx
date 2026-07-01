"use client";

import { useEffect, useRef } from "react";
import { STATS } from "@/lib/content";

export default function StatBand() {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let counted = false;
    const nums = Array.from(el.querySelectorAll<HTMLElement>("[data-count]"));
    const easeOutQuart = (p: number) => 1 - Math.pow(1 - p, 4);

    const run = () => {
      el.classList.add("in"); // dispara la entrada (fade + slide-up con stagger por CSS)
      nums.forEach((n, i) => {
        const target = parseFloat(n.getAttribute("data-count") || "0");
        if (reduce) {
          n.textContent = String(target);
          return;
        }
        const dur = 2200;
        const delay = i * 180; // el conteo entra escalonado, en sync con la entrada
        let start: number | null = null;
        const step = (ts: number) => {
          if (start === null) start = ts;
          const t = ts - start - delay;
          if (t < 0) {
            requestAnimationFrame(step);
            return;
          }
          const p = Math.min(t / dur, 1);
          n.textContent = String(Math.round(target * easeOutQuart(p)));
          if (p < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      });
    };

    const io = new IntersectionObserver(
      (es) => {
        es.forEach((en) => {
          if (en.isIntersecting && !counted) {
            counted = true;
            run();
          }
        });
      },
      { threshold: 0.55, rootMargin: "0px 0px -80px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section className="statband" ref={ref}>
      <div className="wrap">
        {STATS.map((s, i) => (
          <div className="stat" key={i}>
            <div className={s.accent ? "n o" : "n"}>
              {s.prefix && <span className="pfx">{s.prefix}</span>}
              {s.count !== null ? <span data-count={s.count}>0</span> : s.text}
              {s.suffix}
            </div>
            <div className="l">{s.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
