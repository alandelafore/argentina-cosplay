"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/types/database";

export function ProfileForm({ profile }: { profile: Profile }) {
  const [displayName, setDisplayName] = useState(profile.display_name);
  const [bio, setBio] = useState(profile.bio ?? "");
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    startTransition(async () => {
      const supabase = createClient();
      const path = `${profile.id}/avatar.${file.name.split(".").pop()}`;
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(path, file, { upsert: true });

      if (uploadError) {
        setMessage("No se pudo subir la foto.");
        return;
      }

      const { data: publicUrlData } = supabase.storage.from("avatars").getPublicUrl(path);
      await supabase.from("profiles").update({ avatar_url: publicUrlData.publicUrl }).eq("id", profile.id);
      setAvatarUrl(publicUrlData.publicUrl);
      router.refresh();
    });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    startTransition(async () => {
      const supabase = createClient();
      const { error } = await supabase
        .from("profiles")
        .update({ display_name: displayName, bio })
        .eq("id", profile.id);
      setMessage(error ? "No se pudo guardar." : "Guardado.");
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <div className="h-20 w-20 overflow-hidden rounded-full border border-border bg-white">
          {avatarUrl && <img src={avatarUrl} alt={displayName} className="h-full w-full object-cover" />}
        </div>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="text-sm underline"
        >
          Cambiar foto
        </button>
        <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={handleAvatarChange} />
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label className="text-sm text-muted">
          Nombre
          <input
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="mt-1 w-full border border-border px-3 py-2 text-sm"
          />
        </label>
        <label className="text-sm text-muted">
          Descripción
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={3}
            className="mt-1 w-full border border-border px-3 py-2 text-sm"
          />
        </label>
        {message && <p className="text-sm text-muted">{message}</p>}
        <button
          type="submit"
          disabled={isPending}
          className="w-fit border border-foreground px-5 py-2 text-sm uppercase tracking-wide hover:bg-foreground hover:text-background disabled:opacity-50"
        >
          Guardar
        </button>
      </form>
    </div>
  );
}
