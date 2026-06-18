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

    const run = () => {
      nums.forEach((n) => {
        const target = parseFloat(n.getAttribute("data-count") || "0");
        if (reduce || target === 0) {
          n.textContent = String(target);
          return;
        }
        const dur = 1100;
        let start: number | null = null;
        const step = (ts: number) => {
          if (start === null) start = ts;
          const p = Math.min((ts - start) / dur, 1);
          n.textContent = String(Math.round(target * (1 - Math.pow(1 - p, 3))));
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
      { threshold: 0.3 },
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
              {s.prefix}
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
