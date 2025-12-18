import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { fetchBookById, getOpenLibraryCover } from "../api/googleBooks";
import { useAuth } from "../context/AuthContext";
import { addToLibrary, isBookInLibrary } from "../api/library";

interface VolumeInfo {
  title?: string;
  authors?: string[];
  publishedDate?: string;
  description?: string;
  imageLinks?: {
    thumbnail?: string;
    smallThumbnail?: string;
  };
}

interface Book {
  id: string;
  volumeInfo?: VolumeInfo;
}

export default function BookDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!saveMessage) return;

    const timeout = setTimeout(() => {
      setSaveMessage(null);
    }, 3000);

    return () => clearTimeout(timeout);
  }, [saveMessage]);

  useEffect(() => {
    if (!id) {
      setError("No book found.");
      setLoading(false);
      return;
    }

    let isMounted = true;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const data = await fetchBookById(id!);
        if (!isMounted) return;
        setBook(data);
      } catch (err: any) {
        console.error(err);
        if (!isMounted) return;
        setError("Could not fetch book details.");
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      isMounted = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div role="status" aria-live="polite">
        Loading book...
      </div>
    );
  }

  if (error || !book) {
    return (
      <div role="alert" aria-live="assertive">
        <p>
          {error ?? "We couldn't load this book right now. Please try again later."}
        </p>
        <button type="button" onClick={() => navigate(-1)}>
          Go back
        </button>
      </div>
    );
  }

  const info = book.volumeInfo ?? {};
  const identifiers = (info as any).industryIdentifiers as
    | { type: string; identifier: string }[]
    | undefined;

  let isbn: string | undefined;
  if (Array.isArray(identifiers)) {
    const isbn13 = identifiers.find((id) => id.type === "ISBN_13");
    const isbn10 = identifiers.find((id) => id.type === "ISBN_10");
    isbn = isbn13?.identifier || isbn10?.identifier;
  }

  const imgLinks = info.imageLinks ?? {};
  const image =
    (isbn ? getOpenLibraryCover(isbn) : undefined) ||
    imgLinks.thumbnail ||
    imgLinks.smallThumbnail ||
    undefined;

  const discoverState = (location.state as { books?: any[]; currentIndex?: number }) || {};
  const discoverBooks = discoverState.books ?? [];
  const discoverIndex = discoverState.currentIndex ?? 0;

  function handleSkipToNextInDiscover() {
    if (!discoverBooks.length) {
      navigate("/discover");
      return;
    }

    const filtered = discoverBooks.filter((_: any, idx: number) => idx !== discoverIndex);

    if (filtered.length === 0) {
      navigate("/discover", { state: { books: [] } });
      return;
    }

    const nextIndex = discoverIndex >= filtered.length ? 0 : discoverIndex;
    navigate("/discover", {
      state: { books: filtered, currentIndex: nextIndex },
    });
  }

  function goToLibrary() {
    navigate("/library");
  }

  async function handleSaveCurrent() {
    if (!user || !book) return;

    try {
      setSaving(true);
      setSaveMessage(null);

      const alreadySaved = await isBookInLibrary(user.id, book.id);
      if (alreadySaved) {
        setSaveMessage("This book has already been saved.");
        return;
      }

      await addToLibrary({
        userId: user.id,
        googleVolumeId: book.id,
        title: info.title,
        authors: info.authors,
        thumbnail: image,
      });

      setSaveMessage("Book saved to your library.");
    } catch (err: any) {
      console.error(err);
      setSaveMessage("Could not save book. Try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="book-detail-page">
      <button onClick={() => navigate(-1)}>Go Back</button>

      <div className="book-detail-content">
        {image && (
          <img
            src={image}
            alt={info.title ?? "Book cover"}
            className="book-detail-cover"
          />
        )}

        <div className="book-detail-info">
          <h1 className="page-title">{info.title ?? "Title missing"}</h1>
          {info.authors && <p>Authors: {info.authors.join(", ")}</p>}
          {info.publishedDate && <p>Published date: {info.publishedDate}</p>}

          {info.description && (
            <section className="book-detail-description">
              <h2>Description</h2>
              <p>{info.description}</p>
            </section>
          )}
        </div>
      </div>
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
          onClick={handleSkipToNextInDiscover}
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
          disabled={!book || !user || saving}
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
