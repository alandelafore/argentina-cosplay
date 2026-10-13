"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { UserRole } from "@/types/database";

const roles: UserRole[] = ["comprador", "vendedor", "admin"];

export function RoleEditor({ profileId, currentRole }: { profileId: string; currentRole: UserRole }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleChange(role: UserRole) {
    startTransition(async () => {
      const supabase = createClient();
      await supabase.from("profiles").update({ role }).eq("id", profileId);
      router.refresh();
    });
  }

  return (
    <select
      value={currentRole}
      disabled={isPending}
      onChange={(e) => handleChange(e.target.value as UserRole)}
      className="border border-border px-2 py-1 text-sm"
    >
      {roles.map((role) => (
        <option key={role} value={role}>
          {role}
        </option>
      ))}
    </select>
  );
}
