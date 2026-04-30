import type { AdminDashboardResolvedRange, AdminPeriodPreset } from "./dashboard-types";

function endOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
}

function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

export function resolveAdminDashboardRange(
  preset: AdminPeriodPreset,
  customFrom?: string | null,
  customTo?: string | null,
): AdminDashboardResolvedRange {
  const now = new Date();
  let from = startOfDay(now);
  let to = endOfDay(now);
  let labelFr = "Période";

  switch (preset) {
    case "today":
      labelFr = "Aujourd’hui";
      break;
    case "7d": {
      from.setDate(now.getDate() - 6);
      labelFr = "7 derniers jours";
      break;
    }
    case "30d": {
      from.setDate(now.getDate() - 29);
      labelFr = "30 derniers jours";
      break;
    }
    case "month": {
      from = new Date(now.getFullYear(), now.getMonth(), 1);
      labelFr = "Mois en cours";
      break;
    }
    case "year": {
      from = new Date(now.getFullYear(), 0, 1);
      labelFr = "Année en cours";
      break;
    }
    case "custom": {
      if (customFrom && customTo) {
        const a = new Date(customFrom);
        const b = new Date(customTo);
        if (!Number.isNaN(a.getTime()) && !Number.isNaN(b.getTime())) {
          from = startOfDay(a);
          to = endOfDay(b < a ? a : b);
          labelFr = "Période personnalisée";
        }
      } else {
        labelFr = "Personnalisé — dates invalides";
      }
      break;
    }
    default:
      break;
  }

  return {
    from,
    to,
    fromIso: from.toISOString(),
    toIso: to.toISOString(),
    labelFr,
  };
}
