import { LAN } from "./landing-apple-tokens";
import { cn } from "@/lib/utils/cn";
import type { LucideIcon } from "lucide-react";
import {
  CheckCircle2,
  Cloud,
  CreditCard,
  Headphones,
  LineChart,
  Package,
  Printer,
  Shield,
  ShoppingCart,
  Star,
  Users,
  Zap,
} from "lucide-react";
import type { CSSProperties } from "react";
import Image from "next/image";

const LEFT_SOLUTIONS = [
  {
    title: "Suivi des ventes",
    body: "Enregistrez vos ventes en temps réel et suivez vos performances au quotidien.",
    icon: ShoppingCart,
    tint: "#007AFF",
  },
  {
    title: "Gestion du stock",
    body: "Contrôlez vos stocks en temps réel, recevez des alertes et évitez les ruptures ou les surstocks.",
    icon: Package,
    tint: "#34C759",
  },
  {
    title: "Crédits clients",
    body: "Gérez les crédits, suivez les paiements et réduisez les impayés simplement.",
    icon: CreditCard,
    tint: "#FF9500",
  },
] as const;

const RIGHT_SOLUTIONS = [
  {
    title: "Gestion des employés",
    body: "Ajoutez vos employés, définissez leurs rôles et suivez leurs performances.",
    icon: Users,
    tint: "#AF52DE",
  },
  {
    title: "Rapports & Analyses",
    body: "Accédez à des rapports clairs et détaillés pour prendre les meilleures décisions.",
    icon: LineChart,
    tint: "#34C759",
  },
  {
    title: "Tickets & Factures",
    body: "Imprimez des tickets de caisse et des factures professionnelles en quelques clics.",
    icon: Printer,
    tint: "#FF9500",
  },
] as const;

const BOTTOM_PILLS = [
  {
    title: "Sécurisé",
    body: "Vos données sont protégées à 100%.",
    icon: Shield,
    tint: "#007AFF",
  },
  {
    title: "Accessible partout",
    body: "Sur ordinateur, tablette et mobile.",
    icon: Cloud,
    tint: "#34C759",
  },
  {
    title: "Rapide & intuitif",
    body: "Une interface simple pour gagner du temps.",
    icon: Zap,
    tint: "#FF9500",
  },
  {
    title: "Support réactif",
    body: "Notre équipe est là pour vous accompagner.",
    icon: Headphones,
    tint: "#AF52DE",
  },
  {
    title: "Mises à jour régulières",
    body: "De nouvelles fonctionnalités pour vous simplifier la vie.",
    icon: CheckCircle2,
    tint: "#007AFF",
  },
] as const;

function SolutionFeatureCard({
  title,
  body: desc,
  icon: Icon,
  tint,
}: {
  title: string;
  body: string;
  icon: LucideIcon;
  tint: string;
}) {
  return (
    <article
      className={cn(
        "group relative overflow-hidden rounded-[1.05rem] border border-white/[0.1] bg-[#0a1224]/80 p-[1.05rem_1.15rem] shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_0_0_1px_rgba(255,255,255,0.02)] backdrop-blur-md",
        "transition hover:border-white/[0.16] hover:bg-[#0c1528]/90",
        "sm:p-[1.125rem_1.25rem]",
      )}
    >
      <div
        className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full opacity-[0.12] blur-2xl transition group-hover:opacity-20"
        style={{ backgroundColor: tint }}
        aria-hidden
      />
      <div className="relative flex gap-3.5 sm:gap-4">
        <span
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[0.8rem] shadow-[0_0_20px_-4px] transition group-hover:brightness-110"
          style={{ backgroundColor: `${tint}2a`, color: tint, boxShadow: `0 0 24px -6px ${tint}55` } as CSSProperties}
        >
          <Icon className="h-6 w-6" strokeWidth={2.1} aria-hidden />
        </span>
        <div className="min-w-0">
          <h3 className="text-[0.98rem] font-bold leading-snug tracking-[-0.02em] text-white sm:text-base">
            {title}
          </h3>
          <p className="mt-1.5 text-[0.8125rem] leading-[1.55] text-neutral-400 sm:text-[0.86rem]">{desc}</p>
        </div>
      </div>
    </article>
  );
}

function SolutionCircuitBackdrop({ className }: { className?: string }) {
  return (
    <div className={cn("pointer-events-none absolute inset-0 z-0 overflow-hidden", className)} aria-hidden>
      <svg
        className="absolute left-1/2 top-1/2 h-[min(100%,48rem)] w-full max-w-[100rem] -translate-x-1/2 -translate-y-1/2 opacity-[0.35]"
        viewBox="0 0 1200 600"
        fill="none"
      >
        <path
          d="M 120 200 Q 300 100 400 300 T 600 300"
          stroke="url(#c1)"
          strokeWidth="1.2"
          className="opacity-80"
        />
        <path
          d="M 1080 200 Q 900 100 800 300 T 600 300"
          stroke="url(#c2)"
          strokeWidth="1.2"
          className="opacity-80"
        />
        <path
          d="M 100 400 Q 300 500 500 300 L 600 300 L 700 300 Q 900 500 1100 400"
          stroke="url(#c1)"
          strokeWidth="0.9"
          opacity="0.45"
        />
        <defs>
          <linearGradient id="c1" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={LAN.blue} stopOpacity="0" />
            <stop offset="50%" stopColor={LAN.blue} stopOpacity="0.5" />
            <stop offset="100%" stopColor={LAN.green} stopOpacity="0" />
          </linearGradient>
          <linearGradient id="c2" x1="100%" y1="0%" x2="0%" y2="0%">
            <stop offset="0%" stopColor={LAN.green} stopOpacity="0" />
            <stop offset="50%" stopColor={LAN.green} stopOpacity="0.45" />
            <stop offset="100%" stopColor={LAN.blue} stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

/** Section solution complète — placée après « défis / problèmes des commerçants ». */
export function GabostockSolutionShowcaseSection() {
  return (
    <section
      id="solution"
      className="relative scroll-mt-20 overflow-hidden border-b border-white/[0.07] py-[3.5rem] sm:py-16 md:py-[4.5rem]"
      style={{
        background: `linear-gradient(180deg, ${LAN.bg} 0%, #030814 48%, #050A18 100%)`,
      }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute right-0 top-0 h-[min(50%,24rem)] w-[min(70%,32rem)] opacity-[0.2]"
        style={{
          background: `radial-gradient(ellipse at top right, color-mix(in srgb, ${LAN.blue} 32%, transparent), transparent 60%)`,
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%3E%3Ccircle%20cx%3D%222%22%20cy%3D%222%22%20r%3D%220.5%22%20fill%3D%22rgba%28255%2C255%2C255%2C0.04%29%22%2F%3E%3C%2Fsvg%3E')] [mask-image:radial-gradient(ellipse_60%_50%_at_100%_0%2Cblack,transparent)] opacity-50"
        aria-hidden
      />

      <div className="relative z-[1] mx-auto max-w-[90rem] px-4 sm:px-6 xl:px-12">
        <header className="mb-10 max-w-3xl sm:mb-12 lg:mb-14">
          <div className="mb-6 inline-flex max-w-full flex-wrap items-center gap-x-2.5 gap-y-2 rounded-full border border-[#007AFF]/45 bg-black/40 px-4 py-2 text-[11px] font-extrabold uppercase leading-snug tracking-[0.08em] text-white/90 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-sm sm:text-[12px]">
            <Star
              className="h-[15px] w-[15px] min-h-[15px] shrink-0 fill-[#007AFF] text-[#007AFF]"
              aria-hidden
            />
            <span className="text-[#cce3ff]/95">LA SOLUTION </span>
            <span className="text-white">GABOSTOCK</span>
          </div>
          <h2
            className="text-balance text-[1.6rem] font-extrabold leading-[1.1] tracking-[-0.03em] text-white sm:text-4xl lg:text-[2.4rem] xl:max-w-[40rem] xl:text-[2.5rem]"
          >
            Une solution complète pour gérer{" "}
            <span className="text-[#3b8bff]">votre commerce</span> en toute{" "}
            <span className="text-[#34C759]">simplicité</span>
            <span className="text-white">.</span>
          </h2>
          <p className="mt-5 max-w-2xl text-[1.02rem] leading-relaxed text-neutral-400 sm:mt-6 sm:text-[1.0625rem]">
            GaboStock centralise toutes les opérations de votre activité dans une seule plateforme. Plus de{" "}
            <strong className="font-semibold text-[#3b8bff]">visibilité</strong>, plus de{" "}
            <strong className="font-semibold text-[#34C759]">contrôle</strong>, plus de{" "}
            <strong className="font-semibold text-[#4ade80]">performance</strong>
            <span className="text-neutral-400">.</span>
          </p>
        </header>

        <div className="relative">
          <SolutionCircuitBackdrop className="hidden min-[1024px]:block" />

          <div className="relative z-[1] grid grid-cols-1 gap-8 min-[1024px]:grid-cols-[1fr_minmax(260px,0.9fr)_1fr] min-[1024px]:items-center min-[1024px]:gap-6 min-[1200px]:gap-8 xl:gap-10">
            <div className="order-2 flex min-w-0 flex-col gap-4 min-[1024px]:order-1 min-[1024px]:gap-4 xl:gap-5">
              {LEFT_SOLUTIONS.map((item) => (
                <SolutionFeatureCard key={item.title} {...item} />
              ))}
            </div>

            <div className="order-1 mx-auto w-full max-w-[min(400px,92vw)] min-[1024px]:order-2 min-[1024px]:max-w-[min(420px,36vw)]">
              <div className="group relative">
                <div
                  className="pointer-events-none absolute -inset-3 rounded-[1.5rem] opacity-50 blur-2xl transition group-hover:opacity-70"
                  style={{
                    background: `radial-gradient(closest-side, color-mix(in srgb, ${LAN.blue} 32%, transparent), color-mix(in srgb, ${LAN.green} 20%, transparent), transparent 70%)`,
                  }}
                  aria-hidden
                />
                <figure
                  className="relative z-[1] aspect-[3/3.4] w-full overflow-hidden rounded-[1.15rem] border border-white/10 bg-[#0a1224] shadow-[0_32px_80px_-32px_rgba(0,60,200,0.5)] transition duration-500 ease-out group-hover:-translate-y-1"
                >
                  <Image
                    src="/landing/solution-commerce.png"
                    alt="Commerçant tenant le téléphone avec le tableau de bord GaboStock"
                    fill
                    className="object-cover object-[50%_15%]"
                    sizes="(max-width: 1023px) 92vw, min(36vw, 420px)"
                    priority={false}
                  />
                </figure>
              </div>
            </div>

            <div className="order-3 flex min-w-0 flex-col gap-4 min-[1024px]:gap-4 xl:gap-5">
              {RIGHT_SOLUTIONS.map((item) => (
                <SolutionFeatureCard key={item.title} {...item} />
              ))}
            </div>
          </div>
        </div>

        <div className="relative z-[1] mt-12 sm:mt-14 lg:mt-16">
          <div className="overflow-hidden rounded-[1.1rem] border border-[#007AFF]/30 bg-gradient-to-b from-[#0a1020]/95 to-[#080f1c]/95 p-[1.15rem] shadow-[0_24px_64px_-40px_rgba(0,100,255,0.25)] backdrop-blur-md sm:rounded-2xl sm:p-6 lg:p-8">
            <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:gap-8 xl:gap-10">
              <div className="flex shrink-0 items-start gap-3 sm:items-center sm:gap-4 lg:max-w-[22rem] xl:max-w-[24rem]">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center sm:h-16 sm:w-16">
                  <Image
                    src="/logogabostock.png"
                    alt=""
                    width={64}
                    height={64}
                    className="h-12 w-12 object-contain sm:h-14 sm:w-14"
                  />
                </div>
                <p className="text-left text-[0.98rem] font-medium leading-relaxed text-white sm:text-base lg:leading-normal">
                  GaboStock, c&apos;est plus qu&apos;un logiciel, c&apos;est votre{" "}
                  <span className="bg-gradient-to-r from-[#007AFF] to-[#34C759] bg-clip-text font-bold text-transparent">
                    partenaire de croissance
                  </span>
                  .
                </p>
              </div>

              <div className="h-px w-full bg-gradient-to-r from-transparent via-white/15 to-transparent lg:hidden" />

              <div className="grid w-full min-w-0 flex-1 gap-3 sm:grid-cols-2 sm:gap-3 lg:grid-cols-5 lg:gap-2 xl:gap-3">
                {BOTTOM_PILLS.map(({ title, body, icon: Ico, tint }) => (
                  <div
                    key={title}
                    className="flex min-w-0 flex-col items-center gap-1.5 rounded-lg border border-white/[0.06] bg-white/[0.02] px-2 py-3 text-center sm:px-2.5"
                  >
                    <span
                      className="flex h-8 w-8 items-center justify-center rounded-lg"
                      style={{ color: tint, backgroundColor: `${tint}18` } as CSSProperties}
                    >
                      <Ico className="h-4 w-4" strokeWidth={2.2} aria-hidden />
                    </span>
                    <p className="w-full min-w-0 text-[0.7rem] font-bold leading-tight text-white sm:text-xs">{title}</p>
                    <p className="w-full text-[0.64rem] leading-snug text-neutral-500 sm:text-[0.68rem]">{body}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
