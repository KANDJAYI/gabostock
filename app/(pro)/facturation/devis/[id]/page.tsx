import { DocumentEditor } from "@/components/pro/document-editor";

export const dynamic = "force-dynamic";

export default async function DevisEditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <DocumentEditor kind="devis" documentId={id} />;
}
