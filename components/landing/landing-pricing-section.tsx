import Link from "next/link";
import { Check } from "lucide-react";
import { ROUTES } from "@/lib/config/routes";
import { cn } from "@/lib/utils/cn";
import { ScrollReveal } from "./scroll-reveal";

function Price({ value, suffix }: { value: string; suffix: string }) {
  return (
    <div className="mt-4 flex items-end justify-center gap-2">
      <span className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
        {value}
      </span>
      <span className="pb-1 text-sm font-semibold text-white/65">{suffix}</span>
    </div>
  );
}

function FeatureItem({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2.5 text-sm leading-relaxed text-white/70">
      <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-fs-accent/10 text-fs-accent">
        <Check className="h-4 w-4" aria-hidden />
      </span>
      <span>{children}</span>
    </li>
  );
}

export function LandingPricingSection() {
  return (
    <section
      id="abonnement"
      className="scroll-mt-20 border-b border-white/[0.08] bg-[#050A18] py-16 sm:py-20"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <header className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-fs-accent">
              Abonnement
            </p>
            <h2 className="mt-4 text-balance text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              Choisissez le plan qui correspond{" "}
              <span className="bg-gradient-to-r from-fs-accent to-[var(--fs-brand-stock)] bg-clip-text text-transparent">
                à votre activité
              </span>
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-[1.03rem] leading-relaxed text-white/70">
              Des formules simples, flexibles et adaptées à tous les types de commerces.
              Commencez gratuitement, puis évoluez selon vos besoins.
            </p>
          </header>
        </ScrollReveal>

        <div className="mt-12 grid gap-6 lg:grid-cols-3 lg:items-stretch">
          <ScrollReveal delayMs={80}>
            <article className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0a101f] p-8 shadow-[0_30px_60px_-45px_rgba(0,0,0,0.9)] transition hover:border-white/20">
              <div
                aria-hidden
                className="pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full opacity-[0.16] blur-2xl"
                style={{
                  background:
                    "radial-gradient(circle at 30% 30%, var(--fs-brand-stock), transparent 62%)",
                }}
              />
              <p className="inline-flex items-center rounded-full border border-[var(--fs-brand-stock)]/25 bg-[var(--fs-brand-stock)]/10 px-3 py-1 text-xs font-extrabold uppercase tracking-[0.12em] text-[var(--fs-brand-stock)]">
                Gratuit
              </p>
              <h3 className="mt-4 text-xl font-extrabold tracking-tight text-white">
                Essai gratuit
              </h3>
              <Price value="7 jours" suffix="" />

              <ul className="mt-7 space-y-3">
                <FeatureItem>Accès complet</FeatureItem>
                <FeatureItem>Aucune carte requise</FeatureItem>
                <FeatureItem>Support inclus</FeatureItem>
              </ul>

              <Link
                href={ROUTES.registerSelectActivity}
                className="mt-8 inline-flex w-full items-center justify-center rounded-2xl border border-white/15 bg-[#0b1222] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0d162a]"
              >
                Commencer l’essai gratuit
              </Link>
            </article>
          </ScrollReveal>

          <ScrollReveal delayMs={120}>
            <article
              className={cn(
                "relative overflow-hidden rounded-3xl p-[1px] shadow-sm transition hover:shadow-lg",
                "bg-gradient-to-br from-fs-accent/70 via-fs-accent/25 to-[var(--fs-brand-stock)]/60",
              )}
            >
              <div className="relative h-full rounded-3xl bg-[#0a101f] p-8">
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0 opacity-[0.18]"
                  style={{
                    background:
                      "radial-gradient(ellipse 520px 300px at 50% 0%, var(--fs-accent), transparent 62%)",
                  }}
                />
                <p className="mx-auto inline-flex w-fit items-center rounded-full bg-fs-accent px-3 py-1 text-xs font-extrabold uppercase tracking-[0.12em] text-white shadow-sm shadow-fs-accent/25">
                  Populaire
                </p>
                <h3 className="mt-4 text-center text-xl font-extrabold tracking-tight text-white">
                  Annuel
                </h3>
                <div className="text-center">
                  <p className="mt-5 text-xs font-extrabold uppercase tracking-[0.18em] text-red-500">
                    À partir de
                  </p>
                  <Price value="300 000" suffix="FCFA / an" />
                </div>

                <ul className="mt-7 space-y-3">
                  <FeatureItem>Tout le plan mensuel</FeatureItem>
                  <FeatureItem>Économisez vs paiement mensuel</FeatureItem>
                  <FeatureItem>Facturation unique</FeatureItem>
                </ul>

                <Link
                  href={ROUTES.registerSelectActivity}
                  className="mt-8 inline-flex w-full items-center justify-center rounded-2xl bg-fs-accent px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-fs-accent/25 transition hover:opacity-95"
                >
                  Choisir le plan annuel
                </Link>
              </div>
            </article>
          </ScrollReveal>

          <ScrollReveal delayMs={160}>
            <article className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0a101f] p-8 shadow-[0_30px_60px_-45px_rgba(0,0,0,0.9)] transition hover:border-white/20">
              <div
                aria-hidden
                className="pointer-events-none absolute -left-12 -top-12 h-36 w-36 rounded-full opacity-[0.16] blur-2xl"
                style={{
                  background:
                    "radial-gradient(circle at 30% 30%, var(--fs-accent), transparent 62%)",
                }}
              />
              <p className="inline-flex items-center rounded-full border border-fs-accent/25 bg-fs-accent/10 px-3 py-1 text-xs font-extrabold uppercase tracking-[0.12em] text-fs-accent">
                Flexible
              </p>
              <h3 className="mt-4 text-xl font-extrabold tracking-tight text-white">Mensuel</h3>
              <div className="text-center">
                <p className="mt-5 text-xs font-extrabold uppercase tracking-[0.18em] text-red-500">
                  À partir de
                </p>
                <Price value="40 000" suffix="FCFA / mois" />
              </div>

              <ul className="mt-7 space-y-3">
                <FeatureItem>Toutes les fonctionnalités</FeatureItem>
                <FeatureItem>Multi-boutiques & utilisateurs</FeatureItem>
                <FeatureItem>Mises à jour incluses</FeatureItem>
              </ul>

              <Link
                href={ROUTES.registerSelectActivity}
                className="mt-8 inline-flex w-full items-center justify-center rounded-2xl border border-fs-accent/30 bg-fs-accent/10 px-5 py-3 text-sm font-semibold text-fs-accent transition hover:bg-fs-accent/15"
              >
                Choisir le plan mensuel
              </Link>
            </article>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}

