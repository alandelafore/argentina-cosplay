"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/types/database";

export function OriginAddressForm({ profile }: { profile: Profile }) {
  const [form, setForm] = useState({
    origin_nombre_contacto: profile.origin_nombre_contacto ?? "",
    origin_calle: profile.origin_calle ?? "",
    origin_numero: profile.origin_numero ?? "",
    origin_ciudad: profile.origin_ciudad ?? "",
    origin_provincia: profile.origin_provincia ?? "",
    origin_codigo_postal: profile.origin_codigo_postal ?? "",
    origin_telefono: profile.origin_telefono ?? "",
  });
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    startTransition(async () => {
      const supabase = createClient();
      const { error } = await supabase.from("profiles").update(form).eq("id", profile.id);
      setMessage(error ? "No se pudo guardar." : "Guardado.");
      router.refresh();
    });
  }

  function update<K extends keyof typeof form>(key: K, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <div className="border border-border p-4">
      <h2 className="mb-1 text-lg font-medium">Dirección de origen de envío</h2>
      <p className="mb-4 text-sm text-muted">
        Desde dónde despachás tus pedidos. Se usa para cotizar el envío con envia.com.
      </p>
      <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-3 text-sm">
        <input
          placeholder="Nombre de contacto"
          required
          value={form.origin_nombre_contacto}
          onChange={(e) => update("origin_nombre_contacto", e.target.value)}
          className="col-span-2 border border-border px-3 py-2"
        />
        <input
          placeholder="Calle"
          required
          value={form.origin_calle}
          onChange={(e) => update("origin_calle", e.target.value)}
          className="border border-border px-3 py-2"
        />
        <input
          placeholder="Número"
          required
          value={form.origin_numero}
          onChange={(e) => update("origin_numero", e.target.value)}
          className="border border-border px-3 py-2"
        />
        <input
          placeholder="Ciudad"
          required
          value={form.origin_ciudad}
          onChange={(e) => update("origin_ciudad", e.target.value)}
          className="border border-border px-3 py-2"
        />
        <input
          placeholder="Provincia"
          required
          value={form.origin_provincia}
          onChange={(e) => update("origin_provincia", e.target.value)}
          className="border border-border px-3 py-2"
        />
        <input
          placeholder="Código postal"
          required
          value={form.origin_codigo_postal}
          onChange={(e) => update("origin_codigo_postal", e.target.value)}
          className="border border-border px-3 py-2"
        />
        <input
          placeholder="Teléfono"
          required
          value={form.origin_telefono}
          onChange={(e) => update("origin_telefono", e.target.value)}
          className="border border-border px-3 py-2"
        />
        {message && <p className="col-span-2 text-muted">{message}</p>}
        <button
          type="submit"
          disabled={isPending}
          className="col-span-2 mt-1 w-fit border border-foreground px-5 py-2 uppercase tracking-wide hover:bg-foreground hover:text-background disabled:opacity-50"
        >
          Guardar
        </button>
      </form>
    </div>
  );
}
