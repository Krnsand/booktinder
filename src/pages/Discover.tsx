import { useLocation, useNavigate } from "react-router-dom";

interface DiscoverLocationState {
  books?: any[];
  selectedGenres?: string[];
}

export default function Discover() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state as DiscoverLocationState) || {};
  const books = state.books ?? [];

  function goToLibrary() {
    navigate("/library");
  }

  function goToPreferences() {
    navigate("/preferences");
  }

  return (
    <div className="discover-page">
      <h1>Discover</h1>

      <button onClick={goToPreferences}>Back to preferences</button>

      <section className="results-section">
        {books.length > 0 ? (
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
        ) : (
          <p>Inga böcker att visa. Gå tillbaka till dina preferenser.</p>
        )}
      </section>

      <div className="bottom-nav">
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
      </div>
    </div>
  );
}
