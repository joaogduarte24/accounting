import { NextRequest, NextResponse } from "next/server";
import { jsPDF } from "jspdf";
import { uploadToDrive, appendToSheet } from "@/lib/google";

export async function POST(req: NextRequest) {
  try {
    const { image, mimeType, date, vendor, amount, pagoSocio } = await req.json();

    // Build PDF with the invoice image
    const imgData = `data:${mimeType};base64,${image}`;
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    // Fit image to A4 with margins
    doc.addImage(imgData, mimeType === "image/png" ? "PNG" : "JPEG", 10, 10, 190, 0);
    const pdfBuffer = Buffer.from(doc.output("arraybuffer"));

    // Filename: DD-MM-YYYY_Vendor_Amount.pdf
    const cleanVendor = vendor.replace(/[^a-zA-Z0-9]/g, "");
    const fileName = `${date}_${cleanVendor}_${amount}.pdf`;

    // Derive YYYY-MM from DD-MM-YYYY
    const parts = date.split("-");
    const yearMonth = `${parts[2]}-${parts[1]}`;

    const { webViewLink } = await uploadToDrive(pdfBuffer, fileName, yearMonth, pagoSocio);
    await appendToSheet(date, vendor, amount, pagoSocio, webViewLink);

    return NextResponse.json({ link: webViewLink });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Upload failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
