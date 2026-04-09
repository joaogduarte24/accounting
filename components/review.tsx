"use client";

import { useState } from "react";

interface ReviewProps {
  date: string;
  vendor: string;
  amount: string;
  onSubmit: (data: { date: string; vendor: string; amount: string; pagoSocio: boolean }) => void;
  onCancel: () => void;
  loading?: boolean;
}

export default function Review({ date, vendor, amount, onSubmit, onCancel, loading }: ReviewProps) {
  const [form, setForm] = useState({ date, vendor, amount, pagoSocio: false });

  const set = (key: string, value: string | boolean) =>
    setForm((f) => ({ ...f, [key]: value }));

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <Field label="Data" value={form.date} onChange={(v) => set("date", v)} />
        <Field label="Fornecedor" value={form.vendor} onChange={(v) => set("vendor", v)} />
        <Field label="Valor" value={form.amount} onChange={(v) => set("amount", v)} type="number" />
      </div>

      <button
        type="button"
        onClick={() => set("pagoSocio", !form.pagoSocio)}
        className="w-full flex items-center justify-between py-3 px-4 rounded-xl bg-zinc-800 border border-zinc-700"
      >
        <span className="text-sm text-zinc-300">Pago pelo socio</span>
        <div
          className={`w-11 h-6 rounded-full transition-colors flex items-center px-0.5 ${
            form.pagoSocio ? "bg-emerald-500" : "bg-zinc-600"
          }`}
        >
          <div
            className={`w-5 h-5 rounded-full bg-white transition-transform ${
              form.pagoSocio ? "translate-x-5" : "translate-x-0"
            }`}
          />
        </div>
      </button>

      <div className="flex gap-3 pt-2">
        <button
          onClick={onCancel}
          disabled={loading}
          className="flex-1 py-3 rounded-xl border border-zinc-700 text-zinc-400 text-sm font-medium hover:bg-zinc-800 transition-colors"
        >
          Cancelar
        </button>
        <button
          onClick={() => onSubmit(form)}
          disabled={loading}
          className="flex-1 py-3 rounded-xl bg-white text-black text-sm font-semibold hover:bg-zinc-200 transition-colors disabled:opacity-40"
        >
          {loading ? "A enviar..." : "Enviar"}
        </button>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="text-xs text-zinc-500 uppercase tracking-wide">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
      />
    </label>
  );
}
