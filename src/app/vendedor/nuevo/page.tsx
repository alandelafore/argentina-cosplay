import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { NewProductForm } from "./new-product-form";

export default async function NuevoProductoPage() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) redirect("/login?next=/vendedor/nuevo");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userData.user.id)
    .single();

  if (!profile || (profile.role !== "vendedor" && profile.role !== "admin")) {
    redirect("/vendedor");
  }

  const [{ data: categories }, { data: franchises }, { data: sizes }] = await Promise.all([
    supabase.from("categories").select("*").order("name"),
    supabase.from("franchises").select("*").order("name"),
    supabase.from("sizes").select("*").order("sort_order"),
  ]);

  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <h1 className="mb-8 text-2xl font-medium">Nuevo producto</h1>
      <NewProductForm
        sellerId={userData.user.id}
        categories={categories ?? []}
        franchises={franchises ?? []}
        sizes={sizes ?? []}
      />
    </div>
  );
}
