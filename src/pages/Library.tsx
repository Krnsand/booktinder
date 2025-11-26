import { useNavigate } from "react-router-dom";

export default function Library() {
  const navigate = useNavigate();

  function goToDiscover() {
    navigate("/discover");
  }

  return (
    <div className="library-page">
      <h1>My Library / Favorites</h1>

      <p>Here you will see the books you have saved as favorites.</p>

      <button onClick={goToDiscover}>Back to Discover</button>
    </div>
  );
}

