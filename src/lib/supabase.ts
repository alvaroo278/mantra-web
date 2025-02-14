import { createClient } from "@supabase/supabase-js";
import type { Database } from "../types/database.types";

if (!import.meta.env.VITE_SUPABASE_URL) {
  throw new Error("Falta la variable de entorno VITE_SUPABASE_URL");
}

if (!import.meta.env.VITE_SUPABASE_ANON_KEY) {
  throw new Error("Falta la variable de entorno VITE_SUPABASE_ANON_KEY");
}

export const supabase = createClient<Database>(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);
