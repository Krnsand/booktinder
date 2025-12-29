import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Header() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const initial = user?.email?.[0]?.toUpperCase() ?? "?";
  const avatarUrl = (user as any)?.user_metadata?.avatar_url as string | undefined;

  const location = useLocation();
  const isNotPreferencesPage = location.pathname !== "/preferences";
  const isProfilePage = location.pathname === "/profile";

 async function handleSignOutFromHeader() {
  const confirmed = window.confirm("Are you sure you want to sign out?");
  if (!confirmed) return;

  try {
    await signOut();
    navigate("/signin");
  } catch (err) {
    console.error("Sign out failed", err);
    window.alert("Could not sign out. Check console for details.");
  }
}

  return (
    <header className="app-header">
      <div className="header-left">
        {isNotPreferencesPage && (
          <button
            type="button"
            onClick={() => navigate("/preferences")}
            aria-label="Go to preferences"
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
              <path d="M14 17H5" />
              <path d="M19 7h-9" />
              <circle cx="17" cy="17" r="3" />
              <circle cx="7" cy="7" r="3" />
            </svg>
          </button>
        )}
      </div>
      <h1 className="app-title">Bookify</h1>
    <nav className="app-nav">
  {isProfilePage ? (
    <button
      type="button"
      className="profile-icon-button"
      onClick={handleSignOutFromHeader}
    >
      Sign out
    </button>
  ) : (
    <button
      className="profile-icon-button"
      aria-label="Profile"
      onClick={() => navigate("/profile")}
    >
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt={user?.user_metadata?.username ?? "Profile avatar"}
          style={{
            width: "100%",
            height: "100%",
            borderRadius: "50%",
            objectFit: "cover",
          }}
        />
      ) : (
        initial
      )}
    </button>
  )}
</nav>
    </header>
  );
}