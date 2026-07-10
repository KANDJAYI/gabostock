import { computeDocumentTotals } from "./totals";
import type { ProDocA4Line, ProDocumentA4Data } from "./pro-a4-types";
import type { ProDocumentKind } from "./types";

/** Lignes fictives réalistes (prestations de service). */
const SAMPLE_LINES: ProDocA4Line[] = [
  {
    description: "Conception d'identité visuelle (logo + charte)",
    quantity: 1,
    unit: "forfait",
    unitPrice: 350000,
    total: 350000,
  },
  {
    description: "Déclinaison papeterie (carte de visite, en-tête)",
    quantity: 2,
    unit: "modèle",
    unitPrice: 45000,
    total: 90000,
  },
  {
    description: "Bannières réseaux sociaux",
    quantity: 6,
    unit: "visuel",
    unitPrice: 15000,
    total: 90000,
  },
  {
    description: "Séance de retouche photo produit",
    quantity: 4,
    unit: "heure",
    unitPrice: 20000,
    total: 80000,
  },
];

/**
 * Génère un devis / facture **fictif** ultra propre pour l'aperçu.
 * Utilisé par la page d'exemple et comme démonstration du rendu final.
 */
export function sampleDocumentA4Data(
  kind: ProDocumentKind,
): ProDocumentA4Data {
  const isDevis = kind === "devis";
  const discount = 20000;
  const vatRate = 18;
  const totals = computeDocumentTotals(
    SAMPLE_LINES.map((l) => ({
      description: l.description,
      quantity: l.quantity,
      unit: l.unit,
      unit_price: l.unitPrice,
    })),
    discount,
    vatRate,
  );

  const today = new Date();
  const due = new Date(today);
  due.setDate(due.getDate() + (isDevis ? 30 : 15));
  const iso = (d: Date) => d.toISOString().slice(0, 10);

  return {
    kind,
    number: isDevis ? "DEV-2026-001" : "FAC-2026-014",
    issueDate: iso(today),
    dueDate: iso(due),
    currency: "XOF",

    issuerName: "Atelier Kofi Design",
    issuerAddress: "Rue des Cocotiers, Quartier Batterie IV\nLibreville, Gabon",
    issuerPhone: "+241 06 12 34 56",
    issuerEmail: "contact@kofidesign.ga",
    issuerTaxId: "RCCM GA-LBV-2024-B-1234",
    legalMentions:
      "Paiement à réception. Pénalité de retard : 1,5 % par mois. " +
      "IBAN : GA21 4002 1000 1234 5678 90 · Merci de votre confiance.",
    logoUrl: null,

    clientName: "Société Mbolo SARL",
    clientAddress: "Boulevard Triomphal, Immeuble Concorde\nLibreville, Gabon",
    clientEmail: "achats@mbolo.ga",
    clientPhone: "+241 01 23 45 67",
    clientTaxId: "NIF 7412589630",

    lines: SAMPLE_LINES,
    subtotal: totals.subtotal,
    discount: totals.discount,
    vatRate,
    vatAmount: totals.vatAmount,
    total: totals.total,
    notes: isDevis
      ? "Devis valable 30 jours. Acompte de 40 % à la commande pour lancer le projet."
      : "Merci pour votre confiance. Règlement par virement bancaire sous 15 jours.",
  };
}
