import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function ProductosPage({
  searchParams,
}: {
  searchParams: Promise<{ categoria?: string; franquicia?: string; talle?: string }>;
}) {
  const { categoria, franquicia, talle } = await searchParams;
  const supabase = await createClient();

  const [{ data: categories }, { data: franchises }, { data: sizes }] = await Promise.all([
    supabase.from("categories").select("*").order("name"),
    supabase.from("franchises").select("*").order("name"),
    supabase.from("sizes").select("*").order("sort_order"),
  ]);

  const [categoryMatch, franchiseMatch, sizeMatch] = await Promise.all([
    categoria ? supabase.from("categories").select("id").eq("slug", categoria).single() : null,
    franquicia ? supabase.from("franchises").select("id").eq("slug", franquicia).single() : null,
    talle ? supabase.from("sizes").select("id").eq("label", talle).single() : null,
  ]);

  let query = supabase
    .from("products")
    .select("id, slug, title, price_cents")
    .eq("status", "active")
    .order("created_at", { ascending: false });

  if (categoryMatch?.data) query = query.eq("category_id", categoryMatch.data.id);
  if (franchiseMatch?.data) query = query.eq("franchise_id", franchiseMatch.data.id);

  const { data: products } = await query;

  const productIdsWithSize = sizeMatch?.data
    ? (
        await supabase.from("product_sizes").select("product_id").eq("size_id", sizeMatch.data.id)
      ).data?.map((row) => row.product_id)
    : null;

  const visibleProducts = (products ?? []).filter(
    (p) => !productIdsWithSize || productIdsWithSize.includes(p.id),
  );

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <h1 className="mb-8 text-2xl font-medium">Productos</h1>

      <div className="mb-10 flex flex-wrap gap-x-8 gap-y-3 text-sm text-muted">
        <FilterGroup label="Categoría" param="categoria" active={categoria} options={categories} />
        <FilterGroup label="Franquicia" param="franquicia" active={franquicia} options={franchises} />
        <FilterGroup
          label="Talle"
          param="talle"
          active={talle}
          options={sizes?.map((s) => ({ slug: s.label, name: s.label }))}
        />
      </div>

      {visibleProducts.length === 0 ? (
        <p className="text-muted">Todavía no hay productos publicados con estos filtros.</p>
      ) : (
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-4">
          {visibleProducts.map((product) => (
            <Link key={product.id} href={`/productos/${product.slug}`} className="group">
              <div className="aspect-square border border-border bg-white" />
              <p className="mt-3 text-sm">{product.title}</p>
              <p className="text-sm text-muted">
                {(product.price_cents / 100).toLocaleString("es-AR", {
                  style: "currency",
                  currency: "ARS",
                })}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function FilterGroup({
  label,
  param,
  active,
  options,
}: {
  label: string;
  param: string;
  active?: string;
  options?: { slug: string; name: string }[] | null;
}) {
  if (!options || options.length === 0) return null;
  return (
    <div className="flex items-center gap-3">
      <span className="text-foreground">{label}:</span>
      <Link href="/productos" className={!active ? "text-foreground underline" : ""}>
        Todos
      </Link>
      {options.map((opt) => (
        <Link
          key={opt.slug}
          href={`/productos?${param}=${opt.slug}`}
          className={active === opt.slug ? "text-foreground underline" : ""}
        >
          {opt.name}
        </Link>
      ))}
    </div>
  );
}
