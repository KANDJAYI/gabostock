"use client";

import { StatusBadge } from "@/components/pro/status-badge";
import { ROUTES } from "@/lib/config/routes";
import { listProDocuments } from "@/lib/features/pro/documents/api";
import type { ProDocument } from "@/lib/features/pro/documents/types";
import { getIssuer } from "@/lib/features/pro/issuer/api";
import { formatDateFr, formatMoney } from "@/lib/features/pro/format";
import {
  ArrowRight,
  FileText,
  ReceiptText,
  Sparkles,
  UserCog,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export function FacturationHome() {
  const [devis, setDevis] = useState<ProDocument[]>([]);
  const [factures, setFactures] = useState<ProDocument[]>([]);
  const [issuerName, setIssuerName] = useState<string | null>(null);
  const [needsProfile, setNeedsProfile] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [d, f, iss] = await Promise.all([
          listProDocuments("devis"),
          listProDocuments("facture"),
          getIssuer(),
        ]);
        setDevis(d);
        setFactures(f);
        setIssuerName(iss?.business_name ?? null);
        setNeedsProfile(!iss?.business_name?.trim());
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const recent = [...devis, ...factures]
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
    .slice(0, 6);

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">
        Bonjour{issuerName ? `, ${issuerName}` : ""} 👋
      </h1>
      <p className="mt-1 text-sm text-neutral-500">
        Créez et envoyez vos devis et factures en quelques clics.
      </p>

      <Link
        href={ROUTES.facturationApercu}
        className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-fs-accent/25 bg-fs-accent/5 px-3 py-1.5 text-sm font-semibold text-fs-accent transition-colors hover:bg-fs-accent/10"
      >
        <Sparkles className="h-4 w-4" aria-hidden />
        Voir un exemple de document
      </Link>

      {needsProfile && !loading ? (
        <Link
          href={ROUTES.facturationProfil}
          className="mt-4 flex items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 hover:bg-amber-100"
        >
          <span>
            Complétez votre <b>profil émetteur</b> (nom, logo, coordonnées) pour
            des documents professionnels.
          </span>
          <ArrowRight className="h-4 w-4 shrink-0" aria-hidden />
        </Link>
      ) : null}

      {/* Actions rapides */}
      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <QuickCard
          href={`${ROUTES.facturationDevis}/new`}
          icon={FileText}
          title="Nouveau devis"
          subtitle={`${devis.length} au total`}
        />
        <QuickCard
          href={`${ROUTES.facturationFactures}/new`}
          icon={ReceiptText}
          title="Nouvelle facture"
          subtitle={`${factures.length} au total`}
        />
        <QuickCard
          href={ROUTES.facturationClients}
          icon={Users}
          title="Clients"
          subtitle="Carnet d'adresses"
        />
        <QuickCard
          href={ROUTES.facturationProfil}
          icon={UserCog}
          title="Profil émetteur"
          subtitle="Logo & coordonnées"
        />
      </div>

      {/* Récents */}
      <div className="mt-7">
        <h2 className="mb-3 text-sm font-bold text-neutral-700">
          Documents récents
        </h2>
        {loading ? (
          <p className="py-8 text-center text-sm text-neutral-500">Chargement…</p>
        ) : recent.length === 0 ? (
          <div className="rounded-xl border border-dashed border-neutral-300 bg-fs-card py-10 text-center text-sm text-neutral-600">
            Rien pour l&apos;instant — créez votre premier devis ou facture.
          </div>
        ) : (
          <ul className="flex flex-col gap-2">
            {recent.map((doc) => {
              const href = `${
                doc.kind === "devis"
                  ? ROUTES.facturationDevis
                  : ROUTES.facturationFactures
              }/${doc.id}`;
              return (
                <li key={doc.id}>
                  <Link
                    href={href}
                    className="flex items-center justify-between gap-3 rounded-xl border border-black/[0.06] bg-fs-card p-3.5 hover:border-fs-accent/30"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-fs-accent/10 text-fs-accent">
                        {doc.kind === "devis" ? (
                          <FileText className="h-4 w-4" />
                        ) : (
                          <ReceiptText className="h-4 w-4" />
                        )}
                      </span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{doc.number}</span>
                          <StatusBadge status={doc.status} />
                        </div>
                        <p className="truncate text-xs text-neutral-500">
                          {doc.client_name || "Sans client"} ·{" "}
                          {formatDateFr(doc.issue_date)}
                        </p>
                      </div>
                    </div>
                    <span className="shrink-0 font-bold">
                      {formatMoney(doc.total, doc.currency)}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

function QuickCard({
  href,
  icon: Icon,
  title,
  subtitle,
}: {
  href: string;
  icon: typeof FileText;
  title: string;
  subtitle: string;
}) {
  return (
    <Link
      href={href}
      className="group rounded-2xl border border-black/[0.06] bg-fs-card p-4 transition-colors hover:border-fs-accent/30"
    >
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-fs-accent/10 text-fs-accent">
        <Icon className="h-5 w-5" aria-hidden />
      </span>
      <p className="mt-3 font-semibold">{title}</p>
      <p className="text-xs text-neutral-500">{subtitle}</p>
    </Link>
  );
}
