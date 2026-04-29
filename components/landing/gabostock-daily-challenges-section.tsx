import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  BarChart3,
  Check,
  ClipboardList,
  CreditCard,
  Package,
  TrendingDown,
  Users,
  Wallet,
  X,
} from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils/cn";

const LEFT_PROBLEMS = [
  {
    title: "Suivi des ventes manuel",
    body: "Utiliser un cahier ou Excel prend du temps et augmente les risques d'erreurs.",
    Icon: ClipboardList,
    tint: "#007AFF",
  },
  {
    title: "Stock mal maîtrisé",
    body: "Ruptures de stock, surstockage, périmés… Vous perdez de l'argent sans le savoir.",
    Icon: Package,
    tint: "#34C759",
  },
  {
    title: "Crédits clients non suivis",
    body: "Difficile de savoir qui doit quoi. Beaucoup d'impayés et de pertes financières.",
    Icon: CreditCard,
    tint: "#FF9500",
  },
] as const;

const RIGHT_PROBLEMS = [
  {
    title: "Dépenses non contrôlées",
    body: "Sans suivi précis, les dépenses échappent au contrôle et réduisent vos bénéfices.",
    Icon: Wallet,
    tint: "#AF52DE",
  },
  {
    title: "Gestion des employés complexe",
    body: "Manque de visibilité sur les performances, les horaires et les responsabilités de chaque employé.",
    Icon: Users,
    tint: "#FF3B30",
  },
  {
    title: "Absence de rapports clairs",
    body: "Sans données fiables, impossible de prendre les bonnes décisions pour développer votre activité.",
    Icon: BarChart3,
    tint: "#FFD60A",
  },
] as const;

function ProblemCard({
  title,
  body,
  Icon,
  tint,
}: {
  title: string;
  body: string;
  Icon: LucideIcon;
  tint: string;
}) {
  return (
    <article
      className={cn(
        "rounded-[18px] border border-white/[0.08] bg-[#0a101f]/90 p-[1rem_1.0625rem] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-sm",
        "sm:p-[1.125rem_1.25rem]",
      )}
    >
      <div className="flex gap-3 sm:gap-3.5">
        <span
          className="flex h-[2.6875rem] w-[2.6875rem] shrink-0 items-center justify-center rounded-full"
          style={{ backgroundColor: `${tint}22` }}
        >
          <Icon className="h-[1.2875rem] w-[1.2875rem]" strokeWidth={2.1} style={{ color: tint }} aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-start gap-2">
            <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#007AFF]/22 ring-1 ring-[#007AFF]/35">
              <X className="h-3 w-3 text-[#007AFF]" strokeWidth={3} aria-hidden />
            </span>
            <h3 className="text-[0.955rem] font-bold leading-snug tracking-[-0.02em] text-white sm:text-base">
              {title}
            </h3>
          </div>
          <p className="mt-2 text-[0.8125rem] leading-relaxed text-neutral-400 sm:text-[0.855rem]">{body}</p>
        </div>
      </div>
    </article>
  );
}

function FloatingPainTag({
  label,
  className,
}: {
  label: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "pointer-events-none absolute z-[2] inline-flex max-w-[min(12.5rem,46%)] items-center gap-2 rounded-[13px]",
        "border border-white/[0.14] bg-[rgba(8,14,26,0.72)] px-3 py-2 backdrop-blur-[10px]",
        "text-[0.6925rem] font-semibold leading-tight tracking-tight text-white/93 shadow-lg sm:text-[0.7425rem]",
        className,
      )}
    >
      <span className="flex h-[1.0625rem] w-[1.0625rem] shrink-0 items-center justify-center rounded-full bg-[#ff453a] text-[0.5575rem] font-black text-white">
        !
      </span>
      {label}
    </div>
  );
}

/** Section « défis quotidiens » — après Fonctionnalités. */
export function GabostockDailyChallengesSection() {
  return (
    <section
      id="defis"
      className="scroll-mt-20 border-b border-white/[0.065] bg-[#050A18] pb-[4.625rem] pt-[4.875rem]"
    >
      <div className="mx-auto max-w-[95rem] px-4 sm:px-6 xl:px-12">
        <div className="mx-auto max-w-[42rem] text-center lg:max-w-[48rem]">
          <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-[#007AFF]/48 bg-black/35 px-4 py-[0.4875rem] text-[11px] font-bold uppercase tracking-[0.08em] text-[#007AFF] backdrop-blur-sm sm:text-xs">
            <AlertTriangle className="h-[15px] w-[15px] shrink-0" strokeWidth={2.35} aria-hidden />
            Les défis quotidiens
          </div>
          <h2 className="text-[1.75rem] font-bold tracking-[-0.03em] text-white sm:text-4xl xl:text-[2.5rem]">
            Les problèmes qui freinent votre{" "}
            <span className="bg-gradient-to-r from-[#007AFF] to-[#34C759] bg-clip-text text-transparent">
              croissance
            </span>
          </h2>
          <p className="mx-auto mt-6 max-w-3xl text-[1rem] leading-relaxed text-neutral-400 xl:text-[1.0625rem]">
            Gérer un commerce n’est pas simple. Beaucoup de commerçants font face aux mêmes difficultés au quotidien.
          </p>
        </div>

        <div className="relative mx-auto mt-14 grid max-w-6xl grid-cols-1 gap-7 lg:mt-16 lg:max-w-none lg:grid-cols-[minmax(0,1fr)_minmax(296px,min(38vw,420px))_minmax(0,1fr)] lg:gap-8 xl:gap-12">
          {/* Colonne gauche */}
          <div className="flex flex-col gap-4 sm:gap-5 lg:pr-0 xl:gap-6">
            {LEFT_PROBLEMS.map((item) => (
              <ProblemCard key={item.title} {...item} />
            ))}
          </div>

          {/* Visuel centre */}
          <div className="relative mx-auto flex w-full max-w-[400px] flex-col lg:mx-0 lg:max-w-none">
            <figure className="relative aspect-[638/758] w-full overflow-hidden rounded-[22px] sm:rounded-[26px]">
              <Image
                src="/landing/defis-commerce.png"
                alt="Commerçant face aux difficultés de gestion"
                fill
                className="object-cover object-[50%_18%]"
                sizes="(max-width: 1024px) 100vw, 420px"
                priority={false}
              />
              {/* Tags flottants */}
              <FloatingPainTag label="Perte d’argent invisible" className="left-[5%] top-[11%]" />
              <FloatingPainTag label="Manque de temps" className="right-[5%] top-[13%]" />
              <FloatingPainTag label="Décisions au hasard" className="left-[5%] top-[43%]" />
              <FloatingPainTag label="Activité qui ne progresse pas" className="right-[5%] top-[43%]" />
              {/* Barre bas */}
              <div className="absolute inset-x-0 bottom-0 z-[3] flex items-center gap-3 bg-gradient-to-t from-black/88 via-black/74 to-transparent px-[7%] pb-[12%] pt-[34%] sm:gap-[0.935rem] sm:pb-[11%] sm:pt-[30%]">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#ff453a] shadow-inner">
                  <TrendingDown className="h-6 w-6 text-white" strokeWidth={2.5} aria-hidden />
                </span>
                <p className="text-left text-[0.8375rem] font-semibold leading-snug text-white shadow-black/44 sm:text-[0.9175rem]">
                  <span className="font-bold">Résultat :</span> moins de profits, plus de stress, et une activité
                  qui stagne.
                </p>
              </div>
            </figure>
          </div>

          {/* Colonne droite */}
          <div className="flex flex-col gap-4 sm:gap-5 xl:gap-6">
            {RIGHT_PROBLEMS.map((item) => (
              <ProblemCard key={item.title} {...item} />
            ))}
          </div>
        </div>

        {/* Bannière solution */}
        <div className="mx-auto mt-14 max-w-5xl sm:mt-16">
          <div className="rounded-[1.0625rem] bg-gradient-to-r from-[#007AFF] via-[#1a91e8] to-[#34C759] p-[1.5px] shadow-[0_28px_64px_-32px_rgba(0,122,255,0.45)] sm:rounded-[1.25rem]">
            <div className="flex flex-col gap-5 rounded-[1.0125rem] bg-[#050A18] px-5 py-6 sm:flex-row sm:items-center sm:gap-0 sm:px-8 sm:py-8 sm:rounded-[1.2rem]">
              <div className="flex shrink-0 items-center gap-6 sm:border-r border-white/[0.1] sm:pr-8">
                <div className="flex h-[3.5rem] w-[3.5rem] shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#007AFF] to-[#34C759] shadow-[0_12px_32px_-8px_rgba(0,122,255,0.52)] sm:h-[3.75rem] sm:w-[3.75rem]">
                  <Check className="h-[1.6rem] w-[1.6rem] stroke-[3] text-white" aria-hidden />
                </div>
              </div>
              <div className="min-w-0 flex-1 sm:pl-8">
                <p className="text-[1.0125rem] font-semibold text-white sm:text-[1.0625rem]">
                  Ces problèmes ont une solution.
                </p>
                <p className="mt-2 text-[0.9575rem] leading-relaxed text-neutral-400 sm:text-[1.0275rem]">
                  <span className="font-semibold text-white">GaboStock</span> vous aide à{" "}
                  <span className="font-semibold text-[#007AFF]">reprendre le contrôle</span> et à{" "}
                  <span className="font-semibold text-[#34C759]">faire grandir votre commerce</span>.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
