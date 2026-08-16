import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import Login from "./Login.jsx";
import CharacterList from "./CharacterList.jsx";
import "./styles/tokens.css";
import "./styles/global.css";

// Hash router — #/characters, #/char/<cid>. Character open/close does a full
// page reload so the usePersistedState module singletons and the mutable spell
// catalog reinitialize per character.
// ponytail: refactor to per-char instances only if switch latency ever matters
function Root() {
  const [me, setMe] = useState(undefined); // undefined = loading, null = signed out
  const [hash, setHash] = useState(window.location.hash);

  useEffect(() => {
    const onChange = () => setHash(window.location.hash);
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
  }, []);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : null))
      .catch(() => null)
      .then(setMe);
  }, []);

  if (me === undefined) return null;
  if (me === null) return <Login />;

  const charMatch = hash.match(/^#\/char\/([a-z0-9-]+)/);
  if (charMatch) return <App charId={charMatch[1]} me={me} />;
  return <CharacterList me={me} />;
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
);
