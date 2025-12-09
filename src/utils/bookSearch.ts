import { fetchBooks } from "../api/googleBooks";

export interface UserPreferences {
  genres?: string[];
  moods?: string[];
  tropes?: string[];
  representation?: string[];
  authors?: string[];
  formats?: string[];
}

export function buildQueryFromPreferences(prefs: UserPreferences) {
  if (!prefs) return "";

  const parts: string[] = [];

  if (prefs.genres?.length) {
    parts.push(`subject:${prefs.genres[0]}`);
  }

  const optionalKeys: (keyof UserPreferences)[] = [
    "moods",
    "tropes",
    "representation",
    "formats",
    "authors",
  ];

  for (const key of optionalKeys) {
    const list = prefs[key];
    if (list && list.length > 0) {
      parts.push(list[0]);
    }
  }

  return parts.join(" ");
}

export async function fetchBooksFromPreferences(prefs: UserPreferences) {
  const query = buildQueryFromPreferences(prefs);

  if (!prefs.genres?.length) return [];

  if (prefs.genres.length > 1) {
    const results = await Promise.all(
      prefs.genres.map((g) => fetchBooks(`subject:${g} ${query}`))
    );

    const merged = new Map();
    results.flat().forEach((book) => {
      if (book?.id && !merged.has(book.id)) {
        merged.set(book.id, book);
      }
    });

    return [...merged.values()];
  }

  return await fetchBooks(query);
}
