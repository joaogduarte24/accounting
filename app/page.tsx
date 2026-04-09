"use client";

import { useState } from "react";
import Camera from "@/components/camera";
import Review from "@/components/review";

type Step = "capture" | "scanning" | "review" | "uploading" | "done";

interface InvoiceData {
  date: string;
  vendor: string;
  amount: string;
}

export default function Home() {
  const [step, setStep] = useState<Step>("capture");
  const [image, setImage] = useState<{ base64: string; mimeType: string } | null>(null);
  const [data, setData] = useState<InvoiceData | null>(null);
  const [link, setLink] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setStep("capture");
    setImage(null);
    setData(null);
    setLink(null);
    setError(null);
  };

  const handleCapture = async (base64: string, mimeType: string) => {
    setImage({ base64, mimeType });
    setStep("scanning");
    setError(null);

    try {
      const res = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: base64, mimeType }),
      });
      const result = await res.json();
      if (result.error) throw new Error(result.error);
      setData(result);
      setStep("review");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Scan failed");
      setStep("capture");
    }
  };

  const handleSubmit = async (form: InvoiceData & { pagoSocio: boolean }) => {
    setStep("uploading");
    setError(null);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, image: image!.base64, mimeType: image!.mimeType }),
      });
      const result = await res.json();
      if (result.error) throw new Error(result.error);
      setLink(result.link);
      setStep("done");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Upload failed");
      setStep("review");
    }
  };

  return (
    <main className="max-w-md mx-auto px-5 py-8 flex flex-col gap-6">
      <h1 className="text-lg font-semibold tracking-tight">Faturas</h1>

      {error && (
        <div className="bg-red-950/50 border border-red-800 text-red-300 text-sm px-4 py-3 rounded-xl">
          {error}
        </div>
      )}

      {step === "capture" && <Camera onCapture={handleCapture} />}

      {step === "scanning" && (
        <div className="flex items-center justify-center py-16 text-zinc-400 text-sm">
          <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          A analisar fatura...
        </div>
      )}

      {step === "review" && data && (
        <Review
          date={data.date}
          vendor={data.vendor}
          amount={data.amount}
          onSubmit={handleSubmit}
          onCancel={reset}
        />
      )}

      {step === "uploading" && (
        <div className="flex items-center justify-center py-16 text-zinc-400 text-sm">
          <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          A enviar...
        </div>
      )}

      {step === "done" && (
        <div className="text-center space-y-4 py-8">
          <div className="text-3xl">&#10003;</div>
          <p className="text-sm text-zinc-400">Fatura guardada com sucesso</p>
          {link && (
            <a
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-400 underline"
            >
              Ver no Google Drive
            </a>
          )}
          <button
            onClick={reset}
            className="block mx-auto mt-4 px-6 py-3 rounded-xl bg-white text-black text-sm font-semibold hover:bg-zinc-200 transition-colors"
          >
            Nova fatura
          </button>
        </div>
      )}
    </main>
  );
}
