import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchBooks } from "../api/googleBooks";
import { useAuth } from "../context/AuthContext";
import { getUserPreferences, upsertUserPreferences } from "../api/preferences";
import { fetchBooksFromPreferences } from "../utils/bookSearch";


const GENRES = [
  "Fantasy",
  "Sci-Fi",
  "Romance",
  "Contemporary / Feelgood",
  "Mystery / Thriller",
  "Horror",
  "Historical Fiction",
  "Young Adult",
  "Non-Fiction / Biography",
];

const MOODS = [
  "Dark & dramatic",
  "Light & humorous",
  "Cozy / Feelgood",
  "Epic & large-scale",
  "Emotional / tearjerker",
  "Action-packed & intense",
  "Philosophical / thought-provoking",
];

const TROPES = [
  "Enemies to Lovers",
  "Found Family",
  "The Chosen One",
  "Morally Grey Characters",
  "Redemption Arc",
  "Love Triangle",
  "Fake Dating",
  "Prophecy / Destiny",
  "Coming of Age",
  "Portal Fantasy",
  "Unreliable Narrator",
  "Second Chance Romance",
];

const REPRESENTATION = [
  "Female main character",
  "Male main character",
  "Non-binary / queer representation",
  "LGBTQ+ romance",
  "Multicultural representation",
  "Neurodivergent or disability representation",
];

const AUTHORS = [
  "Female author",
  "Male author",
  "Non-binary / queer author",
  "Debut author",
  "POC author",
  "Award-winning author",
];

const FORMATS = [
  "Short (<300 pages)",
  "Medium (300–500 pages)",
  "Long (>500 pages)",
  "Series",
  "Standalone",
  "Audiobook available",
  "Illustrated / graphic novel",
];

export default function Browse() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [selectedMoods, setSelectedMoods] = useState<string[]>([]);
  const [selectedTropes, setSelectedTropes] = useState<string[]>([]);
  const [selectedRepresentation, setSelectedRepresentation] = useState<string[]>([]);
  const [selectedAuthors, setSelectedAuthors] = useState<string[]>([]);
  const [selectedFormats, setSelectedFormats] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openSection, setOpenSection] = useState<
    | "genres"
    | "mood"
    | "tropes"
    | "representation"
    | "author"
    | "format"
    | null
  >(null);

  useEffect(() => {
    if (!user) return;

    const userId = user.id;
    let isMounted = true;

    async function loadPreferences() {
      try {
        const prefs = await getUserPreferences(userId);
        if (!isMounted || !prefs) return;

        setSelectedGenres(prefs.genres ?? []);
        setSelectedMoods(prefs.moods ?? []);
        setSelectedTropes(prefs.tropes ?? []);
        setSelectedRepresentation(prefs.representation ?? []);
        setSelectedAuthors(prefs.authors ?? []);
        setSelectedFormats(prefs.formats ?? []);
      } catch (err) {
        console.error(err);
        if (!isMounted) return;
      }
    }

    loadPreferences();

    return () => {
      isMounted = false;
    };
  }, [user]);

  function toggleGenre(genre: string) {
    setSelectedGenres((prev) =>
      prev.includes(genre)
        ? prev.filter((g) => g !== genre)
        : [...prev, genre]
    );
  }

  function toggleMood(mood: string) {
    setSelectedMoods((prev) =>
      prev.includes(mood) ? prev.filter((m) => m !== mood) : [...prev, mood]
    );
  }

  function toggleTrope(trope: string) {
    setSelectedTropes((prev) =>
      prev.includes(trope) ? prev.filter((t) => t !== trope) : [...prev, trope]
    );
  }

  function toggleRepresentation(rep: string) {
    setSelectedRepresentation((prev) =>
      prev.includes(rep) ? prev.filter((r) => r !== rep) : [...prev, rep]
    );
  }

  function toggleAuthor(author: string) {
    setSelectedAuthors((prev) =>
      prev.includes(author) ? prev.filter((a) => a !== author) : [...prev, author]
    );
  }

  function toggleFormat(format: string) {
    setSelectedFormats((prev) =>
      prev.includes(format) ? prev.filter((f) => f !== format) : [...prev, format]
    );
  }

  function buildExtraQueryPart() {
    const parts: string[] = [];


    if (selectedMoods.length > 0) {
      parts.push(selectedMoods[0]);
    }

    if (selectedTropes.length > 0) {
      parts.push(selectedTropes[0]);
    }

    if (selectedRepresentation.length > 0) {
      parts.push(selectedRepresentation[0]);
    }

    if (selectedFormats.length > 0) {
      parts.push(selectedFormats[0]);
    } else if (selectedAuthors.length > 0) {
      parts.push(selectedAuthors[0]);
    }

    if (parts.length === 0) return "";

    return parts.join(" ");
  }

  async function handleSearch() {
    if (selectedGenres.length === 0) {
      return [] as any[];
    }

    setLoading(true);
    setError(null);

    try {
      const extra = buildExtraQueryPart();

      if (selectedGenres.length === 1) {
        const [onlyGenre] = selectedGenres;
        const query = extra
          ? `subject:${onlyGenre} ${extra}`
          : `subject:${onlyGenre}`;
        const results = await fetchBooks(query);
        return results;
      } else {
        const allResults = await Promise.all(
          selectedGenres.map((genre) => {
            const query = extra
              ? `subject:${genre} ${extra}`
              : `subject:${genre}`;
            return fetchBooks(query);
          })
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

        return Array.from(mergedById.values());
      }
    } catch (err: any) {
      console.error(err);
      setError("Could not fetch books. Try again.");
      return [] as any[];
    } finally {
      setLoading(false);
    }
  }

  async function handleStartDiscover() {
    if (!user) {
      navigate("/signin");
      return;
    }

 const preferences = {
    genres: selectedGenres,
    moods: selectedMoods,
    tropes: selectedTropes,
    representation: selectedRepresentation,
    authors: selectedAuthors,
    formats: selectedFormats,
  };

  try {
    await upsertUserPreferences(user.id, preferences);
  } catch (err) {
    console.error(err);
    setError("Could not save your preferences.");
  }

  const results = await fetchBooksFromPreferences(preferences);

  navigate("/discover", {
    state: { books: results, preferences },
  });
}

  return (
    <div className="browse-page">
      <h1>Preferences</h1>

      <section className="filter-section">
        <button
          type="button"
          className="filter-dropdown-toggle"
          onClick={() =>
            setOpenSection((prev) => (prev === "genres" ? null : "genres"))
          }
        >
          Genres
        </button>
        {openSection === "genres" && (
          <div className="genre-list">
          <label className="genre-item">
            <input
              type="checkbox"
              checked={selectedGenres.length === GENRES.length}
              onChange={() => {
                if (selectedGenres.length === GENRES.length) {
                  setSelectedGenres([]);
                } else {
                  setSelectedGenres(GENRES);
                }
              }}
            />
            <span>Select all</span>
          </label>
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
        )}
      </section>

      <section className="filter-section">
        <button
          type="button"
          className="filter-dropdown-toggle"
          onClick={() =>
            setOpenSection((prev) => (prev === "mood" ? null : "mood"))
          }
        >
          Mood
        </button>
        {openSection === "mood" && (
          <div className="genre-list">
          <label className="genre-item">
            <input
              type="checkbox"
              checked={selectedMoods.length === MOODS.length}
              onChange={() => {
                if (selectedMoods.length === MOODS.length) {
                  setSelectedMoods([]);
                } else {
                  setSelectedMoods(MOODS);
                }
              }}
            />
            <span>Select all</span>
          </label>
          {MOODS.map((mood) => (
            <label key={mood} className="genre-item">
              <input
                type="checkbox"
                checked={selectedMoods.includes(mood)}
                onChange={() => toggleMood(mood)}
              />
              <span>{mood}</span>
            </label>
          ))}
          </div>
        )}
      </section>

      <section className="filter-section">
        <button
          type="button"
          className="filter-dropdown-toggle"
          onClick={() =>
            setOpenSection((prev) => (prev === "tropes" ? null : "tropes"))
          }
        >
          Tropes
        </button>
        {openSection === "tropes" && (
          <div className="genre-list">
          <label className="genre-item">
            <input
              type="checkbox"
              checked={selectedTropes.length === TROPES.length}
              onChange={() => {
                if (selectedTropes.length === TROPES.length) {
                  setSelectedTropes([]);
                } else {
                  setSelectedTropes(TROPES);
                }
              }}
            />
            <span>Select all</span>
          </label>
          {TROPES.map((trope) => (
            <label key={trope} className="genre-item">
              <input
                type="checkbox"
                checked={selectedTropes.includes(trope)}
                onChange={() => toggleTrope(trope)}
              />
              <span>{trope}</span>
            </label>
          ))}
          </div>
        )}
      </section>

      <section className="filter-section">
        <button
          type="button"
          className="filter-dropdown-toggle"
          onClick={() =>
            setOpenSection((prev) =>
              prev === "representation" ? null : "representation"
            )
          }
        >
          Representation
        </button>
        {openSection === "representation" && (
          <div className="genre-list">
          <label className="genre-item">
            <input
              type="checkbox"
              checked={selectedRepresentation.length === REPRESENTATION.length}
              onChange={() => {
                if (selectedRepresentation.length === REPRESENTATION.length) {
                  setSelectedRepresentation([]);
                } else {
                  setSelectedRepresentation(REPRESENTATION);
                }
              }}
            />
            <span>Select all</span>
          </label>
          {REPRESENTATION.map((rep) => (
            <label key={rep} className="genre-item">
              <input
                type="checkbox"
                checked={selectedRepresentation.includes(rep)}
                onChange={() => toggleRepresentation(rep)}
              />
              <span>{rep}</span>
            </label>
          ))}
          </div>
        )}
      </section>

      <section className="filter-section">
        <button
          type="button"
          className="filter-dropdown-toggle"
          onClick={() =>
            setOpenSection((prev) => (prev === "author" ? null : "author"))
          }
        >
          Author
        </button>
        {openSection === "author" && (
          <div className="genre-list">
          <label className="genre-item">
            <input
              type="checkbox"
              checked={selectedAuthors.length === AUTHORS.length}
              onChange={() => {
                if (selectedAuthors.length === AUTHORS.length) {
                  setSelectedAuthors([]);
                } else {
                  setSelectedAuthors(AUTHORS);
                }
              }}
            />
            <span>Select all</span>
          </label>
          {AUTHORS.map((author) => (
            <label key={author} className="genre-item">
              <input
                type="checkbox"
                checked={selectedAuthors.includes(author)}
                onChange={() => toggleAuthor(author)}
              />
              <span>{author}</span>
            </label>
          ))}
          </div>
        )}
      </section>

      <section className="filter-section">
        <button
          type="button"
          className="filter-dropdown-toggle"
          onClick={() =>
            setOpenSection((prev) => (prev === "format" ? null : "format"))
          }
        >
          Format
        </button>
        {openSection === "format" && (
          <div className="genre-list">
          <label className="genre-item">
            <input
              type="checkbox"
              checked={selectedFormats.length === FORMATS.length}
              onChange={() => {
                if (selectedFormats.length === FORMATS.length) {
                  setSelectedFormats([]);
                } else {
                  setSelectedFormats(FORMATS);
                }
              }}
            />
            <span>Select all</span>
          </label>
          {FORMATS.map((format) => (
            <label key={format} className="genre-item">
              <input
                type="checkbox"
                checked={selectedFormats.includes(format)}
                onChange={() => toggleFormat(format)}
              />
              <span>{format}</span>
            </label>
          ))}
          </div>
        )}
      </section>

      {error && <p className="error-message">{error}</p>}

      <div className="bottom-nav">
        <button onClick={handleStartDiscover} disabled={loading || selectedGenres.length === 0}>
          {loading ? "Searching..." : "Start discovering"}
        </button>
      </div>
    </div>
  );
}

