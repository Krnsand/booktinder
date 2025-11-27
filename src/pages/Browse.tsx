import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchBooks } from "../api/googleBooks";

const GENRES = [
  "Fantasy",
  "Romance",
  "Science fiction",
  "Thriller",
  "Mystery",
  "Horror",
  "Young adult",
];

export default function Browse() {
  const navigate = useNavigate();
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [books, setBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  function toggleGenre(genre: string) {
    setSelectedGenres((prev) =>
      prev.includes(genre)
        ? prev.filter((g) => g !== genre)
        : [...prev, genre]
    );
  }

  async function handleSearch() {
    if (selectedGenres.length === 0) {
      return;
    }

    setLoading(true);
    setError(null);
    setHasSearched(true);

    try {
      if (selectedGenres.length === 1) {
        const [onlyGenre] = selectedGenres;
        const results = await fetchBooks(`subject:${onlyGenre}`);
        setBooks(results);
      } else {
        const allResults = await Promise.all(
          selectedGenres.map((genre) => fetchBooks(`subject:${genre}`))
        );

        const mergedById = new Map<string, any>();

        for (const resultList of allResults) {
          for (const book of resultList) {
            if (!book?.id) continue;
            if (!mergedById.has(book.id)) {
              mergedById.set(book.id, book);
            }
          }
        }

        setBooks(Array.from(mergedById.values()));
      }
    } catch (err: any) {
      console.error(err);
      setError("Kunde inte hämta böcker. Försök igen.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="browse-page">
      <h1>Bläddra böcker</h1>

      <button onClick={() => navigate("/discover")}>Go to Discover</button>

      <section className="filter-section">
        <h2>Genrer</h2>
        <div className="genre-list">
          {GENRES.map((genre) => (
            <label key={genre} className="genre-item">
              <input
                type="checkbox"
                checked={selectedGenres.includes(genre)}
                onChange={() => toggleGenre(genre)}
              />
              <span>{genre}</span>
            </label>
          ))}
        </div>

        <button onClick={handleSearch} disabled={loading || selectedGenres.length === 0}>
          {loading ? "Söker..." : "Hitta böcker"}
        </button>
      </section>

      {error && <p className="error-message">{error}</p>}

      <section className="results-section">
        {!loading && books.length > 0 && (
          <ul className="book-list">
            {books.map((book) => (
              <li
                key={book.id}
                className="book-item"
                onClick={() => navigate(`/book/${book.id}`)}
                style={{ cursor: "pointer" }}
              >
                <h3>{book.volumeInfo?.title}</h3>
                {book.volumeInfo?.authors && (
                  <p>{book.volumeInfo.authors.join(", ")}</p>
                )}
              </li>
            ))}
          </ul>
        )}

        {!loading && !error && hasSearched && books.length === 0 && (
          <p>Inga böcker hittades för valda genrer.</p>
        )}
      </section>
    </div>
  );
}

