/**
 * Bannière droite — MacBook + iPhone (iPhone devant / côté gauche du portable), alignée maquette.
 * Palette #050A18 / #007AFF / #34C759.
 */

import Image from "next/image";
import { CreditCard, Package, ShoppingCart, Wallet } from "lucide-react";
import { cn } from "@/lib/utils/cn";

function LineChartSvg() {
  return (
    <svg
      viewBox="0 0 320 112"
      className="mt-4 h-[5.75rem] w-full"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M4 92 C52 74 68 82 114 62 C154 42 174 54 218 38 C268 22 294 34 318 26"
        stroke="#007AFF"
        strokeWidth="2.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4 98 C62 92 104 94 154 74 C206 54 258 76 318 54"
        stroke="#34C759"
        strokeWidth="2.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function LaptopDashboardInner() {
  return (
    <div className="flex h-full min-h-[220px] min-w-0 bg-white text-neutral-900 sm:min-h-[260px]">
      <aside className="flex w-[30%] min-w-0 flex-col gap-3 border-r border-neutral-200/98 bg-[#f7f8fa] p-[7%_5%_6%]">
        <div className="flex items-center gap-[6px] border-b border-neutral-200/95 pb-[8%]">
          <Image
            src="/logogabostock.png"
            alt=""
            width={48}
            height={48}
            className="h-[22px] w-[22px] rounded-md object-contain ring-1 ring-neutral-200/98"
          />
          <span className="text-[clamp(8px,1.5vw,10.75px)] font-bold tracking-tight">
            <span className="text-neutral-900">Gabo</span>
            <span className="text-[#34C759]">Stock</span>
          </span>
        </div>
        <div className="space-y-1 text-[clamp(7.5px,1.38vw,9.85px)] font-medium leading-tight text-neutral-600">
          {[
            ["Tableau de bord", true],
            ["Ventes", false],
            ["Stock", false],
            ["Employés", false],
          ].map(([label, active]) => (
            <div
              key={String(label)}
              className={cn(
                "rounded-lg px-[7%] py-[11%]",
                active ? "bg-[#007AFF]/15 font-semibold text-[#007AFF]" : "",
              )}
            >
              {label}
            </div>
          ))}
        </div>
      </aside>
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden p-[7%_6%_5%] sm:p-[6.5%_6%_5.5%]">
        <p className="text-[clamp(10px,1.92vw,14px)] font-semibold text-neutral-900">
          Bonjour, Admin 👋
        </p>
        <div className="mt-[4.5%] grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-2.5">
          {[
            { k: "Ventes du jour", v: "1,256 M" },
            { k: "Bénéfice", v: "1,2 M" },
            { k: "Stock", v: "12k" },
            { k: "Crédits", v: "8%" },
          ].map(({ k, v }) => (
            <div
              key={k}
              className="rounded-[10px] border border-neutral-200/92 bg-neutral-50/95 px-2 py-[7%]"
            >
              <div className="text-[clamp(6.85px,1.15vw,9.25px)] text-neutral-500">{k}</div>
              <div className="mt-1 font-bold tabular-nums text-neutral-900 text-[clamp(9px,1.72vw,12.85px)]">
                {v}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-[5%] min-h-0 flex-1 rounded-[12px] border border-neutral-200/92 bg-white px-[4.25%] pt-[7%]">
          <div className="flex items-center justify-between text-[clamp(7px,1.08vw,8.95px)] font-semibold text-neutral-500">
            <span className="inline-flex items-center gap-2">
              <span className="inline-block h-[6px] w-[22px] rounded-full bg-[#007AFF]" />
              Ventes
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="inline-block h-[6px] w-[22px] rounded-full bg-[#34C759]" />
              Bénéfice
            </span>
          </div>
          <LineChartSvg />
        </div>
      </div>
    </div>
  );
}

/** MacBook — cadre gris / écran brillant et reflet discret sous la base */
function LandingHeroLaptopMockup() {
  return (
    <div className="relative w-full max-w-[696px]">
      <div
        className="pointer-events-none absolute -inset-10 rounded-[64px] bg-[radial-gradient(ellipse_70%_55%_at_50%_45%,rgba(0,122,255,0.28),transparent_72%)] blur-[42px]"
        aria-hidden
      />
      {/* reflet sol */}
      <div
        className="pointer-events-none absolute -bottom-12 left-[6%] right-[6%] h-28 rounded-[100%] bg-gradient-to-r from-transparent via-[#007AFF]/26 to-transparent blur-2xl"
        aria-hidden
      />

      <div className="relative rounded-t-[17px] border-[11px_11px_0] border-[#3f4450] bg-[#2c3038] pb-0 pt-[13px] shadow-[0_50px_100px_-40px_rgba(0,0,0,.78)] sm:rounded-t-[19px] sm:border-[12px_12px_0] sm:pt-[15px]">
        <div className="aspect-[96/61] overflow-hidden rounded-t-[11px] border border-neutral-200/93 bg-neutral-50 shadow-inner sm:rounded-t-[12px]">
          <LaptopDashboardInner />
        </div>
        <div className="h-[11px] bg-[#dcdfe5] shadow-[inset_0_2px_0_rgba(255,255,255,0.72)] sm:h-[12px]" />
      </div>
      <div
        className="relative z-[2] mx-auto h-[26px] w-[calc(112%+42px)] max-w-none rounded-t-[3px] bg-gradient-to-b from-[#5c6370] to-[#3c424d] shadow-[0_36px_50px_-32px_rgba(0,0,0,.55)]"
        aria-hidden
      />
      <div
        className="relative z-[1] -mt-px mx-auto h-[8px] w-[calc(132%+140px)] max-w-none rounded-[0_0_5px_5px] bg-gradient-to-b from-[#2e333c] via-[#1e2229] to-[#171a20] shadow-xl"
        aria-hidden
      />
    </div>
  );
}

function LandingHeroMockupsPhoneOverlapping() {
  const tabs = [
    { label: "Accueil", active: true },
    { label: "Ventes", active: false },
    { label: "Stock", active: false },
    { label: "Rapports", active: false },
    { label: "Plus", active: false },
  ] as const;
  const actions = [
    { Icon: ShoppingCart, label: "Vente" },
    { Icon: Package, label: "Stock" },
    { Icon: CreditCard, label: "Crédit" },
    { Icon: Wallet, label: "Dépense" },
  ] as const;

  return (
    <div className="relative isolate w-full max-w-[292px]">
      <div
        className="relative z-[1] overflow-hidden rounded-[42px] border-[11px] border-b-[13px] border-[#cdd4df] bg-[#080a0f] shadow-[0_36px_60px_-28px_rgba(0,0,0,0.82),inset_0_1px_0_rgba(255,255,255,0.4)] sm:rounded-[44px]"
      >
        <div className="rounded-[clamp(24px,4.5vw,30px)] border border-neutral-200/94 bg-[#f4f6f9] pb-0 pt-[9px]">
          <div className="flex justify-center pb-1 pt-1">
            <div className="h-[26px] w-[96px] max-w-[41%] rounded-full bg-neutral-950/96" />
          </div>

          <div className="mx-[6.5%] mt-3 rounded-[15px] bg-gradient-to-br from-[#0a84ff] via-[#007AFF] to-[#005cbf] px-[8%] py-[11%] text-white shadow-lg shadow-[#0040a8]/42">
            <p className="text-[clamp(9.25px,2.38vw,11.85px)] font-bold uppercase tracking-[0.1em] text-white/93">
              Ventes du jour
            </p>
            <p className="mt-[6%] text-[clamp(14.75px,3.92vw,19.85px)] font-extrabold leading-[1.05] tracking-[-0.02em] tabular-nums">
              1 256 800 <span className="font-bold">FCFA</span>
            </p>
          </div>

          <div className="mx-[6.5%] mt-[11%] grid grid-cols-4 gap-1.5 gap-y-5 rounded-[14px] bg-white px-[4%] py-[13%]">
            {actions.map(({ Icon, label }) => (
              <div key={label} className="flex flex-col items-center gap-[7px]">
                <span className="inline-flex h-[40px] w-[40px] items-center justify-center rounded-full border-2 border-[#007AFF] bg-white shadow-sm">
                  <Icon className="h-[17px] w-[17px] text-[#007AFF]" strokeWidth={2.2} aria-hidden />
                </span>
                <span className="text-[clamp(7.25px,1.92vw,9.85px)] font-bold leading-tight text-neutral-700">
                  {label}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-[13%] border-t border-neutral-200/93 bg-white px-[3.5%] pb-3 pt-[8%]">
            <nav className="grid grid-cols-5 gap-px text-center text-[clamp(7px,2vw,9.65px)] font-bold text-neutral-500">
              {tabs.map(({ label, active }) => (
                <span key={label} className={cn(active ? "text-[#007AFF]" : "")}>
                  {label}
                </span>
              ))}
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Mac + iPhone : sous md l’iPhone est empilé ; à partir de lg il chevauche le coin bas gauche du portable */
export function LandingHeroMockupsComposition() {
  return (
    <div className="relative flex w-full items-end justify-center pb-10 pt-8 lg:justify-end lg:pb-[4.875rem] lg:pt-4">
      <div
        className="pointer-events-none absolute right-[-5%] top-[14%] h-[380px] w-[560px] max-w-none rounded-full bg-[radial-gradient(ellipse,rgba(0,122,255,0.3)_0%,rgba(52,199,89,0.09)_52%,transparent_68%)] blur-[52px]"
        aria-hidden
      />
      <div className="relative w-full max-w-[min(880px,calc(100vw-1.75rem))]">
        <div className="relative mx-auto flex w-full flex-col items-center lg:mx-0 lg:block">
          <LandingHeroLaptopMockup />

          <div className="relative z-[30] mt-11 w-full max-w-[296px] lg:absolute lg:left-[6%] lg:bottom-[-3.0625rem] lg:mt-0 xl:left-[5.875rem] xl:bottom-[-3.5rem]">
            <LandingHeroMockupsPhoneOverlapping />
          </div>
        </div>
      </div>
    </div>
  );
}
