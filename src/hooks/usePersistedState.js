import { useEffect, useState } from "react";

const PREFIX = "valten-sheet:";

export function usePersistedState(key, defaultValue) {
  const storageKey = PREFIX + key;
  const [value, setValue] = useState(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      return stored !== null ? JSON.parse(stored) : defaultValue;
    } catch {
      return defaultValue;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(value));
    } catch {
      // storage unavailable (private browsing, quota) — state still works in-memory
    }
  }, [storageKey, value]);

  return [value, setValue];
}
