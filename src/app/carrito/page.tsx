import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CartView, type CartItemRow } from "./cart-view";

export default async function CarritoPage() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();

  if (!userData.user) {
    redirect("/login?next=/carrito");
  }

  const [{ data: cartItems }, { data: addresses }] = await Promise.all([
    supabase
      .from("cart_items")
      .select("id, quantity, size_id, products(id, title, slug, price_cents), sizes(label)")
      .eq("user_id", userData.user.id),
    supabase.from("addresses").select("*").eq("user_id", userData.user.id),
  ]);

  return <CartView initialItems={(cartItems ?? []) as unknown as CartItemRow[]} addresses={addresses ?? []} />;
}
