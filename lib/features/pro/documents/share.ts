"use client";

import type { ProDocument } from "./types";

/** Déclenche le téléchargement d'un Blob PDF dans le navigateur. */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

/** Nom de fichier PDF pour un document. */
export function pdfFilename(doc: Pick<ProDocument, "kind" | "number">): string {
  const label = doc.kind === "devis" ? "devis" : "facture";
  return `${label}-${doc.number || "document"}.pdf`;
}

/** Objet + corps du message d'accompagnement (email / WhatsApp). */
export function buildShareMessage(
  doc: Pick<ProDocument, "kind" | "number" | "total" | "currency" | "client_name">,
  issuerName?: string | null,
): { subject: string; body: string } {
  const label = doc.kind === "devis" ? "Devis" : "Facture";
  const from = issuerName?.trim() ? ` de ${issuerName.trim()}` : "";
  const subject = `${label} ${doc.number}`;
  const greeting = doc.client_name?.trim()
    ? `Bonjour ${doc.client_name.trim()},`
    : "Bonjour,";
  const body = [
    greeting,
    "",
    `Veuillez trouver ci-joint le ${label.toLowerCase()} ${doc.number}${from}.`,
    "",
    "Le document PDF a été téléchargé sur votre appareil : pensez à le joindre à ce message.",
    "",
    "Cordialement.",
  ].join("\n");
  return { subject, body };
}

/** Lien `mailto:` pré-rempli (le PDF est joint manuellement après téléchargement). */
export function mailtoLink(
  email: string | null | undefined,
  subject: string,
  body: string,
): string {
  const to = (email ?? "").trim();
  const params = new URLSearchParams({ subject, body });
  return `mailto:${encodeURIComponent(to)}?${params.toString().replace(/\+/g, "%20")}`;
}

/** Lien WhatsApp `wa.me` avec message pré-rempli. */
export function whatsappLink(
  phone: string | null | undefined,
  text: string,
): string {
  const digits = (phone ?? "").replace(/[^\d]/g, "");
  const base = digits ? `https://wa.me/${digits}` : "https://wa.me/";
  return `${base}?text=${encodeURIComponent(text)}`;
}
