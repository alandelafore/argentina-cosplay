import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function PerfilPublicoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", id).single();
  if (!profile) notFound();

  const { data: products } =
    profile.role === "vendedor"
      ? await supabase
          .from("products")
          .select("id, slug, title, price_cents")
          .eq("seller_id", id)
          .eq("status", "active")
      : { data: [] };

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <div className="flex items-center gap-4">
        <div className="h-20 w-20 overflow-hidden rounded-full border border-border bg-white">
          {profile.avatar_url && (
            <img src={profile.avatar_url} alt={profile.display_name} className="h-full w-full object-cover" />
          )}
        </div>
        <div>
          <h1 className="text-xl font-medium">{profile.display_name}</h1>
          {profile.role === "vendedor" && (
            <p className="text-sm text-muted">
              ★ {profile.rating_avg.toFixed(1)} ({profile.rating_count} calificaciones)
            </p>
          )}
        </div>
      </div>

      {profile.bio && <p className="mt-6 max-w-xl text-sm text-muted">{profile.bio}</p>}

      {profile.role === "vendedor" && (
        <div className="mt-12">
          <h2 className="mb-4 text-lg font-medium">Productos</h2>
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            {(products ?? []).map((product) => (
              <Link key={product.id} href={`/productos/${product.slug}`}>
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
        </div>
      )}
    </div>
  );
}
