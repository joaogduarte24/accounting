import { NextRequest, NextResponse } from "next/server";
import { extractInvoiceData } from "@/lib/claude";

export async function POST(req: NextRequest) {
  try {
    const { image, mimeType } = await req.json();
    const data = await extractInvoiceData(image, mimeType);
    return NextResponse.json(data);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Scan failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
