import type { NavItem } from "@/lib/config/navigation";
import { ROUTES } from "@/lib/config/routes";
import { FileText, Home, ReceiptText, UserCog, Users } from "lucide-react";

/** Sections de l'espace Facturation Pro (comptes solo). */
export const PRO_NAV_ITEMS: NavItem[] = [
  { href: ROUTES.facturation, label: "Accueil", icon: Home },
  { href: ROUTES.facturationDevis, label: "Devis", icon: FileText },
  { href: ROUTES.facturationFactures, label: "Factures", icon: ReceiptText },
  { href: ROUTES.facturationClients, label: "Clients", icon: Users },
  { href: ROUTES.facturationProfil, label: "Profil", icon: UserCog },
];

/** Onglets affichés dans la barre du bas (mobile) — les autres passent dans « Plus ». */
export const PRO_MOBILE_PRIMARY = [
  ROUTES.facturation,
  ROUTES.facturationDevis,
  ROUTES.facturationFactures,
] as const;
