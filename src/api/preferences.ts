import { supabase } from "../lib/supabaseClient";

export type UserPreferences = {
  user_id: string;
  genres: string[];
  moods: string[];
  tropes: string[];
  representation: string[];
  authors: string[];
  formats: string[];
};

export async function getUserPreferences(userId: string): Promise<UserPreferences | null> {
  const { data, error } = await supabase
    .from("user_preferences")
    .select("user_id, genres, moods, tropes, representation, authors, formats")
    .eq("user_id", userId)
    .maybeSingle();

  if (error && error.code !== "PGRST116") {
    // PGRST116 = row not found
    throw error;
  }

  if (!data) return null;

  return {
    user_id: data.user_id,
    genres: data.genres ?? [],
    moods: data.moods ?? [],
    tropes: data.tropes ?? [],
    representation: data.representation ?? [],
    authors: data.authors ?? [],
    formats: data.formats ?? [],
  };
}

export async function upsertUserPreferences(
  userId: string,
  prefs: Omit<UserPreferences, "user_id">
): Promise<void> {
  const { error } = await supabase.from("user_preferences").upsert(
    {
      user_id: userId,
      genres: prefs.genres,
      moods: prefs.moods,
      tropes: prefs.tropes,
      representation: prefs.representation,
      authors: prefs.authors,
      formats: prefs.formats,
    },
    { onConflict: "user_id" }
  );

  if (error) {
    throw error;
  }
}
