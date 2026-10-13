import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { OriginAddressForm } from "./origin-address-form";

export default async function VendedorPage() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) redirect("/login?next=/vendedor");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userData.user.id)
    .single();

  if (!profile || (profile.role !== "vendedor" && profile.role !== "admin")) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-24 text-center">
        <p className="text-muted">
          Esta sección es para cuentas de vendedor. Si querés vender en la tienda, escribinos.
        </p>
      </div>
    );
  }

  const { data: products } = await supabase
    .from("products")
    .select("id, title, price_cents, status")
    .eq("seller_id", userData.user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <div className="mb-10">
        <OriginAddressForm profile={profile} />
      </div>

      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-medium">Mis productos</h1>
        <Link
          href="/vendedor/nuevo"
          className="border border-foreground px-5 py-2 text-sm uppercase tracking-wide hover:bg-foreground hover:text-background"
        >
          Nuevo producto
        </Link>
      </div>

      {(products ?? []).length === 0 ? (
        <p className="text-muted">Todavía no publicaste productos.</p>
      ) : (
        <div className="divide-y divide-border">
          {products!.map((product) => (
            <div key={product.id} className="flex items-center justify-between py-4 text-sm">
              <span>{product.title}</span>
              <span className="text-muted">{product.status}</span>
              <span>
                {(product.price_cents / 100).toLocaleString("es-AR", {
                  style: "currency",
                  currency: "ARS",
                })}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
