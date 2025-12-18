import { supabase } from '../lib/supabaseClient';

export interface LibraryItem {
  id: string;
  user_id: string;
  google_volume_id: string;
  title: string | null;
  authors: string[] | string | null;
  thumbnail: string | null;
  is_favorite: boolean;
  has_read: boolean;
  created_at: string;
  tropes?: string[] | null;
  representation?: string[] | null;
  moods?: string[] | null;
  formats?: string[] | null;
}

export async function addToLibrary(params: {
  userId: string;
  googleVolumeId: string;
  title: string | undefined;
  authors: string[] | undefined;
  thumbnail: string | undefined;
  tropes?: string[] | undefined;
  representation?: string[] | undefined;
  moods?: string[] | undefined;
  formats?: string[] | undefined;
  }) {
  const { userId, googleVolumeId, title, authors, thumbnail, tropes, representation, moods, formats, } = params;

  const { data, error } = await supabase
    .from('library_items')
    .upsert(
      {
        user_id: userId,
        google_volume_id: googleVolumeId,
        title: title ?? null,
        authors: authors ?? null,
        thumbnail: thumbnail ?? null,
        tropes: tropes ?? null,
        representation: representation ?? null,
        moods: moods ?? null,
        formats: formats ?? null,
      },
      { onConflict: 'user_id,google_volume_id' }
    )
    .select('*')
    .single();

  if (error) throw error;
  return data as LibraryItem;
}

export async function deleteLibraryItem(id: string) {
  const { error } = await supabase
    .from('library_items')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

export async function getLibrary(userId: string) {
  const { data, error } = await supabase
    .from('library_items')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data ?? []) as LibraryItem[];
}

export async function isBookInLibrary(userId: string, googleVolumeId: string) {
  const { data, error } = await supabase
    .from('library_items')
    .select('id')
    .eq('user_id', userId)
    .eq('google_volume_id', googleVolumeId)
    .limit(1);

  if (error) throw error;
  return (data ?? []).length > 0;
}

export async function updateLibraryItem(id: string, updates: Partial<Pick<LibraryItem, 'is_favorite' | 'has_read'>>) {
  const { data, error } = await supabase
    .from('library_items')
    .update(updates)
    .eq('id', id)
    .select('*')
    .single();

  if (error) throw error;
  return data as LibraryItem;
}
