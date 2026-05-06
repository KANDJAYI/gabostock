import { SubscriptionScreen } from "@/components/subscription/subscription-screen";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Abonnement",
  description:
    "Centre d’abonnement Gabostock : plan actuel, quotas, facturation et mise à niveau.",
};

export default function SubscriptionPage() {
  return <SubscriptionScreen />;
}
