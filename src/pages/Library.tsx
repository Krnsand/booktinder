import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getLibrary, updateLibraryItem, type LibraryItem } from "../api/library";

export default function Library() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [items, setItems] = useState<LibraryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    let isMounted = true;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await getLibrary(user.id);
        if (!isMounted) return;
        setItems(data);
      } catch (err: any) {
        console.error(err);
        if (!isMounted) return;
        setError("Kunde inte hämta bibliotek.");
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    load();

    return () => {
      isMounted = false;
    };
  }, [user]);

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

  return (
    <div
      className="library-page"
      onClick={() => {
        if (openMenuId !== null) {
          setOpenMenuId(null);
        }
      }}
    >
      <h1>My Library / Favorites</h1>

      <button onClick={goToDiscover}>Back to Discover</button>

      {loading && <p>Laddar bibliotek...</p>}
      {error && <p className="error-message">{error}</p>}

      {!loading && !error && items.length === 0 && (
        <p>Du har inga sparade böcker ännu.</p>
      )}

      {!loading && items.length > 0 && (
        <ul className="library-list">
          {items.map((item) => (
            <li
              key={item.id}
              className="library-card"
              onClick={() => navigate(`/book/${item.google_volume_id}`)}
              style={{ cursor: "pointer" }}
            >
              {item.thumbnail && (
                <img
                  src={item.thumbnail}
                  alt={item.title ?? "Bokomslag"}
                  className="library-card-cover"
                />
              )}
              <div className="library-card-main">
                <h3>{item.title ?? "Titel saknas"}</h3>
                {(() => {
                  const a = item.authors;
                  const text = Array.isArray(a)
                    ? a.join(", ")
                    : typeof a === "string"
                    ? a
                    : null;
                  return text ? <p>{text}</p> : null;
                })()}
              </div>
              <div className="library-card-status">
                {item.is_favorite && <span className="status-icon heart">♥</span>}
                {item.has_read && <span className="status-icon check">✓</span>}
              </div>
              <div className="library-card-menu">
                <button
                  className="menu-button"
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpenMenuId((prev) => (prev === item.id ? null : item.id));
                  }}
                >
                  &#8942;
                </button>
                {openMenuId === item.id && (
                  <div
                    className="menu-dropdown"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      type="button"
                      className={item.is_favorite ? "menu-item active" : "menu-item"}
                      onClick={() => toggleItem(item.id, "is_favorite")}
                    >
                      Favorite
                    </button>
                    <button
                      type="button"
                      className={item.has_read ? "menu-item active" : "menu-item"}
                      onClick={() => toggleItem(item.id, "has_read")}
                    >
                      Have Read
                    </button>
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

