import type { ProDocument } from "./documents/types";

export type StatPeriod = "day" | "week" | "month" | "year";

export const PERIOD_OPTIONS: { value: StatPeriod; label: string }[] = [
  { value: "day", label: "Jour" },
  { value: "week", label: "Semaine" },
  { value: "month", label: "Mois" },
  { value: "year", label: "Année" },
];

export const PERIOD_RANGE_LABEL: Record<StatPeriod, string> = {
  day: "Aujourd'hui",
  week: "7 derniers jours",
  month: "30 derniers jours",
  year: "12 derniers mois",
};

/** Début de la fenêtre d'analyse (heure locale). */
export function periodStart(period: StatPeriod): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  if (period === "week") d.setDate(d.getDate() - 6);
  else if (period === "month") d.setDate(d.getDate() - 29);
  else if (period === "year") {
    d.setMonth(d.getMonth() - 11);
    d.setDate(1);
  }
  return d;
}

export type ProKpis = {
  revenue: number; // factures payées
  invoiced: number; // factures émises (hors annulées)
  pending: number; // factures non payées (hors annulées)
  quotesValue: number; // devis en cours (hors annulés)
  quotesCount: number;
  invoiceCount: number;
};

function inWindow(doc: ProDocument, start: Date): boolean {
  return new Date(doc.created_at).getTime() >= start.getTime();
}

/** Agrège les indicateurs sur la fenêtre [start, maintenant]. */
export function computeKpis(
  devis: ProDocument[],
  factures: ProDocument[],
  start: Date,
): ProKpis {
  const f = factures.filter((d) => inWindow(d, start));
  const dv = devis.filter((d) => inWindow(d, start));
  const active = f.filter((x) => x.status !== "cancelled");
  const revenue = f
    .filter((x) => x.status === "paid")
    .reduce((s, x) => s + x.total, 0);
  const invoiced = active.reduce((s, x) => s + x.total, 0);
  const pending = active
    .filter((x) => x.status !== "paid")
    .reduce((s, x) => s + x.total, 0);
  const quotesValue = dv
    .filter((x) => x.status !== "cancelled")
    .reduce((s, x) => s + x.total, 0);
  return {
    revenue,
    invoiced,
    pending,
    quotesValue,
    quotesCount: dv.length,
    invoiceCount: f.length,
  };
}

export type ChartBucket = { name: string; invoiced: number; paid: number };

const DAY_SHORT = ["dim", "lun", "mar", "mer", "jeu", "ven", "sam"];
const MONTH_SHORT = [
  "janv",
  "févr",
  "mars",
  "avr",
  "mai",
  "juin",
  "juil",
  "août",
  "sept",
  "oct",
  "nov",
  "déc",
];

/**
 * Répartit le montant facturé (et la part payée) par sous-période, selon la
 * granularité : heures (jour), jours (semaine/mois), mois (année).
 */
export function revenueBuckets(
  factures: ProDocument[],
  period: StatPeriod,
): ChartBucket[] {
  const active = factures.filter((f) => f.status !== "cancelled");
  const now = new Date();

  if (period === "day") {
    const buckets: ChartBucket[] = Array.from({ length: 24 }, (_, h) => ({
      name: `${h}h`,
      invoiced: 0,
      paid: 0,
    }));
    for (const f of active) {
      const dt = new Date(f.created_at);
      if (dt.toDateString() !== now.toDateString()) continue;
      const b = buckets[dt.getHours()];
      b.invoiced += f.total;
      if (f.status === "paid") b.paid += f.total;
    }
    return buckets;
  }

  if (period === "week" || period === "month") {
    const days = period === "week" ? 7 : 30;
    const start = periodStart(period);
    const buckets: (ChartBucket & { key: string })[] = [];
    for (let i = 0; i < days; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      const name =
        period === "week"
          ? `${DAY_SHORT[d.getDay()]} ${d.getDate()}`
          : `${d.getDate()}/${d.getMonth() + 1}`;
      buckets.push({ name, invoiced: 0, paid: 0, key: d.toDateString() });
    }
    const map = new Map(buckets.map((b) => [b.key, b]));
    for (const f of active) {
      const b = map.get(new Date(f.created_at).toDateString());
      if (!b) continue;
      b.invoiced += f.total;
      if (f.status === "paid") b.paid += f.total;
    }
    return buckets.map(({ name, invoiced, paid }) => ({
      name,
      invoiced,
      paid,
    }));
  }

  // year : 12 mois glissants
  const start = periodStart("year");
  const buckets: (ChartBucket & { key: string })[] = [];
  for (let i = 0; i < 12; i++) {
    const d = new Date(start.getFullYear(), start.getMonth() + i, 1);
    buckets.push({
      name: MONTH_SHORT[d.getMonth()],
      invoiced: 0,
      paid: 0,
      key: `${d.getFullYear()}-${d.getMonth()}`,
    });
  }
  const map = new Map(buckets.map((b) => [b.key, b]));
  for (const f of active) {
    const dt = new Date(f.created_at);
    const b = map.get(`${dt.getFullYear()}-${dt.getMonth()}`);
    if (!b) continue;
    b.invoiced += f.total;
    if (f.status === "paid") b.paid += f.total;
  }
  return buckets.map(({ name, invoiced, paid }) => ({ name, invoiced, paid }));
}

/** Format monétaire compact pour axes/tuiles : 1 234 → « 1,2k », 2 500 000 → « 2,5M ». */
export function compactMoney(value: number): string {
  const n = Math.round(Number.isFinite(value) ? value : 0);
  if (Math.abs(n) >= 1_000_000)
    return `${(n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 1)}M`.replace(
      ".",
      ",",
    );
  if (Math.abs(n) >= 1000)
    return `${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}k`.replace(".", ",");
  return String(n);
}
