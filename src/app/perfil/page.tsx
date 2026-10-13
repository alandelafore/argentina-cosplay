import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProfileForm } from "./profile-form";
import { AddressList } from "./address-list";

export default async function MiPerfilPage() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();

  if (!userData.user) {
    redirect("/login?next=/perfil");
  }

  const [{ data: profile }, { data: addresses }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", userData.user.id).single(),
    supabase.from("addresses").select("*").eq("user_id", userData.user.id).order("created_at"),
  ]);

  if (!profile) redirect("/login");

  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <h1 className="mb-8 text-2xl font-medium">Mi perfil</h1>
      <ProfileForm profile={profile} />
      <div className="mt-12 border-t border-border pt-8">
        <h2 className="mb-4 text-lg font-medium">Direcciones de envío</h2>
        <AddressList addresses={addresses ?? []} userId={userData.user.id} />
      </div>
    </div>
  );
}
