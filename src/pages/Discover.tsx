import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { addToLibrary, isBookInLibrary } from "../api/library";
import { getUserPreferences } from "../api/preferences";
import { fetchBooksFromPreferences } from "../utils/bookSearch";

export default function Discover() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const locationState = (location.state as { books?: any[]; currentIndex?: number }) || {};

  const [books, setBooks] = useState(locationState.books ?? []);
  const [currentIndex, setCurrentIndex] = useState(locationState.currentIndex ?? 0);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const currentBook = books[currentIndex] ?? null;

  useEffect(() => {
    async function load() {
      if (!user) return;
      if (locationState.books) return; 

      setLoading(true);

      const prefs = await getUserPreferences(user.id);
      if (!prefs) return;

      const results = await fetchBooksFromPreferences(prefs);
      setBooks(results);

      setLoading(false);
    }

    load();
  }, [user]);

  function goToLibrary() {
    navigate("/library");
  }

  function showNextBook() {
    if (!currentBook) return;

    setBooks((prev) => prev.filter((b) => b.id !== currentBook.id));
    setCurrentIndex(0);
  }

  async function handleSaveCurrent() {
    if (!user || !currentBook) return;

    try {
      setSaving(true);
      const info = currentBook.volumeInfo ?? {};
      const img = info.imageLinks ?? {};

      const alreadySaved = await isBookInLibrary(user.id, currentBook.id);
      if (alreadySaved) {
        setSaveMessage("This book has already been saved.");
        setTimeout(() => setSaveMessage(null), 3000);
        showNextBook();
        return;
      }

      await addToLibrary({
        userId: user.id,
        googleVolumeId: currentBook.id,
        title: info.title,
        authors: info.authors,
        thumbnail: img.thumbnail || img.smallThumbnail,
      });

      showNextBook();
      setSaveMessage("Book saved to your library.");
      setTimeout(() => setSaveMessage(null), 3000);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="discover-page">
      <h1>Discover</h1>

      <section className="results-section">
        {loading ? (
          <p>Loading your recommendations...</p>
        ) : currentBook ? (
          <div
            className="discover-current-book"
            onClick={() =>
              navigate(`/book/${currentBook.id}` , {
                state: { books, currentIndex },
              })
            }
            style={{ cursor: "pointer" }}
          >
            {currentBook.volumeInfo?.imageLinks?.thumbnail && (
              <img
                src={currentBook.volumeInfo.imageLinks.thumbnail}
                alt={currentBook.volumeInfo.title}
                className="discover-book-cover"
              />
            )}
            <h3>{currentBook.volumeInfo?.title}</h3>
            {currentBook.volumeInfo?.authors && (
              <p>{currentBook.volumeInfo.authors.join(", ")}</p>
            )}
          </div>
        ) : (
          <p>No books to show. Go back to preferences.</p>
        )}

        {saveMessage && <p className="success-message">{saveMessage}</p>}
      </section>

      {saveMessage && (
        <div
          className={
            saveMessage === "This book has already been saved."
              ? "save-popup save-popup--already-saved"
              : "save-popup"
          }
        >
          {saveMessage}
        </div>
      )}
      <div className="bottom-nav">
        <button
          type="button"
          onClick={showNextBook}
          disabled={books.length === 0}
          aria-label="Next book"
          className="icon-button"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="m15 9-6 6" />
            <path d="m9 9 6 6" />
          </svg>
        </button>

        <button
          type="button"
          aria-label="Library"
          onClick={goToLibrary}
          className="icon-button"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M10 2v8l3-3 3 3V2" />
            <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20" />
          </svg>
        </button>

        <button
          type="button"
          onClick={handleSaveCurrent}
          disabled={!currentBook || !user || saving}
          aria-label="Save to library"
          className="icon-button"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M2 9.5a5.5 5.5 0 0 1 9.591-3.676.56.56 0 0 0 .818 0A5.49 5.49 0 0 1 22 9.5c0 2.29-1.5 4-3 5.5l-5.492 5.313a2 2 0 0 1-3 .019L5 15c-1.5-1.5-3-3.2-3-5.5" />
          </svg>
        </button>
      </div>
    </div>
  );
}
