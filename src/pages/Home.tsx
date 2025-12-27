import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();

  if (user) {
    return <Navigate to="/welcome" replace />;
  }

  return (
    <div className="home-page">
      <h1 className="home-page-title app-title">Bookify</h1>

      <div className="home-actions">
        <button type="button" onClick={() => navigate("/signin")}>Sign in</button>
        <button type="button" onClick={() => navigate("/register")}>Register</button>
      </div>

      <section className="home-about">
        <h2>About Bookify</h2>
        <p>
          Bookify helps you discover new books based on your preferences, moods,
          and favorite tropes. Create your own library, swipe through
          recommendations, and save the stories you love.
        </p>
      </section>
    </div>
  );
}
