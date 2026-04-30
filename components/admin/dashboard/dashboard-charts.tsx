"use client";

/** Palette gabostock admin — graphiques légers SVG (sans bundle chart lourd). */

export const ADMIN_CHART_PRIMARY = "#f97316";

export type VerticalBarDatum = {
  id: string;
  label: string;
  value: number;
};

/**
 * Barres **uniquement verticales** : piste fixe en hauteur, remplissage depuis le bas.
 */
export function VerticalBarsGroup({
  items,
  max,
  color,
  valueFormat,
  trackClassName = "bg-slate-100 dark:bg-neutral-800",
  trackHeightClass = "h-44",
  valueColorPositive,
  valueColorNegative,
}: {
  items: VerticalBarDatum[];
  max: number;
  color: string;
  valueFormat?: (n: number) => string;
  trackClassName?: string;
  trackHeightClass?: string;
  /** Croissance : barres vertes / rouges selon le signe (max = max des |valeurs|) */
  valueColorPositive?: string;
  valueColorNegative?: string;
}) {
  const mh = Math.max(max, 1e-12);
  const fmt = valueFormat ?? ((n: number) => String(Math.round(n)));

  return (
    <div className="flex items-end gap-2 overflow-x-auto pb-1 pt-2 [scrollbar-width:thin]">
      {items.map((item) => {
        const raw = item.value;
        const signedMode = Boolean(valueColorPositive && valueColorNegative);
        const numerator = signedMode ? Math.abs(raw) : Math.max(0, raw);
        let hPct = Math.min(100, (numerator / mh) * 100);
        if (!signedMode && raw === 0) hPct = 0;

        let barColor = color;
        if (signedMode && valueColorPositive && valueColorNegative) {
          if (raw < 0) barColor = valueColorNegative;
          else if (raw > 0) barColor = valueColorPositive;
        }

        const showThinLine = !signedMode && raw === 0;

        return (
          <div
            key={item.id}
            className="flex w-14 min-w-[3.25rem] max-w-[7rem] shrink-0 flex-col gap-1.5 sm:w-16"
          >
            <span className="min-h-[2.5rem] text-center text-[11px] font-semibold leading-tight tabular-nums text-slate-800 dark:text-neutral-100">
              {fmt(item.value)}
            </span>
            <div
              className={`relative w-full shrink-0 overflow-hidden rounded-t-md ${trackClassName} ${trackHeightClass}`}
              title={`${item.label}: ${fmt(item.value)}`}
            >
              <div
                className="absolute bottom-0 left-0 right-0 rounded-t-md transition-[height]"
                style={{
                  height: showThinLine ? "2px" : `${hPct}%`,
                  backgroundColor: barColor,
                  opacity: showThinLine ? 0.35 : 1,
                }}
              />
            </div>
            <span
              className="line-clamp-3 min-h-[2.75rem] text-center text-[10px] leading-tight text-slate-600 dark:text-neutral-400 sm:text-[11px]"
              title={item.label}
            >
              {item.label.length > 24 ? `${item.label.slice(0, 23)}…` : item.label}
            </span>
          </div>
        );
      })}
      {items.length === 0 ? (
        <p className="text-sm text-slate-500 dark:text-neutral-500">Aucune donnée.</p>
      ) : null}
    </div>
  );
}

export function VerticalVolumeBars({
  data,
  maxY,
}: {
  data: { date: string; total: number }[];
  maxY: number;
}) {
  const mh = maxY > 0 ? maxY : 1;
  const items: VerticalBarDatum[] = data.map((d) => ({
    id: d.date,
    label: d.date.slice(5),
    value: d.total,
  }));
  return (
    <div className="mt-4">
      <VerticalBarsGroup
        items={items}
        max={mh}
        color={ADMIN_CHART_PRIMARY}
        valueFormat={(n) => String(Math.round(n))}
      />
    </div>
  );
}
