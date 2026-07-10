/** Formatage monétaire côté UI (espace facturation). `1 234 XOF`. */
export function formatMoney(value: number, currency: string): string {
  const n = Math.round((Number.isFinite(value) ? value : 0) * 100) / 100;
  const hasDecimals = Math.abs(n % 1) > 0.001;
  const numPart = new Intl.NumberFormat("fr-FR", {
    minimumFractionDigits: hasDecimals ? 2 : 0,
    maximumFractionDigits: 2,
  })
    .format(n)
    .replace(/[   ]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return `${numPart} ${currency}`;
}

/** yyyy-mm-dd → dd/mm/yyyy pour affichage. */
export function formatDateFr(iso: string | null | undefined): string {
  if (!iso) return "—";
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  if (!m) return iso;
  return `${m[3]}/${m[2]}/${m[1]}`;
}

/** Date du jour au format yyyy-mm-dd (fuseau local). */
export function todayIso(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
