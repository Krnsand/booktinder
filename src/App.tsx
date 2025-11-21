import { useEffect, useState } from "react";
import { fetchBooks } from "./api/googleBooks";

export default function App() {
  const [books, setBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadBooks() {
      setLoading(true);
      try {
        const results = await fetchBooks("alchemised");
        setBooks(results);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadBooks();
  }, []);

  return (
    <div>
      <h1>BookTinder Test</h1>
      {loading && <p>Loading...</p>}
      {!loading && books.map((book) => (
        <div key={book.id}>
          <h3>{book.volumeInfo.title}</h3>
        </div>
      ))}
    </div>
  );
}
