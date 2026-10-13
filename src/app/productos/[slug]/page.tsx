import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AddToCartForm } from "./add-to-cart-form";

export default async function ProductoPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: product } = await supabase
    .from("products")
    .select(
      "id, title, description, price_cents, seller_id, profiles(display_name, rating_avg, rating_count), product_images(storage_path, position), product_sizes(stock, sizes(id, label))",
    )
    .eq("slug", slug)
    .eq("status", "active")
    .single();

  if (!product) notFound();

  const seller = product.profiles as unknown as {
    display_name: string;
    rating_avg: number;
    rating_count: number;
  } | null;

  const availableSizes = (product.product_sizes as unknown as {
    stock: number;
    sizes: { id: string; label: string };
  }[]) ?? [];

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <div className="grid gap-12 sm:grid-cols-2">
        <div className="aspect-square border border-border bg-white" />

        <div>
          <h1 className="text-2xl font-medium">{product.title}</h1>
          <p className="mt-2 text-xl">
            {(product.price_cents / 100).toLocaleString("es-AR", {
              style: "currency",
              currency: "ARS",
            })}
          </p>

          {seller && (
            <Link href={`/perfil/${product.seller_id}`} className="mt-4 block text-sm text-muted hover:text-foreground">
              Vendido por {seller.display_name} · ★ {seller.rating_avg.toFixed(1)} ({seller.rating_count})
            </Link>
          )}

          {product.description && <p className="mt-6 text-sm leading-relaxed text-muted">{product.description}</p>}

          <div className="mt-8">
            <AddToCartForm productId={product.id} sizes={availableSizes} />
          </div>
        </div>
      </div>
    </div>
  );
}
