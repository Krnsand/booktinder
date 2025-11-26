import { useNavigate } from "react-router-dom";

export default function Discover() {
  const navigate = useNavigate();

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

      <div className="discover-content">
      </div>

      <div className="bottom-nav">
        <button onClick={goToLibrary}>Go to my Library/Favorites</button>
      </div>
    </div>
  );
}
