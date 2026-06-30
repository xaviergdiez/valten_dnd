import { useEffect, useState } from "react";

const PREFIX = "valten-sheet:";
const API_URL = "/api/state";
const FLUSH_DELAY_MS = 1500;

// Module-level (not per-hook) so the ~20 fields on the sheet share one
// fetch-on-load and one debounced save, instead of each firing its own.
let remoteHydrated = false;
let remoteStatePromise = null;
let flushTimer = null;

function getAllLocalState() {
  const all = {};
  for (let i = 0; i < localStorage.length; i++) {
    const fullKey = localStorage.key(i);
    if (fullKey?.startsWith(PREFIX)) {
      try {
        all[fullKey.slice(PREFIX.length)] = JSON.parse(localStorage.getItem(fullKey));
      } catch {
        // skip unparseable entries
      }
    }
  }
  return all;
}

export function fetchRemoteState() {
  if (!remoteStatePromise) {
    remoteStatePromise = fetch(API_URL)
      .then((res) => (res.ok ? res.json() : {}))
      .catch(() => ({}))
      .then((data) => {
        remoteHydrated = true;
        return data;
      });
  }
  return remoteStatePromise;
}

function scheduleRemoteFlush() {
  // Don't push to remote until the initial load has resolved — otherwise a
  // fresh device/browser would flush its blank defaults and clobber data
  // already saved from another device before the hydration fetch returns.
  if (!remoteHydrated) return;
  clearTimeout(flushTimer);
  flushTimer = setTimeout(() => {
    fetch(API_URL, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(getAllLocalState()),
    }).catch(() => {
      // offline or API unavailable — local copy still works
    });
  }, FLUSH_DELAY_MS);
}

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
    fetchRemoteState().then((remote) => {
      if (Object.prototype.hasOwnProperty.call(remote, key)) {
        setValue(remote[key]);
      }
    });
  }, [key]);

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(value));
    } catch {
      // storage unavailable (private browsing, quota) — state still works in-memory
    }
    scheduleRemoteFlush();
  }, [storageKey, value]);

  return [value, setValue];
}
