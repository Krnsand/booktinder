import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { fetchBookById } from "../api/googleBooks";
import { useAuth } from "../context/AuthContext";
import { addToLibrary } from "../api/library";

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
  const { user } = useAuth();
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setError("Ingen bok hittades.");
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
        setError("Kunde inte hämta bokdetaljer.");
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
    return <div>Laddar bok...</div>;
  }

  if (error || !book) {
    return (
      <div>
        <p>{error ?? "Ingen bok hittades."}</p>
        <button onClick={() => navigate(-1)}>Tillbaka</button>
      </div>
    );
  }

  const info = book.volumeInfo ?? {};
  const image =
    info.imageLinks?.thumbnail || info.imageLinks?.smallThumbnail || undefined;

  return (
    <div className="book-detail-page">
      <button onClick={() => navigate(-1)}>Tillbaka</button>

      <div className="book-detail-content">
        {image && (
          <img
            src={image}
            alt={info.title ?? "Bokomslag"}
            className="book-detail-cover"
          />
        )}

        <div className="book-detail-info">
          <h1>{info.title ?? "Titel saknas"}</h1>
          {info.authors && <p>Författare: {info.authors.join(", ")}</p>}
          {info.publishedDate && <p>Utgivningsdatum: {info.publishedDate}</p>}

          <button
            disabled={!user || saving}
            onClick={async () => {
              if (!user) return;
              if (!book.id) return;
              setSaving(true);
              setSaveMessage(null);
              try {
                await addToLibrary({
                  userId: user.id,
                  googleVolumeId: book.id,
                  title: info.title,
                  authors: info.authors,
                  thumbnail: image,
                });
                setSaveMessage("Bok sparad i ditt bibliotek.");
              } catch (err: any) {
                console.error(err);
                setSaveMessage("Kunde inte spara boken. Försök igen.");
              } finally {
                setSaving(false);
              }
            }}
          >
            {saving ? "Sparar..." : "Spara i bibliotek"}
          </button>

          {saveMessage && <p className="save-message">{saveMessage}</p>}

          {info.description && (
            <section className="book-detail-description">
              <h2>Beskrivning</h2>
              <p>{info.description}</p>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

