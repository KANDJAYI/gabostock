import type { NavItem } from "@/lib/config/navigation";
import { ROUTES } from "@/lib/config/routes";
import { AlertTriangle, Pill } from "lucide-react";

export const PHARMACY_NAV_ITEMS: NavItem[] = [
  { href: ROUTES.pharmacyBatches, label: "Lots (pharmacie)", icon: Pill },
  { href: ROUTES.pharmacyExpirations, label: "Péremption", icon: AlertTriangle },
];

