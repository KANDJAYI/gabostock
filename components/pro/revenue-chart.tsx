"use client";

import { compactMoney, type ChartBucket } from "@/lib/features/pro/analytics";
import { formatMoney } from "@/lib/features/pro/format";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

// Accent unique (magnitude, série unique) — pas de légende, le titre nomme la série.
const ACCENT = "#0066ff";
const GRID = "rgba(148,163,184,0.25)";
const AXIS = "#94a3b8";
const CURSOR = "rgba(0,102,255,0.08)";
const CHART_H = 260;

function ChartTooltip({
  active,
  payload,
  label,
  currency,
}: {
  active?: boolean;
  payload?: readonly { value?: unknown }[];
  label?: string | number;
  currency: string;
}) {
  if (!active || !payload?.length) return null;
  const v = payload[0]?.value;
  const n = typeof v === "number" ? v : Number(v);
  return (
    <div className="rounded-lg border border-black/[0.08] bg-fs-card px-3 py-2 text-sm shadow-lg dark:border-white/[0.1]">
      <p className="font-semibold text-fs-text">{label}</p>
      <p className="mt-0.5 font-bold tabular-nums" style={{ color: ACCENT }}>
        {Number.isFinite(n) ? formatMoney(n, currency) : "—"}
      </p>
    </div>
  );
}

export function RevenueChart({
  data,
  currency,
}: {
  data: ChartBucket[];
  currency: string;
}) {
  const isEmpty = data.every((d) => d.invoiced === 0);

  return (
    <div className="w-full" style={{ minHeight: CHART_H }}>
      {isEmpty ? (
        <div
          className="flex flex-col items-center justify-center rounded-xl border border-dashed border-neutral-200 text-center dark:border-white/[0.08]"
          style={{ height: CHART_H }}
        >
          <p className="text-sm text-neutral-500">
            Aucune facture sur cette période.
          </p>
          <p className="mt-1 text-xs text-neutral-400">
            Le graphique se remplira dès votre première facture.
          </p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={CHART_H} debounce={50}>
          <BarChart
            data={data}
            margin={{ top: 8, right: 8, left: 4, bottom: 2 }}
            barCategoryGap="22%"
          >
            <CartesianGrid
              vertical={false}
              horizontal
              stroke={GRID}
              strokeDasharray="3 3"
            />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 11, fill: AXIS }}
              tickLine={false}
              axisLine={{ stroke: GRID }}
              interval="preserveStartEnd"
              minTickGap={10}
              height={24}
            />
            <YAxis
              width={44}
              tick={{ fontSize: 11, fill: AXIS }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(n: number) => compactMoney(n)}
              allowDecimals={false}
            />
            <Tooltip
              cursor={{ fill: CURSOR }}
              content={(props) => (
                <ChartTooltip {...props} currency={currency} />
              )}
            />
            <Bar
              dataKey="invoiced"
              fill={ACCENT}
              radius={[6, 6, 0, 0]}
              maxBarSize={38}
              isAnimationActive
            />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
