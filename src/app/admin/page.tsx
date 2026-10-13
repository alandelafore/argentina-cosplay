import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { RoleEditor } from "./role-editor";

export default async function AdminPage() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) redirect("/login?next=/admin");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userData.user.id)
    .single();

  if (profile?.role !== "admin") {
    return (
      <div className="mx-auto max-w-2xl px-6 py-24 text-center text-muted">
        No tenés acceso a esta sección.
      </div>
    );
  }

  const { data: profiles } = await supabase.from("profiles").select("*").order("created_at");

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="mb-8 text-2xl font-medium">Usuarios</h1>
      <div className="divide-y divide-border">
        {(profiles ?? []).map((p) => (
          <div key={p.id} className="flex items-center justify-between py-4 text-sm">
            <span>{p.display_name}</span>
            <RoleEditor profileId={p.id} currentRole={p.role} />
          </div>
        ))}
      </div>
    </div>
  );
}
