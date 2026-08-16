import "./Home.css";

export default function Login() {
  return (
    <div className="home">
      <div className="home__card">
        <h1 className="home__title">D&D Character Sheet</h1>
        <p className="home__subtitle">
          Track your characters, spells, and equipment — with optional Google Sheet
          import and AI-generated portraits.
        </p>
        <a className="home__google-btn" href="/api/auth/google">
          Sign in with Google
        </a>
      </div>
    </div>
  );
}
