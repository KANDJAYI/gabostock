import { DocumentEditor } from "@/components/pro/document-editor";

export const dynamic = "force-dynamic";

export default async function FactureEditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <DocumentEditor kind="facture" documentId={id} />;
}
