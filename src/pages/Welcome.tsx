import { useNavigate } from "react-router-dom";

export default function Welcome() {
  const navigate = useNavigate();

  function handleNext() {
    navigate("/preferences");
  }

  return (
    <div className="welcome-page">
      <h1 className="home-page-title app-title">Bookify</h1>

      <section className="welcome-content">
        <h3>Welcome to Bookify!</h3>
        <p>
          An app who’s purpose is 
          to help you find new books 
          that you actually like. Start 
          by setting your preferences to the kinds 
          of books you would like to find. You will 
          be able to change these whenever you feel like exploring new things.
        </p>
      </section>

      <div className="bottom-nav">
        <button type="button" onClick={handleNext}>
          Next
        </button>
      </div>
    </div>
  );
}
