import type { LibraryItem } from "../api/library";

interface BookCardProps {
  item: LibraryItem;
  isMenuOpen: boolean;
  onClick: () => void;
  onToggleMenu: () => void;
  onToggleFavorite: () => void;
  onToggleHasRead: () => void;
  onRemove: () => void;
  selectable?: boolean;
  selected?: boolean;
  onToggleSelect?: () => void;
}

export default function BookCard({
  item,
  isMenuOpen,
  onClick,
  onToggleMenu,
  onToggleFavorite,
  onToggleHasRead,
  onRemove,
  selectable = false,
  selected = false,
  onToggleSelect,
}: BookCardProps) {
  return (
    <li
      className="library-card"
      onClick={onClick}
      style={{ cursor: "pointer" }}
    >
      {item.thumbnail && (
        <img
          src={item.thumbnail}
          alt={item.title ?? "Book cover"}
          className="library-card-cover"
          loading="lazy"
        />
      )}
      <div className="library-card-main">
        <h2>{item.title ?? "Title missing"}</h2>
        {(() => {
          const a = item.authors;
          const text = Array.isArray(a)
            ? a.join(", ")
            : typeof a === "string"
            ? (() => {
                const trimmed = a.trim();
                if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
                  try {
                    const parsed = JSON.parse(trimmed);
                    if (Array.isArray(parsed)) {
                      return parsed.join(", ");
                    }
                  } catch {
                  }
                }
                return trimmed.replace(/^"|"$/g, "");
              })()
            : null;
          return text ? <p>{text}</p> : null;
        })()}
      </div>
      <div className="library-card-status">
        {item.is_favorite && <span className="status-icon heart">♥</span>}
        {item.has_read && <span className="status-icon check">✓</span>}
      </div>
      <div className="library-card-menu">
        {selectable ? (
          <input
            type="checkbox"
            checked={selected}
            onChange={(e) => {
              e.stopPropagation();
              onToggleSelect && onToggleSelect();
            }}
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <>
            <button
              className="menu-button"
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleMenu();
              }}
            >
              &#8942;
            </button>
            {isMenuOpen && (
              <div
                className="menu-dropdown"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  type="button"
                  className={item.is_favorite ? "menu-item active" : "menu-item"}
                  onClick={onToggleFavorite}
                >
                  Favorite
                </button>
                <button
                  type="button"
                  className={item.has_read ? "menu-item active" : "menu-item"}
                  onClick={onToggleHasRead}
                >
                  Have Read
                </button>
                <button
                  type="button"
                  className="menu-item remove"
                  onClick={onRemove}
                >
                  Remove book
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </li>
  );
}
