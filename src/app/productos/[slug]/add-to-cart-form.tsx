"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function AddToCartForm({
  productId,
  sizes,
}: {
  productId: string;
  sizes: { stock: number; sizes: { id: string; label: string } }[];
}) {
  const [sizeId, setSizeId] = useState(sizes[0]?.sizes.id ?? "");
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleAddToCart() {
    startTransition(async () => {
      const supabase = createClient();
      const { data: userData } = await supabase.auth.getUser();

      if (!userData.user) {
        router.push("/login");
        return;
      }

      const { error } = await supabase.from("cart_items").upsert(
        {
          user_id: userData.user.id,
          product_id: productId,
          size_id: sizeId || null,
          quantity: 1,
        },
        { onConflict: "user_id,product_id,size_id" },
      );

      setMessage(error ? "No se pudo agregar al carrito." : "Agregado al carrito.");
    });
  }

  return (
    <div className="flex flex-col gap-4">
      {sizes.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {sizes.map(({ sizes: size, stock }) => (
            <button
              key={size.id}
              type="button"
              disabled={stock === 0}
              onClick={() => setSizeId(size.id)}
              className={`border px-4 py-2 text-sm ${
                sizeId === size.id ? "border-foreground" : "border-border"
              } ${stock === 0 ? "cursor-not-allowed text-muted line-through" : ""}`}
            >
              {size.label}
            </button>
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={handleAddToCart}
        disabled={isPending}
        className="w-fit border border-foreground px-6 py-3 text-sm tracking-wide uppercase transition hover:bg-foreground hover:text-background disabled:opacity-50"
      >
        {isPending ? "Agregando..." : "Agregar al carrito"}
      </button>

      {message && <p className="text-sm text-muted">{message}</p>}
    </div>
  );
}
