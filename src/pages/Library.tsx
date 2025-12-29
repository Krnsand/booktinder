import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getLibrary, updateLibraryItem, deleteLibraryItem, type LibraryItem } from "../api/library";
import BookCard from "../components/BookCard";
import Spinner from "../components/Spinner";

export default function Library() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [items, setItems] = useState<LibraryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [sortMode, setSortMode] = useState<"none" | "alpha" | "favorites" | "has_read">("none");
  const [multiSelectEnabled, setMultiSelectEnabled] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    if (!user) return;

    const userId = user.id;
    let isMounted = true;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await getLibrary(userId);
        if (!isMounted) return;
        setItems(data);
      } catch (err: any) {
        console.error(err);
        if (!isMounted) return;
        setError("Could not load library.");
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    load();

    return () => {
      isMounted = false;
    };
  }, [user]);

  async function removeSelected() {
    if (selectedIds.length === 0) return;

    const confirmMessage =
      selectedIds.length === 1
        ? "Remove this book from your library?"
        : `Remove ${selectedIds.length} books from your library?`;

    if (!window.confirm(confirmMessage)) {
      return;
    }

    try {
      for (const id of selectedIds) {
        await deleteLibraryItem(id);
      }
      setItems((prev) => prev.filter((it) => !selectedIds.includes(it.id)));
      setSelectedIds([]);
      setMultiSelectEnabled(false);
      setOpenMenuId(null);
    } catch (err) {
      console.error(err);
    }
  }

  async function removeItem(id: string) {
    try {
      if (!window.confirm("Are you sure?")) {
        return;
      }
      await deleteLibraryItem(id);
      setItems((prev) => prev.filter((it) => it.id !== id));
      setOpenMenuId(null);
    } catch (err) {
      console.error(err);
    }
  }

  async function toggleItem(id: string, field: "is_favorite" | "has_read") {
    try {
      const target = items.find((it) => it.id === id);
      if (!target) return;
      const updated = await updateLibraryItem(id, { [field]: !target[field] });
      setItems((prev) => prev.map((it) => (it.id === id ? updated : it)));
      setOpenMenuId(null);
    } catch (err) {
      console.error(err);
    }
  }

  function goToDiscover() {
    navigate("/discover");
  }

  let displayedItems = [...items];

  if (sortMode === "alpha") {
    displayedItems.sort((a, b) => {
      const titleA = (a.title ?? "").toLowerCase();
      const titleB = (b.title ?? "").toLowerCase();
      if (titleA < titleB) return -1;
      if (titleA > titleB) return 1;
      return 0;
    });
  } else if (sortMode === "favorites") {
    displayedItems.sort((a, b) => {
      const favA = a.is_favorite ? 1 : 0;
      const favB = b.is_favorite ? 1 : 0;
      return favB - favA; 
    });
  } else if (sortMode === "has_read") {
    displayedItems.sort((a, b) => {
      const readA = a.has_read ? 1 : 0;
      const readB = b.has_read ? 1 : 0;
      return readB - readA; 
    });
  }

  return (
    <div
      className="library-page"
      onClick={() => {
        if (openMenuId !== null) {
          setOpenMenuId(null);
        }
      }}
    >
      <h1 className="page-title">My Library</h1>
      {!loading && !error && items.length > 0 && (
        <div className="library-header-row">
          <div className="library-sort">
            <label>
              Sort by:{" "}
              <select
                value={sortMode}
                onChange={(e) =>
                  setSortMode(
                    e.target.value as
                      | "none"
                      | "alpha"
                      | "favorites"
                      | "has_read"
                  )
                }
              >
                <option value="none">Clear filter</option>
                <option value="alpha">Alphabetical (title)</option>
                <option value="favorites">Favorites</option>
                <option value="has_read">Has read</option>
              </select>
            </label>
          </div>
          <div className="library-actions">
            {!multiSelectEnabled && (
              <button className="delete-multiple-btn"
                type="button"
                onClick={() => {
                  setMultiSelectEnabled(true);
                  setSelectedIds([]);
                }}
              >
                Select multiple
              </button>
            )}
            {multiSelectEnabled && (
              <>
                <button className="delete-multiple-btn"
                  type="button"
                  onClick={() => {
                    setMultiSelectEnabled(false);
                    setSelectedIds([]);
                  }}
                >
                  Cancel
                </button>
                <button className="delete-multiple-btn"
                  type="button"
                  onClick={removeSelected}
                  disabled={selectedIds.length === 0}
                >
                  Remove selected ({selectedIds.length})
                </button>
              </>
            )}
          </div>
        </div>
      )}
      {loading && (
        <div className="spinner-container">
          <Spinner label="Loading library..." />
        </div>
      )}
      {error && (
        <p className="error-message" role="alert" aria-live="assertive">
          {error}
        </p>
      )}

      {!loading && !error && items.length === 0 && (
        <p className="empty-library" role="status" aria-live="polite">
          You have no saved books yet.
        </p>
      )}

      {!loading && items.length > 0 && (
        <ul className="library-list">
          {displayedItems.map((item) => (
            <BookCard
              key={item.id}
              item={item}
              isMenuOpen={openMenuId === item.id}
              onClick={() => navigate(`/book/${item.google_volume_id}`)}
              onToggleMenu={() =>
                setOpenMenuId((prev) => (prev === item.id ? null : item.id))
              }
              onToggleFavorite={() => toggleItem(item.id, "is_favorite")}
              onToggleHasRead={() => toggleItem(item.id, "has_read")}
              onRemove={() => removeItem(item.id)}
              selectable={multiSelectEnabled}
              selected={selectedIds.includes(item.id)}
              onToggleSelect={() => {
                setSelectedIds((prev) =>
                  prev.includes(item.id)
                    ? prev.filter((id) => id !== item.id)
                    : [...prev, item.id]
                );
              }}
            />
          ))}
        </ul>
      )}

      <div className="bottom-nav">
        <button onClick={goToDiscover}>Back to Discover</button>
      </div>
    </div>
  );
}

