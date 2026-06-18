import { Microscope, Cpu, ShieldCheck, Leaf } from "lucide-react";
import { TRUST_ITEMS } from "@/lib/content";

const ICONS = { Microscope, Cpu, ShieldCheck, Leaf } as const;

export default function TrustStrip() {
  return (
    <section className="trust">
      <div className="wrap">
        {TRUST_ITEMS.map((t) => {
          const Icon = ICONS[t.icon as keyof typeof ICONS];
          return (
            <div className="ti" key={t.label}>
              <Icon />
              {t.label}
            </div>
          );
        })}
      </div>
    </section>
  );
}
