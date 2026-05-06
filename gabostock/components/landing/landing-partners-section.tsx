import { cn } from "@/lib/utils/cn";
import Image from "next/image";
import { ScrollReveal } from "./scroll-reveal";

export type LandingPartner = {
  name: string;
  /** Optional: /public/... path or remote URL (if configured) */
  logoSrc?: string | null;
};

function PartnerLogo({ name, logoSrc }: { name: string; logoSrc?: string | null }) {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");

  return (
    <div
      className={cn(
        "grid h-14 w-14 place-items-center rounded-full",
        "border border-black/[0.06] bg-white shadow-sm",
      )}
      style={{
        background:
          "radial-gradient(circle at 30% 30%, color-mix(in srgb, var(--fs-accent) 16%, white), white 62%)",
      }}
      aria-hidden
    >
      {logoSrc?.trim() ? (
        <div className="relative grid h-11 w-11 place-items-center overflow-hidden rounded-full bg-white">
          <Image src={logoSrc} alt="" fill className="object-contain p-1.5" sizes="44px" />
        </div>
      ) : (
      <div
        className="grid h-11 w-11 place-items-center rounded-full"
        style={{
          background:
            "conic-gradient(from 180deg, color-mix(in srgb, var(--fs-accent) 70%, white), color-mix(in srgb, var(--fs-brand-stock) 70%, white), color-mix(in srgb, var(--fs-accent) 70%, white))",
        }}
      >
        <div className="grid h-[42px] w-[42px] place-items-center rounded-full bg-white text-[0.85rem] font-extrabold tracking-tight text-fs-text">
          {initials || "P"}
        </div>
      </div>
      )}
    </div>
  );
}

export function LandingPartnersSection({
  partners,
  title,
  subtitle,
}: {
  partners: LandingPartner[];
  title?: string | null;
  subtitle?: string | null;
}) {
  // Duplicate items for seamless marquee.
  const items = [...partners, ...partners];

  return (
    <section className="border-b border-neutral-200/80 bg-fs-surface py-14 dark:border-neutral-700/80 sm:py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <header className="text-center">
            <h2 className="text-[1.9rem] font-extrabold tracking-tight text-fs-text sm:text-4xl">
              <span className="bg-gradient-to-r from-fs-accent to-[var(--fs-brand-stock)] bg-clip-text text-transparent">
                {title?.trim() || "Nos partenaires"}
              </span>
            </h2>
            <div className="mx-auto mt-3 h-[3px] w-16 rounded-full bg-gradient-to-r from-fs-accent to-[var(--fs-brand-stock)]" />
            <p className="mx-auto mt-5 max-w-2xl text-[1rem] leading-relaxed text-fs-on-surface-variant">
              {subtitle ?? "Ils nous font confiance — et nous avançons avec eux."}
            </p>
          </header>
        </ScrollReveal>

        <ScrollReveal delayMs={120}>
          <div className="relative mt-10 overflow-hidden">
          {/* Fade edges */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-y-0 left-0 z-[2] w-16 bg-gradient-to-r from-fs-surface to-transparent dark:from-[var(--fs-surface)]"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-y-0 right-0 z-[2] w-16 bg-gradient-to-l from-fs-surface to-transparent dark:from-[var(--fs-surface)]"
          />

          <div className="landing-marquee group flex w-max gap-6 py-2">
            {items.map((p, idx) => (
              <div
                key={`${p.name}-${idx}`}
                className={cn(
                  "flex w-[240px] shrink-0 flex-col items-center justify-center gap-3 rounded-2xl",
                  "border border-black/[0.06] bg-white px-6 py-6 shadow-[0_18px_40px_-30px_rgba(0,0,0,0.35)]",
                  "dark:border-white/10 dark:bg-[color-mix(in_oklab,var(--fs-card)_88%,black)]",
                )}
              >
                <PartnerLogo name={p.name} logoSrc={p.logoSrc ?? null} />
                <p className="text-center text-xs font-bold uppercase tracking-[0.08em] text-fs-on-surface-variant">
                  {p.name}
                </p>
              </div>
            ))}
          </div>

          {/* Pause on hover */}
          <div className="pointer-events-none absolute inset-0 z-[3] group-hover:[&_.landing-marquee]:[animation-play-state:paused]" />
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}

