"use client";

import type { ReactNode } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const GRID_STROKE = "#e2e8f0";
const AXIS_MUTED = "#94a3b8";
const AXIS_LINE = "#cbd5e1";
const CURSOR_BAND = "rgba(148, 163, 184, 0.2)";

const CHART_PX_HEIGHT = 280;

function chartMargins(leftForY: number) {
  return { top: 6, right: 8, left: leftForY, bottom: 2 };
}

type Datum = { name: string; value: number };

function emptyState(msg: string) {
  return <p className="mt-2 text-sm text-slate-500 dark:text-neutral-500">{msg}</p>;
}

type BaseProps = {
  data: Datum[];
  barColor: string;
  /** Barres : coins supérieurs arrondis (style maquette) */
  radius?: [number, number, number, number];
  maxBarSize?: number;
  gridMode: "both" | "horizontal";
  yTickFormatter?: (n: number) => string;
  yDomain?: [number, number] | [number, string | number];
  yAllowDecimals?: boolean;
  xTickAngle?: number;
  xAxisHeight?: number;
  minTickGapX?: number;
  emptyMessage?: string;
  heightClass?: string;
  leftYWidth?: number;
};

function BaseBarBlock({
  data,
  barColor,
  radius = [10, 10, 0, 0],
  maxBarSize = 44,
  gridMode,
  yTickFormatter,
  yDomain,
  yAllowDecimals = false,
  xTickAngle = 0,
  xAxisHeight = 28,
  minTickGapX = 4,
  emptyMessage = "Aucune donnée.",
  heightClass = "h-[280px]",
  leftYWidth = 44,
  children,
}: BaseProps & { children: ReactNode }) {
  if (data.length === 0) return emptyState(emptyMessage);
  return (
    <div
      className={`mt-2 w-full min-w-0 ${heightClass}`}
      style={{ minWidth: 0, minHeight: CHART_PX_HEIGHT }}
    >
      {/*
        Hauteur en pixels obligatoire : width/height 100% sur un parent flex donne -1 (Recharts 3).
      */}
      <ResponsiveContainer width="100%" height={CHART_PX_HEIGHT} debounce={50}>
        <BarChart data={data} margin={chartMargins(leftYWidth)} barCategoryGap="18%">
          <CartesianGrid
            vertical={gridMode === "both"}
            horizontal
            stroke={GRID_STROKE}
            strokeDasharray="3 3"
          />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 11, fill: AXIS_MUTED }}
            tickLine={{ stroke: AXIS_LINE }}
            axisLine={{ stroke: AXIS_LINE }}
            interval="preserveStartEnd"
            minTickGap={minTickGapX}
            angle={xTickAngle}
            textAnchor={xTickAngle ? "end" : "middle"}
            height={xAxisHeight}
          />
          <YAxis
            width={leftYWidth}
            tick={{ fontSize: 11, fill: AXIS_MUTED }}
            tickLine={{ stroke: AXIS_LINE }}
            axisLine={{ stroke: AXIS_LINE }}
            domain={yDomain ?? [0, "auto"]}
            allowDecimals={yAllowDecimals}
            {...(yTickFormatter ? { tickFormatter: yTickFormatter } : {})}
          />
          {children}
          <Bar
            dataKey="value"
            fill={barColor}
            radius={radius}
            maxBarSize={maxBarSize}
            isAnimationActive
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function SalesTooltip({
  active,
  payload,
  label,
  barColor,
}: {
  active?: boolean;
  payload?: readonly { value?: unknown }[];
  label?: string | number;
  barColor: string;
}) {
  if (!active || !payload?.length) return null;
  const v = payload[0].value;
  const n = typeof v === "number" ? v : Number(v);
  return (
    <div className="rounded border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm dark:border-neutral-600 dark:bg-neutral-900">
      <p className="font-medium text-slate-900 dark:text-white">{label}</p>
      <p className="font-medium tabular-nums" style={{ color: barColor }}>
        Ventes : {Number.isFinite(n) ? String(Math.round(n)) : "—"}
      </p>
    </div>
  );
}

const SALES_BLUE = "#2563eb";
const CITY_GREEN = "#22c55e";
const MODULE_VIOLET = "#8b5cf6";

/** Nombre de ventes par jour — grilles H+V, barres bleues, survol (bande + tooltip) comme maquette. */
export function AdminSalesByDayRechart({
  series,
  emptyMessage,
}: {
  series: { date: string; count: number }[];
  emptyMessage?: string;
}) {
  const data: Datum[] = series.map((s) => ({ name: s.date.slice(5), value: s.count }));
  return (
    <BaseBarBlock
      data={data}
      barColor={SALES_BLUE}
      gridMode="both"
      yAllowDecimals
      minTickGapX={12}
      emptyMessage={emptyMessage}
      leftYWidth={40}
    >
      <Tooltip
        cursor={{ fill: CURSOR_BAND }}
        content={(props) => <SalesTooltip {...props} barColor={SALES_BLUE} />}
      />
    </BaseBarBlock>
  );
}

function StandardTooltip({
  active,
  payload,
  label,
  valueLabel,
  valueColor,
  format,
}: {
  active?: boolean;
  payload?: readonly { value?: unknown }[];
  label?: string | number;
  valueLabel: string;
  valueColor: string;
  format: (n: number) => string;
}) {
  if (!active || !payload?.length) return null;
  const v = payload[0].value;
  const n = typeof v === "number" ? v : Number(v);
  return (
    <div className="rounded border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm dark:border-neutral-600 dark:bg-neutral-900">
      <p className="line-clamp-2 font-medium text-slate-900 dark:text-white">{label}</p>
      <p className="mt-0.5 font-medium tabular-nums" style={{ color: valueColor }}>
        {valueLabel} {Number.isFinite(n) ? format(n) : "—"}
      </p>
    </div>
  );
}

type PlatformBarArgs = {
  data: Datum[];
  barColor: string;
  gridMode: "both" | "horizontal";
  yTickFormatter?: (n: number) => string;
  tooltipValueLabel: string;
  valueFormat: (n: number) => string;
  yDomain?: [number, number] | [number, string | number];
  yAllowDecimals?: boolean;
  xTickAngle?: number;
  xAxisHeight?: number;
  minTickGapX?: number;
  maxBarSize?: number;
  emptyMessage?: string;
  /** true = barre d’arrière-plan claire au survol (défaut) */
  hoverBand?: boolean;
};

/** Graphique barres générique Super Admin (CA, abonnements, entreprises, etc.) */
export function AdminPlatformBarChart({
  data,
  barColor,
  gridMode,
  yTickFormatter,
  tooltipValueLabel,
  valueFormat,
  yDomain,
  yAllowDecimals,
  xTickAngle = 0,
  xAxisHeight = 32,
  minTickGapX = 8,
  maxBarSize = 48,
  emptyMessage,
  hoverBand = true,
}: PlatformBarArgs) {
  return (
    <BaseBarBlock
      data={data}
      barColor={barColor}
      gridMode={gridMode}
      yTickFormatter={yTickFormatter}
      yDomain={yDomain}
      yAllowDecimals={yAllowDecimals}
      xTickAngle={xTickAngle}
      xAxisHeight={xAxisHeight}
      minTickGapX={minTickGapX}
      maxBarSize={maxBarSize}
      emptyMessage={emptyMessage}
      leftYWidth={yTickFormatter && gridMode === "horizontal" && xTickAngle > 0 ? 52 : 48}
    >
      <Tooltip
        cursor={hoverBand ? { fill: CURSOR_BAND } : false}
        content={(props) => (
          <StandardTooltip
            {...props}
            valueLabel={tooltipValueLabel}
            valueColor={barColor}
            format={valueFormat}
          />
        )}
      />
    </BaseBarBlock>
  );
}

/** Répartition par ville — grilles horizontales seulement, barres vertes. */
export function AdminCityRechart({ series }: { series: { label: string; value: number }[] }) {
  const data: Datum[] = series.map((s) => ({ name: s.label, value: s.value }));
  return (
    <AdminPlatformBarChart
      data={data}
      barColor={CITY_GREEN}
      gridMode="horizontal"
      tooltipValueLabel="Boutiques :"
      valueFormat={(n) => String(Math.round(n))}
      xTickAngle={-18}
      xAxisHeight={56}
      yAllowDecimals={false}
    />
  );
}

/** Modules (pénétration % affichée comme avant) — grille H, barres violettes, échelle 0–100. */
export function AdminModuleUsageRechart({
  series,
}: {
  series: { module: string; penetration: number }[];
}) {
  const data: Datum[] = series.map((m) => ({
    name: m.module.length > 32 ? `${m.module.slice(0, 30)}…` : m.module,
    value: Math.round(m.penetration * 100),
  }));
  return (
    <AdminPlatformBarChart
      data={data}
      barColor={MODULE_VIOLET}
      gridMode="horizontal"
      yDomain={[0, 100]}
      yTickFormatter={(n) => String(n)}
      tooltipValueLabel="Pénétration :"
      valueFormat={(n) => `${n} %`}
      xTickAngle={-22}
      xAxisHeight={64}
    />
  );
}
