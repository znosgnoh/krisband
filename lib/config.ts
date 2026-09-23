export const BAND_BOARD_ID =
  process.env.NEXT_PUBLIC_BAND_BOARD_ID?.trim() || "krisband";

/** Soft gate for /admin — overridable via NEXT_PUBLIC_ADMIN_PIN */
export const ADMIN_PIN =
  process.env.NEXT_PUBLIC_ADMIN_PIN?.trim() || "501295";

export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}
