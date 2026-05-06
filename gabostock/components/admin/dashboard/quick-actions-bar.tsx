"use client";

import Link from "next/link";
import { ROUTES } from "@/lib/config/routes";
import {
  MdBusiness,
  MdCampaign,
  MdDownload,
  MdHelpOutline,
  MdRadar,
  MdSupportAgent,
} from "react-icons/md";

const LINK =
  "inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-black/[0.08] bg-fs-card px-3 py-2.5 text-sm font-semibold text-slate-800 shadow-sm transition hover:border-fs-accent hover:text-fs-accent dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 min-[580px]:min-w-[160px]";

export function QuickActionsBar({ onExportCsv }: { onExportCsv?: () => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      <Link className={LINK} href={ROUTES.adminCompanies}>
        <MdBusiness className="h-5 w-5 shrink-0 opacity-85" aria-hidden />
        Entreprises &amp; abonnements
      </Link>
      <Link className={LINK} href={ROUTES.adminMessages}>
        <MdCampaign className="h-5 w-5 shrink-0 opacity-85" aria-hidden />
        Relances &amp; messages
      </Link>
      <button type="button" className={LINK} onClick={onExportCsv}>
        <MdDownload className="h-5 w-5 shrink-0 opacity-85" aria-hidden />
        Export rapide CSV
      </button>
      <Link className={LINK} href={ROUTES.adminReports}>
        <MdRadar className="h-5 w-5 shrink-0 opacity-85" aria-hidden />
        Rapports
      </Link>
      <Link className={LINK} href={ROUTES.help}>
        <MdHelpOutline className="h-5 w-5 shrink-0 opacity-85" aria-hidden />
        Aide utilisateur
      </Link>
      <Link className={LINK} href={ROUTES.adminMessages}>
        <MdSupportAgent className="h-5 w-5 shrink-0 opacity-85" aria-hidden />
        Support équipe
      </Link>
    </div>
  );
}
