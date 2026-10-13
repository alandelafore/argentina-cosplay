"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Category, Franchise, Size } from "@/types/database";

function slugify(title: string) {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function NewProductForm({
  sellerId,
  categories,
  franchises,
  sizes,
}: {
  sellerId: string;
  categories: Category[];
  franchises: Franchise[];
  sizes: Size[];
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priceArs, setPriceArs] = useState("");
  const [categoryId, setCategoryId] = useState(categories[0]?.id ?? "");
  const [franchiseId, setFranchiseId] = useState("");
  const [weightGrams, setWeightGrams] = useState("500");
  const [selectedSizeIds, setSelectedSizeIds] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function toggleSize(sizeId: string) {
    setSelectedSizeIds((prev) =>
      prev.includes(sizeId) ? prev.filter((id) => id !== sizeId) : [...prev, sizeId],
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (selectedSizeIds.length === 0) {
      setError("Elegí al menos un talle (o 'Único' si no aplica).");
      return;
    }

    startTransition(async () => {
      const supabase = createClient();
      const { data: product, error: insertError } = await supabase
        .from("products")
        .insert({
          seller_id: sellerId,
          category_id: categoryId,
          franchise_id: franchiseId || null,
          slug: `${slugify(title)}-${Date.now().toString(36)}`,
          title,
          description,
          price_cents: Math.round(Number(priceArs) * 100),
          weight_grams: Number(weightGrams),
          status: "active",
        })
        .select("id")
        .single();

      if (insertError || !product) {
        setError("No se pudo crear el producto.");
        return;
      }

      await supabase
        .from("product_sizes")
        .insert(selectedSizeIds.map((sizeId) => ({ product_id: product.id, size_id: sizeId, stock: 1 })));

      router.push("/vendedor");
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-sm">
      <input
        placeholder="Título"
        required
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="border border-border px-3 py-2"
      />
      <textarea
        placeholder="Descripción"
        rows={3}
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="border border-border px-3 py-2"
      />
      <div className="grid grid-cols-2 gap-3">
        <input
          type="number"
          min={0}
          step="0.01"
          placeholder="Precio (ARS)"
          required
          value={priceArs}
          onChange={(e) => setPriceArs(e.target.value)}
          className="border border-border px-3 py-2"
        />
        <input
          type="number"
          min={1}
          placeholder="Peso (gramos)"
          required
          value={weightGrams}
          onChange={(e) => setWeightGrams(e.target.value)}
          className="border border-border px-3 py-2"
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className="border border-border px-3 py-2"
        >
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
        <select
          value={franchiseId}
          onChange={(e) => setFranchiseId(e.target.value)}
          className="border border-border px-3 py-2"
        >
          <option value="">Sin franquicia / original</option>
          {franchises.map((franchise) => (
            <option key={franchise.id} value={franchise.id}>
              {franchise.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <p className="mb-2 text-muted">Talles disponibles</p>
        <div className="flex flex-wrap gap-2">
          {sizes.map((size) => (
            <button
              key={size.id}
              type="button"
              onClick={() => toggleSize(size.id)}
              className={`border px-3 py-1 ${
                selectedSizeIds.includes(size.id) ? "border-foreground" : "border-border text-muted"
              }`}
            >
              {size.label}
            </button>
          ))}
        </div>
      </div>

      {error && <p className="text-red-700">{error}</p>}

      <button
        type="submit"
        disabled={isPending}
        className="w-fit border border-foreground px-5 py-2 uppercase tracking-wide hover:bg-foreground hover:text-background disabled:opacity-50"
      >
        {isPending ? "Publicando..." : "Publicar producto"}
      </button>
    </form>
  );
}
