import { useState, useEffect, type TouchEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { addToLibrary, isBookInLibrary } from "../api/library";
import { getOpenLibraryCover } from "../api/googleBooks";
import { getUserPreferences } from "../api/preferences";
import { fetchBooksFromPreferences } from "../utils/bookSearch";
import Spinner from "../components/Spinner";

export default function Discover() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const locationState = (location.state as { 
    books?: any[]; 
    currentIndex?: number;
    preferences?: {
      genres?: string[];
      moods?: string[];
      tropes?: string[];
      representation?: string[];
      authors?: string[];
      formats?: string[];
  };
 }) || {};

  const [books, setBooks] = useState(locationState.books ?? []);
  const [currentIndex, setCurrentIndex] = useState(locationState.currentIndex ?? 0);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [preferences, setPreferences] = useState<{
    genres?: string[];
    moods?: string[];
    tropes?: string[];
    representation?: string[];
    authors?: string[];
    formats?: string[];
  } | null>(locationState.preferences ?? null);
  const [swipeState, setSwipeState] = useState<
    { direction: "left" | "right"; bookId: string } | null
  >(null);
  const [coverErrorId, setCoverErrorId] = useState<string | null>(null);
  const [dragStartX, setDragStartX] = useState<number | null>(null);
  const [dragDeltaX, setDragDeltaX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [randomLoadCount, setRandomLoadCount] = useState(0);

  function getSwipedBookIds(userId: string): string[] {
    try {
      const key = `swipedBooks_${userId}`;
      const raw = localStorage.getItem(key);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? (parsed as string[]) : [];
    } catch {
      return [];
    }
  }

  async function loadMoreRecommendations() {
    if (!user) return;

    const currentPrefs = preferences;

    if (!currentPrefs) {
      await loadRecommendations();
      return;
    }

    const maxRandomLoads = 5;
    if (randomLoadCount >= maxRandomLoads) {
      setLoadError(
        "You’ve seen most of what matches your filters. Try adjusting your preferences for more variety."
      );
      return;
    }

    setLoading(true);
    setLoadError(null);

    try {
      const results = await fetchBooksFromPreferences(currentPrefs, {
        randomizeStart: true,
      });

      const filteredResults = user
        ? (() => {
            const swipedIds = getSwipedBookIds(user.id);
            const existingIds = new Set(books.map((b) => b.id));
            return results.filter(
              (b: any) =>
                !swipedIds.includes(b.id) && !existingIds.has(b.id)
            );
          })()
        : results;

      setBooks((prev) => [...prev, ...filteredResults]);
      setRandomLoadCount((count) => count + 1);
    } catch (err) {
      console.error("Failed to load more recommended books", err);
      setLoadError(
        "Could not load more books right now. Please try again later."
      );
    } finally {
      setLoading(false);
    }
  }

  function addSwipedBookId(userId: string, bookId: string) {
    try {
      const key = `swipedBooks_${userId}`;
      const existing = getSwipedBookIds(userId);
      if (existing.includes(bookId)) return;
      const updated = [...existing, bookId];
      localStorage.setItem(key, JSON.stringify(updated));
    } catch {
     
    }
  }

  const currentBook = books[currentIndex] ?? null;

  const currentCoverUrl = currentBook
    ? (() => {
        const info = currentBook.volumeInfo ?? {};
        const identifiers = (info as any).industryIdentifiers as
          | { type: string; identifier: string }[]
          | undefined;

        let isbn: string | undefined;
        if (Array.isArray(identifiers)) {
          const isbn13 = identifiers.find((id) => id.type === "ISBN_13");
          const isbn10 = identifiers.find((id) => id.type === "ISBN_10");
          isbn = isbn13?.identifier || isbn10?.identifier;
        }
        

        const img = info.imageLinks ?? {};
        const googleCover = (img.thumbnail || img.smallThumbnail || "").replace(
          /^http:\/\//,
          "https://"
        );
        const openLibraryCover = isbn ? getOpenLibraryCover(isbn) : undefined;

        return googleCover || openLibraryCover || undefined;
      })()
    : undefined;

  async function loadRecommendations() {
    if (!user) return;

    if (locationState.books) {
      const baseBooks = locationState.books;
      const normalized = user
        ? (() => {
            const swipedIds = getSwipedBookIds(user.id);
            if (!Array.isArray(swipedIds) || swipedIds.length === 0) {
              return baseBooks;
            }
            return baseBooks.filter((b: any) => !swipedIds.includes(b.id));
          })()
        : baseBooks;

      setBooks(normalized);
      setCurrentIndex(locationState.currentIndex ?? 0);
      setPreferences(locationState.preferences ?? preferences);
      setRandomLoadCount(1);
      return;
    }

    setLoading(true);
    setLoadError(null);

    try {
      const prefs =
        locationState.preferences ?? (await getUserPreferences(user.id));
      if (!prefs) {
        setLoading(false);
        return;
      }

      setPreferences({
        genres: prefs.genres ?? [],
        moods: prefs.moods ?? [],
        tropes: prefs.tropes ?? [],
        representation: prefs.representation ?? [],
        authors: prefs.authors ?? [],
        formats: prefs.formats ?? [],
      });

      const results = await fetchBooksFromPreferences(prefs, {
        randomizeStart: true,
      });

      const filteredResults = user
        ? (() => {
            const swipedIds = getSwipedBookIds(user.id);
            if (!Array.isArray(swipedIds) || swipedIds.length === 0) {
              return results;
            }
            return results.filter((b: any) => !swipedIds.includes(b.id));
          })()
        : results;

      setBooks(filteredResults);
      setCurrentIndex(0);
      setRandomLoadCount(1);
    } catch (err) {
      console.error("Failed to load recommended books", err);
      setLoadError(
        "Could not load recommended books right now. Please try again later."
      );
      setBooks([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadRecommendations();
  }, [user]);

  function goToLibrary() {
    navigate("/library");
  }

  function advanceToNextBook() {
    if (!currentBook) return;

    if (user) {
      addSwipedBookId(user.id, currentBook.id);
    }

    setBooks((prev) => prev.filter((b) => b.id !== currentBook.id));
    setCurrentIndex(0);
  }

  function triggerSwipe(direction: "left" | "right", afterSwipe: () => void) {
    if (!currentBook) return;
    const bookId = currentBook.id;
    setSwipeState({ direction, bookId });

    setTimeout(() => {
      afterSwipe();
      setSwipeState(null);
    }, 300);
  }

  function handleSkipCurrent() {
    if (!currentBook) return;
    triggerSwipe("left", advanceToNextBook);
  }

  async function handleSaveCurrent() {
    if (!user || !currentBook) return;

    try {
      setSaving(true);
      const info = currentBook.volumeInfo ?? {};
      const identifiers = (info as any).industryIdentifiers as
        | { type: string; identifier: string }[]
        | undefined;

      let isbn: string | undefined;
      if (Array.isArray(identifiers)) {
        const isbn13 = identifiers.find((id) => id.type === "ISBN_13");
        const isbn10 = identifiers.find((id) => id.type === "ISBN_10");
        isbn = isbn13?.identifier || isbn10?.identifier;
      }

      const img = info.imageLinks ?? {};
      const googleCover = (img.thumbnail || img.smallThumbnail || "").replace(
        /^http:\/\//,
        "https://"
      );
      const openLibraryCover = isbn ? getOpenLibraryCover(isbn) : undefined;
      const coverUrl = googleCover || openLibraryCover || undefined;

      const alreadySaved = await isBookInLibrary(user.id, currentBook.id);
      if (alreadySaved) {
        setSaveMessage("This book has already been saved.");
        setTimeout(() => setSaveMessage(null), 3000);
        triggerSwipe("right", advanceToNextBook);
        return;
      }

    await addToLibrary({
  userId: user.id,
  googleVolumeId: currentBook.id,
  title: info.title,
  authors: info.authors,
  thumbnail: coverUrl,
  tropes: preferences?.tropes,
  representation: preferences?.representation,
  formats: preferences?.formats,
  moods: preferences?.moods,
});

      triggerSwipe("right", advanceToNextBook);
      setSaveMessage("Book saved to your library.");
      setTimeout(() => setSaveMessage(null), 3000);
    } finally {
      setSaving(false);
    }
  }

  const swipeDragThreshold = 80;

  function handleTouchStart(e: TouchEvent<HTMLDivElement>) {
    if (!currentBook || swipeState) return;
    const touch = e.touches[0];
    setDragStartX(touch.clientX);
    setDragDeltaX(0);
    setIsDragging(false);
  }

  function handleTouchMove(e: TouchEvent<HTMLDivElement>) {
    if (dragStartX === null || !currentBook || swipeState) return;
    const touch = e.touches[0];
    const delta = touch.clientX - dragStartX;
    setDragDeltaX(delta);
    if (Math.abs(delta) > 10 && !isDragging) {
      setIsDragging(true);
    }
  }

  function handleTouchEnd() {
    if (dragStartX === null || !currentBook || swipeState) {
      setDragStartX(null);
      setDragDeltaX(0);
      setIsDragging(false);
      return;
    }

    const delta = dragDeltaX;
    setDragStartX(null);
    setDragDeltaX(0);

    if (Math.abs(delta) < swipeDragThreshold) {
      setIsDragging(false);
      return;
    }

    if (delta < 0) {
      // swipe left = skip
      handleSkipCurrent();
    } else {
      // swipe right = save
      handleSaveCurrent();
    }

    setIsDragging(false);
  }

  return (
    <div className="discover-page">
      <h1 className="page-title">Discover</h1>

      <section
        className="results-section"
        aria-live="polite"
        aria-busy={loading ? "true" : "false"}
      >
        {loading ? (
          <div className="spinner-container">
            <Spinner label="Loading your recommendations..." />
          </div>
        ) : loadError ? (
          <div>
            <p>{loadError}</p>
            <button type="button" onClick={loadRecommendations}>
              Retry
            </button>
          </div>
        ) : currentBook ? (
          <div
            key={currentBook.id}
            className={(() => {
              const base = "discover-current-book";
              if (!swipeState || swipeState.bookId !== currentBook.id) {
                return base;
              }

              if (swipeState.direction === "left") {
                return base + " discover-current-book--swipe-left";
              }

              if (swipeState.direction === "right") {
                return base + " discover-current-book--swipe-right";
              }

              return base;
            })()}
            onClick={() => {
              if (isDragging || swipeState) return;
              navigate(`/book/${currentBook.id}` , {
                state: { books, currentIndex },
              });
            }}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            style={{
              cursor: "pointer",
              transform:
                !swipeState && dragStartX !== null
                  ? `translateX(${dragDeltaX}px) rotate(${dragDeltaX / 20}deg)`
                  : undefined,
            }}
          >
            {currentCoverUrl && coverErrorId !== currentBook.id ? (
              <img
                src={currentCoverUrl}
                alt={currentBook.volumeInfo.title}
                className="discover-book-cover"
                onError={() => setCoverErrorId(currentBook.id)}
              />
            ) : (
              <div className="discover-book-cover discover-book-cover--placeholder">
                No cover available
              </div>
            )}
            <h3>{currentBook.volumeInfo?.title}</h3>
            {currentBook.volumeInfo?.authors && (
              <p>{currentBook.volumeInfo.authors.join(", ")}</p>
            )}
          </div>
        ) : (
          <div>
            <p>No books to show right now.</p>
            <button
              type="button"
              onClick={loadMoreRecommendations}
              disabled={loading}
            >
              Load more recommendations
            </button>
          </div>
        )}
      </section>

      {saveMessage && (
        <div
          className={
            saveMessage === "This book has already been saved."
              ? "save-popup save-popup--already-saved"
              : "save-popup"
          }
          role="status"
          aria-live="polite"
        >
          {saveMessage}
        </div>
      )}
      <div className="bottom-nav">
        <button
          type="button"
          onClick={handleSkipCurrent}
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
