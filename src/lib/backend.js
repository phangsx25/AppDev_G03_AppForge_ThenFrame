import { createClient } from "@supabase/supabase-js";
export const demo = import.meta.env.VITE_BACKEND === "demo";
export const configured = !!(
  import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY
);
export const supabase =
  !demo && configured
    ? createClient(
        import.meta.env.VITE_SUPABASE_URL,
        import.meta.env.VITE_SUPABASE_ANON_KEY,
        {
          global: {
            fetch: (url, options) =>
              fetch(url, { ...options, cache: "no-store" }),
          },
        },
      )
    : null;
export function requireBackend() {
  if (!supabase)
    throw Error(
      "Supabase is not configured. Follow README setup or explicitly enable local rehearsal mode.",
    );
  return supabase;
}
export function check({ data, error }) {
  if (error) throw error;
  return data;
}
