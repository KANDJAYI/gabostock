import { DocumentsList } from "@/components/pro/documents-list";

export const dynamic = "force-dynamic";

export default function FacturesListPage() {
  return <DocumentsList kind="facture" />;
}
