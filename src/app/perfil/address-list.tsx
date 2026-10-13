"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Address } from "@/types/database";

const emptyForm = {
  nombre_completo: "",
  calle: "",
  numero: "",
  ciudad: "",
  provincia: "",
  codigo_postal: "",
  telefono: "",
};

export function AddressList({ addresses, userId }: { addresses: Address[]; userId: string }) {
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(addresses.length === 0);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const supabase = createClient();
      await supabase.from("addresses").insert({ ...form, user_id: userId });
      setForm(emptyForm);
      setShowForm(false);
      router.refresh();
    });
  }

  function handleRemove(id: string) {
    startTransition(async () => {
      const supabase = createClient();
      await supabase.from("addresses").delete().eq("id", id);
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-4">
      {addresses.map((address) => (
        <div key={address.id} className="flex items-center justify-between border border-border px-4 py-3 text-sm">
          <span>
            {address.calle} {address.numero}, {address.ciudad}, {address.provincia} ({address.codigo_postal})
          </span>
          <button onClick={() => handleRemove(address.id)} className="text-muted hover:text-foreground">
            Eliminar
          </button>
        </div>
      ))}

      {showForm ? (
        <form onSubmit={handleAdd} className="grid grid-cols-2 gap-3 border border-border p-4 text-sm">
          <input
            placeholder="Nombre completo"
            required
            value={form.nombre_completo}
            onChange={(e) => setForm({ ...form, nombre_completo: e.target.value })}
            className="col-span-2 border border-border px-3 py-2"
          />
          <input
            placeholder="Calle"
            required
            value={form.calle}
            onChange={(e) => setForm({ ...form, calle: e.target.value })}
            className="border border-border px-3 py-2"
          />
          <input
            placeholder="Número"
            required
            value={form.numero}
            onChange={(e) => setForm({ ...form, numero: e.target.value })}
            className="border border-border px-3 py-2"
          />
          <input
            placeholder="Ciudad"
            required
            value={form.ciudad}
            onChange={(e) => setForm({ ...form, ciudad: e.target.value })}
            className="border border-border px-3 py-2"
          />
          <input
            placeholder="Provincia"
            required
            value={form.provincia}
            onChange={(e) => setForm({ ...form, provincia: e.target.value })}
            className="border border-border px-3 py-2"
          />
          <input
            placeholder="Código postal"
            required
            value={form.codigo_postal}
            onChange={(e) => setForm({ ...form, codigo_postal: e.target.value })}
            className="border border-border px-3 py-2"
          />
          <input
            placeholder="Teléfono"
            required
            value={form.telefono}
            onChange={(e) => setForm({ ...form, telefono: e.target.value })}
            className="border border-border px-3 py-2"
          />
          <button
            type="submit"
            disabled={isPending}
            className="col-span-2 mt-2 w-fit border border-foreground px-5 py-2 uppercase tracking-wide hover:bg-foreground hover:text-background disabled:opacity-50"
          >
            Guardar dirección
          </button>
        </form>
      ) : (
        <button onClick={() => setShowForm(true)} className="w-fit text-sm underline">
          Agregar otra dirección
        </button>
      )}
    </div>
  );
}
