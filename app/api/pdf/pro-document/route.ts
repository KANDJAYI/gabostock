import { NextResponse } from "next/server";
import { htmlToPdfBufferA4 } from "@/lib/server/pdf/html-to-pdf";
import { parseProDocumentA4Payload } from "@/lib/server/pdf/parse-pdf-payload";
import { renderProDocumentA4Html } from "@/lib/server/pdf/pro-document-a4-html";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const json: unknown = await req.json();
    const data = parseProDocumentA4Payload(json);
    const html = renderProDocumentA4Html(data);
    const buf = await htmlToPdfBufferA4(html);
    const filename = `${data.kind === "devis" ? "devis" : "facture"}-${data.number || "document"}.pdf`;
    return new NextResponse(new Uint8Array(buf), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${filename}"`,
      },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
