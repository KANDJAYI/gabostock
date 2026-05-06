"use client";

import { AdminCard, AdminPageHeader } from "@/components/admin/admin-page-header";
import { adminGetPlatformSettings, adminSetPlatformSetting } from "@/lib/features/admin/api";
import { messageFromUnknownError, toast } from "@/lib/toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";

type PartnerForm = {
  name: string;
  logoSrc: string;
};

type TextItem = { title: string; body: string };
type StepItem = { step: string; title: string; body: string };
type FaqItem = { q: string; a: string };

const PARTNERS_KEY = "public_site_partners";
const HERO_BADGE_LEFT_KEY = "public_site_hero_badge_left";
const HERO_BADGE_RIGHT_KEY = "public_site_hero_badge_right";
const HERO_TITLE_LINE1_KEY = "public_site_hero_title_line1";
const HERO_TITLE_LINE2_KEY = "public_site_hero_title_line2";
const HERO_DESC_KEY = "public_site_hero_description";
const HERO_PRIMARY_CTA_LABEL_KEY = "public_site_hero_primary_cta_label";
const HERO_PRIMARY_CTA_HREF_KEY = "public_site_hero_primary_cta_href";
const HERO_SECONDARY_CTA_LABEL_KEY = "public_site_hero_secondary_cta_label";
const HERO_SECONDARY_CTA_HREF_KEY = "public_site_hero_secondary_cta_href";
const FINAL_CTA_TITLE_KEY = "public_site_final_cta_title";
const FINAL_CTA_DESC_KEY = "public_site_final_cta_description";

const FEATURES_KEY = "public_site_features";
const STEPS_KEY = "public_site_steps";
const METIERS_KEY = "public_site_metiers";
const FAQ_KEY = "public_site_faq";
const PARTNERS_TITLE_KEY = "public_site_partners_title";
const PARTNERS_SUBTITLE_KEY = "public_site_partners_subtitle";

function safeParsePartners(raw: string | null | undefined): PartnerForm[] {
  const txt = (raw ?? "").trim();
  if (!txt) return [];
  try {
    const parsed = JSON.parse(txt) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((p) => {
        if (!p || typeof p !== "object") return null;
        const r = p as Record<string, unknown>;
        const name = String(r.name ?? "").trim();
        const logoSrc = String(r.logoSrc ?? "").trim();
        if (!name) return null;
        return { name, logoSrc };
      })
      .filter(Boolean) as PartnerForm[];
  } catch {
    return [];
  }
}

function serializePartners(list: PartnerForm[]): string {
  return JSON.stringify(
    list
      .map((p) => ({ name: p.name.trim(), logoSrc: p.logoSrc.trim() }))
      .filter((p) => p.name.length > 0),
    null,
    0,
  );
}

function safeParseJsonArray<T>(raw: string | null | undefined, map: (r: unknown) => T | null): T[] {
  const txt = (raw ?? "").trim();
  if (!txt) return [];
  try {
    const parsed = JSON.parse(txt) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.map(map).filter(Boolean) as T[];
  } catch {
    return [];
  }
}

function serializeJsonArray<T>(list: T[]): string {
  return JSON.stringify(list, null, 0);
}

export function AdminPublicSiteScreen() {
  const qc = useQueryClient();
  const q = useQuery({
    queryKey: ["admin-platform-settings"] as const,
    queryFn: () => adminGetPlatformSettings(),
  });

  const [partners, setPartners] = useState<PartnerForm[]>([]);
  const [hero, setHero] = useState({
    badgeLeft: "",
    badgeRight: "",
    titleLine1: "",
    titleLine2: "",
    description: "",
    primaryCtaLabel: "",
    primaryCtaHref: "",
    secondaryCtaLabel: "",
    secondaryCtaHref: "",
  });
  const [finalCta, setFinalCta] = useState({
    title: "",
    description: "",
  });
  const [partnersMeta, setPartnersMeta] = useState({ title: "", subtitle: "" });
  const [features, setFeatures] = useState<TextItem[]>([]);
  const [steps, setSteps] = useState<StepItem[]>([]);
  const [metiers, setMetiers] = useState<TextItem[]>([]);
  const [faq, setFaq] = useState<FaqItem[]>([]);

  useEffect(() => {
    if (!q.data) return;
    setPartners(safeParsePartners(q.data[PARTNERS_KEY]));
    setHero({
      badgeLeft: q.data[HERO_BADGE_LEFT_KEY] ?? "",
      badgeRight: q.data[HERO_BADGE_RIGHT_KEY] ?? "",
      titleLine1: q.data[HERO_TITLE_LINE1_KEY] ?? "",
      titleLine2: q.data[HERO_TITLE_LINE2_KEY] ?? "",
      description: q.data[HERO_DESC_KEY] ?? "",
      primaryCtaLabel: q.data[HERO_PRIMARY_CTA_LABEL_KEY] ?? "",
      primaryCtaHref: q.data[HERO_PRIMARY_CTA_HREF_KEY] ?? "",
      secondaryCtaLabel: q.data[HERO_SECONDARY_CTA_LABEL_KEY] ?? "",
      secondaryCtaHref: q.data[HERO_SECONDARY_CTA_HREF_KEY] ?? "",
    });
    setFinalCta({
      title: q.data[FINAL_CTA_TITLE_KEY] ?? "",
      description: q.data[FINAL_CTA_DESC_KEY] ?? "",
    });
    setPartnersMeta({
      title: q.data[PARTNERS_TITLE_KEY] ?? "",
      subtitle: q.data[PARTNERS_SUBTITLE_KEY] ?? "",
    });
    setFeatures(
      safeParseJsonArray<TextItem>(q.data[FEATURES_KEY], (x) => {
        if (!x || typeof x !== "object") return null;
        const r = x as Record<string, unknown>;
        const title = String(r.title ?? "").trim();
        const body = String(r.body ?? "").trim();
        if (!title || !body) return null;
        return { title, body };
      }),
    );
    setSteps(
      safeParseJsonArray<StepItem>(q.data[STEPS_KEY], (x) => {
        if (!x || typeof x !== "object") return null;
        const r = x as Record<string, unknown>;
        const step = String(r.step ?? "").trim();
        const title = String(r.title ?? "").trim();
        const body = String(r.body ?? "").trim();
        if (!step || !title || !body) return null;
        return { step, title, body };
      }),
    );
    setMetiers(
      safeParseJsonArray<TextItem>(q.data[METIERS_KEY], (x) => {
        if (!x || typeof x !== "object") return null;
        const r = x as Record<string, unknown>;
        const title = String(r.title ?? "").trim();
        const body = String(r.body ?? "").trim();
        if (!title || !body) return null;
        return { title, body };
      }),
    );
    setFaq(
      safeParseJsonArray<FaqItem>(q.data[FAQ_KEY], (x) => {
        if (!x || typeof x !== "object") return null;
        const r = x as Record<string, unknown>;
        const qv = String(r.q ?? "").trim();
        const a = String(r.a ?? "").trim();
        if (!qv || !a) return null;
        return { q: qv, a };
      }),
    );
  }, [q.data]);

  const jsonPreview = useMemo(() => serializePartners(partners), [partners]);
  const featuresJson = useMemo(() => serializeJsonArray(features), [features]);
  const stepsJson = useMemo(() => serializeJsonArray(steps), [steps]);
  const metiersJson = useMemo(() => serializeJsonArray(metiers), [metiers]);
  const faqJson = useMemo(() => serializeJsonArray(faq), [faq]);

  const save = useMutation({
    mutationFn: async () => {
      await Promise.all([
        adminSetPlatformSetting(PARTNERS_KEY, jsonPreview),
        adminSetPlatformSetting(HERO_BADGE_LEFT_KEY, hero.badgeLeft.trim()),
        adminSetPlatformSetting(HERO_BADGE_RIGHT_KEY, hero.badgeRight.trim()),
        adminSetPlatformSetting(HERO_TITLE_LINE1_KEY, hero.titleLine1.trim()),
        adminSetPlatformSetting(HERO_TITLE_LINE2_KEY, hero.titleLine2.trim()),
        adminSetPlatformSetting(HERO_DESC_KEY, hero.description.trim()),
        adminSetPlatformSetting(HERO_PRIMARY_CTA_LABEL_KEY, hero.primaryCtaLabel.trim()),
        adminSetPlatformSetting(HERO_PRIMARY_CTA_HREF_KEY, hero.primaryCtaHref.trim()),
        adminSetPlatformSetting(HERO_SECONDARY_CTA_LABEL_KEY, hero.secondaryCtaLabel.trim()),
        adminSetPlatformSetting(HERO_SECONDARY_CTA_HREF_KEY, hero.secondaryCtaHref.trim()),
        adminSetPlatformSetting(FINAL_CTA_TITLE_KEY, finalCta.title.trim()),
        adminSetPlatformSetting(FINAL_CTA_DESC_KEY, finalCta.description.trim()),
        adminSetPlatformSetting(PARTNERS_TITLE_KEY, partnersMeta.title.trim()),
        adminSetPlatformSetting(PARTNERS_SUBTITLE_KEY, partnersMeta.subtitle.trim()),
        adminSetPlatformSetting(FEATURES_KEY, featuresJson),
        adminSetPlatformSetting(STEPS_KEY, stepsJson),
        adminSetPlatformSetting(METIERS_KEY, metiersJson),
        adminSetPlatformSetting(FAQ_KEY, faqJson),
      ]);
    },
    onSuccess: () => {
      toast.success("Public Site enregistré");
      void qc.invalidateQueries({ queryKey: ["admin-platform-settings"] });
    },
    onError: (e) => toast.error(messageFromUnknownError(e)),
  });

  function setPartner(idx: number, patch: Partial<PartnerForm>) {
    setPartners((cur) =>
      cur.map((p, i) => (i === idx ? { ...p, ...patch } : p)),
    );
  }

  function addPartner() {
    setPartners((cur) => [...cur, { name: "", logoSrc: "" }]);
  }

  function removePartner(idx: number) {
    setPartners((cur) => cur.filter((_, i) => i !== idx));
  }

  function move(idx: number, dir: -1 | 1) {
    setPartners((cur) => {
      const next = [...cur];
      const to = idx + dir;
      if (to < 0 || to >= next.length) return cur;
      const tmp = next[idx];
      next[idx] = next[to];
      next[to] = tmp;
      return next;
    });
  }

  function listMove<T>(list: T[], idx: number, dir: -1 | 1): T[] {
    const next = [...list];
    const to = idx + dir;
    if (to < 0 || to >= next.length) return list;
    const tmp = next[idx];
    next[idx] = next[to];
    next[to] = tmp;
    return next;
  }

  if (q.isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center p-8">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-orange-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-5 md:p-8">
      <AdminPageHeader
        title="Public Site"
        description="Gérez le contenu important de la landing (hero, CTA, partenaires)."
      />

      <AdminCard>
        <h3 className="text-base font-bold text-slate-900">Hero (haut de page)</h3>
        <p className="mt-1 text-sm text-slate-600">
          Les champs vides utilisent les textes par défaut.
        </p>

        <div className="mt-4 grid gap-3 lg:grid-cols-2">
          <label className="block text-sm font-medium text-slate-700">
            Badge gauche
            <input
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              value={hero.badgeLeft}
              onChange={(e) => setHero((h) => ({ ...h, badgeLeft: e.target.value }))}
              placeholder="LA SOLUTION TOUT-EN-UN POUR"
            />
          </label>
          <label className="block text-sm font-medium text-slate-700">
            Badge droite
            <input
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              value={hero.badgeRight}
              onChange={(e) => setHero((h) => ({ ...h, badgeRight: e.target.value }))}
              placeholder="VOTRE COMMERCE"
            />
          </label>
        </div>

        <div className="mt-3 grid gap-3 lg:grid-cols-2">
          <label className="block text-sm font-medium text-slate-700">
            Titre (ligne 1)
            <input
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              value={hero.titleLine1}
              onChange={(e) => setHero((h) => ({ ...h, titleLine1: e.target.value }))}
              placeholder="Gérez mieux."
            />
          </label>
          <label className="block text-sm font-medium text-slate-700">
            Titre (ligne 2)
            <input
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              value={hero.titleLine2}
              onChange={(e) => setHero((h) => ({ ...h, titleLine2: e.target.value }))}
              placeholder="Gagnez plus."
            />
          </label>
        </div>

        <label className="mt-3 block text-sm font-medium text-slate-700">
          Description
          <textarea
            className="mt-1 w-full resize-y rounded-xl border border-slate-200 px-3 py-2 text-sm"
            value={hero.description}
            onChange={(e) => setHero((h) => ({ ...h, description: e.target.value }))}
            rows={3}
            placeholder="GaboStock vous aide à suivre vos ventes..."
          />
        </label>

        <div className="mt-3 grid gap-3 lg:grid-cols-2">
          <label className="block text-sm font-medium text-slate-700">
            Bouton principal (label)
            <input
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              value={hero.primaryCtaLabel}
              onChange={(e) => setHero((h) => ({ ...h, primaryCtaLabel: e.target.value }))}
              placeholder="Essayer gratuitement"
            />
          </label>
          <label className="block text-sm font-medium text-slate-700">
            Bouton principal (lien)
            <input
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              value={hero.primaryCtaHref}
              onChange={(e) => setHero((h) => ({ ...h, primaryCtaHref: e.target.value }))}
              placeholder="/register/select-activity"
            />
          </label>
        </div>

        <div className="mt-3 grid gap-3 lg:grid-cols-2">
          <label className="block text-sm font-medium text-slate-700">
            Bouton secondaire (label)
            <input
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              value={hero.secondaryCtaLabel}
              onChange={(e) => setHero((h) => ({ ...h, secondaryCtaLabel: e.target.value }))}
              placeholder="Voir la démo"
            />
          </label>
          <label className="block text-sm font-medium text-slate-700">
            Bouton secondaire (lien)
            <input
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              value={hero.secondaryCtaHref}
              onChange={(e) => setHero((h) => ({ ...h, secondaryCtaHref: e.target.value }))}
              placeholder="#fonctionnalites"
            />
          </label>
        </div>
      </AdminCard>

      <AdminCard>
        <h3 className="text-base font-bold text-slate-900">CTA final</h3>
        <p className="mt-1 text-sm text-slate-600">
          Bloc juste avant “Nos partenaires”.
        </p>

        <label className="mt-4 block text-sm font-medium text-slate-700">
          Titre
          <input
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
            value={finalCta.title}
            onChange={(e) => setFinalCta((c) => ({ ...c, title: e.target.value }))}
            placeholder="Prêt à structurer votre activité ?"
          />
        </label>
        <label className="mt-3 block text-sm font-medium text-slate-700">
          Description
          <textarea
            className="mt-1 w-full resize-y rounded-xl border border-slate-200 px-3 py-2 text-sm"
            value={finalCta.description}
            onChange={(e) => setFinalCta((c) => ({ ...c, description: e.target.value }))}
            rows={3}
            placeholder="Rejoignez Gabostock : créez votre espace..."
          />
        </label>
      </AdminCard>

      <AdminCard>
        <h3 className="text-base font-bold text-slate-900">Fonctionnalités (section)</h3>
        <p className="mt-1 text-sm text-slate-600">
          Titres + descriptions des cartes. L’icône et le style restent identiques.
        </p>

        <div className="mt-4 space-y-3">
          <button
            type="button"
            className="rounded-xl bg-fs-accent px-4 py-2 text-sm font-semibold text-white"
            onClick={() => setFeatures((cur) => [...cur, { title: "", body: "" }])}
          >
            Ajouter une carte
          </button>

          {features.map((it, idx) => (
            <div key={`${it.title}-${idx}`} className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="grid gap-3 lg:grid-cols-2">
                <label className="block text-sm font-medium text-slate-700">
                  Titre
                  <input
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                    value={it.title}
                    onChange={(e) =>
                      setFeatures((cur) => cur.map((x, i) => (i === idx ? { ...x, title: e.target.value } : x)))
                    }
                  />
                </label>
                <label className="block text-sm font-medium text-slate-700">
                  Description
                  <input
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                    value={it.body}
                    onChange={(e) =>
                      setFeatures((cur) => cur.map((x, i) => (i === idx ? { ...x, body: e.target.value } : x)))
                    }
                  />
                </label>
              </div>
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50 disabled:opacity-40"
                  onClick={() => setFeatures((cur) => listMove(cur, idx, -1))}
                  disabled={idx === 0}
                >
                  ↑
                </button>
                <button
                  type="button"
                  className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50 disabled:opacity-40"
                  onClick={() => setFeatures((cur) => listMove(cur, idx, 1))}
                  disabled={idx === features.length - 1}
                >
                  ↓
                </button>
                <button
                  type="button"
                  className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-100"
                  onClick={() => setFeatures((cur) => cur.filter((_, i) => i !== idx))}
                >
                  Supprimer
                </button>
              </div>
            </div>
          ))}
        </div>
      </AdminCard>

      <AdminCard>
        <h3 className="text-base font-bold text-slate-900">Parcours (Comment ça marche)</h3>
        <p className="mt-1 text-sm text-slate-600">Étapes affichées dans la section “Comment ça marche”.</p>

        <div className="mt-4 space-y-3">
          <button
            type="button"
            className="rounded-xl bg-fs-accent px-4 py-2 text-sm font-semibold text-white"
            onClick={() => setSteps((cur) => [...cur, { step: String(cur.length + 1), title: "", body: "" }])}
          >
            Ajouter une étape
          </button>

          {steps.map((it, idx) => (
            <div key={`${it.step}-${idx}`} className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="grid gap-3 lg:grid-cols-3">
                <label className="block text-sm font-medium text-slate-700">
                  Numéro
                  <input
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                    value={it.step}
                    onChange={(e) =>
                      setSteps((cur) => cur.map((x, i) => (i === idx ? { ...x, step: e.target.value } : x)))
                    }
                  />
                </label>
                <label className="block text-sm font-medium text-slate-700 lg:col-span-2">
                  Titre
                  <input
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                    value={it.title}
                    onChange={(e) =>
                      setSteps((cur) => cur.map((x, i) => (i === idx ? { ...x, title: e.target.value } : x)))
                    }
                  />
                </label>
              </div>
              <label className="mt-3 block text-sm font-medium text-slate-700">
                Description
                <input
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                  value={it.body}
                  onChange={(e) =>
                    setSteps((cur) => cur.map((x, i) => (i === idx ? { ...x, body: e.target.value } : x)))
                  }
                />
              </label>
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50 disabled:opacity-40"
                  onClick={() => setSteps((cur) => listMove(cur, idx, -1))}
                  disabled={idx === 0}
                >
                  ↑
                </button>
                <button
                  type="button"
                  className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50 disabled:opacity-40"
                  onClick={() => setSteps((cur) => listMove(cur, idx, 1))}
                  disabled={idx === steps.length - 1}
                >
                  ↓
                </button>
                <button
                  type="button"
                  className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-100"
                  onClick={() => setSteps((cur) => cur.filter((_, i) => i !== idx))}
                >
                  Supprimer
                </button>
              </div>
            </div>
          ))}
        </div>
      </AdminCard>

      <AdminCard>
        <h3 className="text-base font-bold text-slate-900">Métiers</h3>
        <p className="mt-1 text-sm text-slate-600">Cartes de la section “Adapté à votre façon de vendre”.</p>

        <div className="mt-4 space-y-3">
          <button
            type="button"
            className="rounded-xl bg-fs-accent px-4 py-2 text-sm font-semibold text-white"
            onClick={() => setMetiers((cur) => [...cur, { title: "", body: "" }])}
          >
            Ajouter
          </button>

          {metiers.map((it, idx) => (
            <div key={`${it.title}-${idx}`} className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="grid gap-3 lg:grid-cols-2">
                <label className="block text-sm font-medium text-slate-700">
                  Titre
                  <input
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                    value={it.title}
                    onChange={(e) =>
                      setMetiers((cur) => cur.map((x, i) => (i === idx ? { ...x, title: e.target.value } : x)))
                    }
                  />
                </label>
                <label className="block text-sm font-medium text-slate-700">
                  Description
                  <input
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                    value={it.body}
                    onChange={(e) =>
                      setMetiers((cur) => cur.map((x, i) => (i === idx ? { ...x, body: e.target.value } : x)))
                    }
                  />
                </label>
              </div>
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50 disabled:opacity-40"
                  onClick={() => setMetiers((cur) => listMove(cur, idx, -1))}
                  disabled={idx === 0}
                >
                  ↑
                </button>
                <button
                  type="button"
                  className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50 disabled:opacity-40"
                  onClick={() => setMetiers((cur) => listMove(cur, idx, 1))}
                  disabled={idx === metiers.length - 1}
                >
                  ↓
                </button>
                <button
                  type="button"
                  className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-100"
                  onClick={() => setMetiers((cur) => cur.filter((_, i) => i !== idx))}
                >
                  Supprimer
                </button>
              </div>
            </div>
          ))}
        </div>
      </AdminCard>

      <AdminCard>
        <h3 className="text-base font-bold text-slate-900">FAQ</h3>
        <p className="mt-1 text-sm text-slate-600">Questions/réponses affichées en bas de la landing.</p>

        <div className="mt-4 space-y-3">
          <button
            type="button"
            className="rounded-xl bg-fs-accent px-4 py-2 text-sm font-semibold text-white"
            onClick={() => setFaq((cur) => [...cur, { q: "", a: "" }])}
          >
            Ajouter
          </button>

          {faq.map((it, idx) => (
            <div key={`${it.q}-${idx}`} className="rounded-2xl border border-slate-200 bg-white p-4">
              <label className="block text-sm font-medium text-slate-700">
                Question
                <input
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                  value={it.q}
                  onChange={(e) => setFaq((cur) => cur.map((x, i) => (i === idx ? { ...x, q: e.target.value } : x)))}
                />
              </label>
              <label className="mt-3 block text-sm font-medium text-slate-700">
                Réponse
                <textarea
                  className="mt-1 w-full resize-y rounded-xl border border-slate-200 px-3 py-2 text-sm"
                  value={it.a}
                  rows={3}
                  onChange={(e) => setFaq((cur) => cur.map((x, i) => (i === idx ? { ...x, a: e.target.value } : x)))}
                />
              </label>
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50 disabled:opacity-40"
                  onClick={() => setFaq((cur) => listMove(cur, idx, -1))}
                  disabled={idx === 0}
                >
                  ↑
                </button>
                <button
                  type="button"
                  className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50 disabled:opacity-40"
                  onClick={() => setFaq((cur) => listMove(cur, idx, 1))}
                  disabled={idx === faq.length - 1}
                >
                  ↓
                </button>
                <button
                  type="button"
                  className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-100"
                  onClick={() => setFaq((cur) => cur.filter((_, i) => i !== idx))}
                >
                  Supprimer
                </button>
              </div>
            </div>
          ))}
        </div>
      </AdminCard>

      <AdminCard>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Nos partenaires</h3>
            <p className="mt-1 text-sm text-slate-600">
              Ajoutez des partenaires. Le carousel défile automatiquement sur la landing.
            </p>
          </div>
          <button
            type="button"
            className="rounded-xl bg-fs-accent px-4 py-2 text-sm font-semibold text-white"
            onClick={addPartner}
          >
            Ajouter
          </button>
        </div>

        <div className="mt-4 grid gap-3 lg:grid-cols-2">
          <label className="block text-sm font-medium text-slate-700">
            Titre section
            <input
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              value={partnersMeta.title}
              onChange={(e) => setPartnersMeta((m) => ({ ...m, title: e.target.value }))}
              placeholder="Nos partenaires"
            />
          </label>
          <label className="block text-sm font-medium text-slate-700">
            Sous-titre section
            <input
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              value={partnersMeta.subtitle}
              onChange={(e) => setPartnersMeta((m) => ({ ...m, subtitle: e.target.value }))}
              placeholder="Ils nous font confiance — et nous avançons avec eux."
            />
          </label>
        </div>

        <div className="mt-5 space-y-3">
          {partners.length === 0 ? (
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-700">
              Aucun partenaire. Cliquez sur “Ajouter”.
            </div>
          ) : null}

          {partners.map((p, idx) => (
            <div
              key={`${p.name}-${idx}`}
              className="rounded-2xl border border-slate-200 bg-white p-4"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                <label className="block flex-1 text-sm font-medium text-slate-700">
                  Nom
                  <input
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                    value={p.name}
                    onChange={(e) => setPartner(idx, { name: e.target.value })}
                    placeholder="Ex: Ramadan Telecom"
                  />
                </label>
                <label className="block flex-1 text-sm font-medium text-slate-700">
                  Logo (URL ou chemin public)
                  <input
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                    value={p.logoSrc}
                    onChange={(e) => setPartner(idx, { logoSrc: e.target.value })}
                    placeholder="/landing/partners/ramadan.png ou https://..."
                  />
                </label>

                <div className="flex gap-2 sm:pl-2">
                  <button
                    type="button"
                    className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50 disabled:opacity-40"
                    onClick={() => move(idx, -1)}
                    disabled={idx === 0}
                    title="Monter"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50 disabled:opacity-40"
                    onClick={() => move(idx, 1)}
                    disabled={idx === partners.length - 1}
                    title="Descendre"
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-100"
                    onClick={() => removePartner(idx)}
                    title="Supprimer"
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            className="rounded-xl bg-orange-600 px-6 py-3 text-sm font-semibold text-white disabled:opacity-50"
            disabled={save.isPending}
            onClick={() => save.mutate()}
          >
            Enregistrer
          </button>

          <details className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
            <summary className="cursor-pointer select-none font-semibold">
              Donnée sauvegardée (JSON)
            </summary>
            <pre className="mt-3 max-h-56 overflow-auto whitespace-pre-wrap break-words rounded-lg bg-white p-3 text-xs text-slate-800">
              {jsonPreview}
            </pre>
          </details>
        </div>
      </AdminCard>
    </div>
  );
}

