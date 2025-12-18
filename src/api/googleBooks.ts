export async function fetchBooks(query: string) {
  const response = await fetch(
    `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch books");
  }

  const data = await response.json();
  return data.items || [];
}

export async function fetchBookById(id: string) {
  const response = await fetch(
    `https://www.googleapis.com/books/v1/volumes/${encodeURIComponent(id)}`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch book details");
  }

  const data = await response.json();
  return data;
}

export function getOpenLibraryCover(isbn: string): string {
  return `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg`;
}
