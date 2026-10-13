"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import type { Address } from "@/types/database";

export type CartItemRow = {
  id: string;
  quantity: number;
  size_id: string | null;
  products: { id: string; title: string; slug: string; price_cents: number } | null;
  sizes: { label: string } | null;
};

type ShippingBreakdownEntry = {
  sellerId: string;
  sellerName: string;
  totalPriceCents?: number;
  error?: string;
};

function formatARS(cents: number) {
  return (cents / 100).toLocaleString("es-AR", { style: "currency", currency: "ARS" });
}

export function CartView({
  initialItems,
  addresses,
}: {
  initialItems: CartItemRow[];
  addresses: Address[];
}) {
  const [items, setItems] = useState(initialItems);
  const [addressId, setAddressId] = useState(addresses[0]?.id ?? "");
  const [shippingCents, setShippingCents] = useState<number | null>(null);
  const [shippingBreakdown, setShippingBreakdown] = useState<ShippingBreakdownEntry[]>([]);
  const [quoteError, setQuoteError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const subtotalCents = useMemo(
    () => items.reduce((sum, item) => sum + (item.products?.price_cents ?? 0) * item.quantity, 0),
    [items],
  );

  function updateQuantity(itemId: string, quantity: number) {
    if (quantity < 1) return;
    setItems((prev) => prev.map((item) => (item.id === itemId ? { ...item, quantity } : item)));
    startTransition(async () => {
      const supabase = createClient();
      await supabase.from("cart_items").update({ quantity }).eq("id", itemId);
    });
  }

  function removeItem(itemId: string) {
    setItems((prev) => prev.filter((item) => item.id !== itemId));
    startTransition(async () => {
      const supabase = createClient();
      await supabase.from("cart_items").delete().eq("id", itemId);
    });
  }

  function getShippingQuote() {
    if (!addressId) {
      setQuoteError("Agregá una dirección de envío primero.");
      return;
    }
    setQuoteError(null);
    startTransition(async () => {
      const response = await fetch("/api/shipping/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ addressId }),
      });
      const data = await response.json();
      if (!response.ok) {
        setQuoteError(data.error ?? "No se pudo cotizar el envío.");
        return;
      }
      setShippingBreakdown(data.breakdown ?? []);
      setShippingCents(data.totalShippingCents ?? null);
    });
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-24 text-center">
        <p className="text-muted">Tu carrito está vacío.</p>
        <Link href="/productos" className="mt-4 inline-block underline">
          Ver productos
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="mb-8 text-2xl font-medium">Carrito</h1>

      <div className="divide-y divide-border">
        {items.map((item) => (
          <div key={item.id} className="flex items-center justify-between gap-4 py-5">
            <div>
              <Link href={`/productos/${item.products?.slug}`} className="text-sm">
                {item.products?.title}
              </Link>
              {item.sizes && <p className="text-sm text-muted">Talle: {item.sizes.label}</p>}
            </div>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min={1}
                value={item.quantity}
                onChange={(e) => updateQuantity(item.id, Number(e.target.value))}
                className="w-16 border border-border px-2 py-1 text-sm"
              />
              <span className="w-24 text-right text-sm">
                {formatARS((item.products?.price_cents ?? 0) * item.quantity)}
              </span>
              <button onClick={() => removeItem(item.id)} className="text-sm text-muted hover:text-foreground">
                Quitar
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-10 border-t border-border pt-6">
        <label className="block text-sm text-muted">Dirección de envío</label>
        {addresses.length === 0 ? (
          <p className="mt-2 text-sm text-muted">
            No tenés direcciones guardadas. Agregá una desde tu{" "}
            <Link href="/perfil" className="underline">
              perfil
            </Link>
            .
          </p>
        ) : (
          <select
            value={addressId}
            onChange={(e) => setAddressId(e.target.value)}
            className="mt-2 w-full border border-border px-3 py-2 text-sm"
          >
            {addresses.map((address) => (
              <option key={address.id} value={address.id}>
                {address.calle} {address.numero}, {address.ciudad}
              </option>
            ))}
          </select>
        )}

        <button
          onClick={getShippingQuote}
          disabled={isPending || addresses.length === 0}
          className="mt-4 border border-foreground px-5 py-2 text-sm uppercase tracking-wide hover:bg-foreground hover:text-background disabled:opacity-50"
        >
          Calcular envío
        </button>
        {quoteError && <p className="mt-2 text-sm text-red-700">{quoteError}</p>}

        {shippingBreakdown.length > 1 && (
          <div className="mt-4 space-y-1 text-sm text-muted">
            {shippingBreakdown.map((entry) => (
              <div key={entry.sellerId} className="flex justify-between">
                <span>Envío de {entry.sellerName}</span>
                <span>
                  {entry.error ? entry.error : formatARS(entry.totalPriceCents ?? 0)}
                </span>
              </div>
            ))}
          </div>
        )}
        {shippingBreakdown.length === 1 && shippingBreakdown[0].error && (
          <p className="mt-2 text-sm text-red-700">{shippingBreakdown[0].error}</p>
        )}
      </div>

      <div className="mt-8 space-y-2 border-t border-border pt-6 text-sm">
        <div className="flex justify-between">
          <span className="text-muted">Subtotal</span>
          <span>{formatARS(subtotalCents)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted">Envío{shippingBreakdown.length > 1 ? " (total)" : ""}</span>
          <span>{shippingCents !== null ? formatARS(shippingCents) : "—"}</span>
        </div>
        <div className="flex justify-between text-base font-medium">
          <span>Total</span>
          <span>{formatARS(subtotalCents + (shippingCents ?? 0))}</span>
        </div>
      </div>
    </div>
  );
}
