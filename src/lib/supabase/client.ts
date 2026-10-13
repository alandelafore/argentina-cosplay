import { createBrowserClient } from "@supabase/ssr";

// Sin el genérico Database: no hay un proyecto Supabase real del que generar tipos
// todavía. Correr `supabase gen types typescript` una vez creado y pasarlo aquí.
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
