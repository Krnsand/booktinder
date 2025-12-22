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

export interface FetchFromPreferencesOptions {
  maxResultsPerGenre?: number;
  startIndexPerGenre?: number;
  randomizeStart?: boolean;
}

export async function fetchBooksFromPreferences(
  prefs: UserPreferences,
  options?: FetchFromPreferencesOptions
) {
  const extraQuery = buildQueryFromPreferences(prefs);

  const maxResults = options?.maxResultsPerGenre ?? 40;

  if (!prefs.genres?.length) return [];

  if (prefs.genres.length > 1) {
    const results = await Promise.all(
      prefs.genres.map((g) => {
        const base = `subject:${g}`;
        const fullQuery = extraQuery ? `${base} ${extraQuery}` : base;
        const startIndex = (() => {
          if (options?.startIndexPerGenre != null) return options.startIndexPerGenre;
          if (options?.randomizeStart) {
            const page = Math.floor(Math.random() * 5); 
            return page * maxResults;
          }
          return 0;
        })();
        return fetchBooks(fullQuery, maxResults, startIndex);
      })
    );

    const merged = new Map();
    results.flat().forEach((book) => {
      if (book?.id && !merged.has(book.id)) {
        merged.set(book.id, book);
      }
    });

    return [...merged.values()];
  }

  const base = `subject:${prefs.genres[0]}`;
  const fullQuery = extraQuery ? `${base} ${extraQuery}` : base;
  const startIndex = (() => {
    if (options?.startIndexPerGenre != null) return options.startIndexPerGenre;
    if (options?.randomizeStart) {
      const page = Math.floor(Math.random() * 5);
      return page * maxResults;
    }
    return 0;
  })();
  return await fetchBooks(fullQuery, maxResults, startIndex);
}
