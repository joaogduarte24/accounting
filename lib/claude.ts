import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export interface InvoiceData {
  date: string; // DD-MM-YYYY
  vendor: string;
  amount: string; // e.g. "45.90"
}

export async function extractInvoiceData(
  base64Image: string,
  mimeType: string
): Promise<InvoiceData> {
  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 256,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image",
            source: { type: "base64", media_type: mimeType as "image/jpeg" | "image/png" | "image/webp" | "image/gif", data: base64Image },
          },
          {
            type: "text",
            text: `Extract from this invoice:
- date (format: DD-MM-YYYY)
- vendor/company name (short, clean name)
- total amount (number with 2 decimals, no currency symbol)

Reply ONLY with JSON: {"date":"...","vendor":"...","amount":"..."}`,
          },
        ],
      },
    ],
  });

  const text = response.content[0].type === "text" ? response.content[0].text : "";
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("Failed to parse invoice data");
  return JSON.parse(match[0]);
}
