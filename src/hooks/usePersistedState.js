import { useEffect, useState } from "react";

const PREFIX = "valten-sheet:";
const API_URL = "/api/state";
const FLUSH_DELAY_MS = 800;

// Module-level so the ~20 fields on the sheet share one fetch and one debounced save.
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

function flushNow() {
  if (!remoteHydrated) return;
  clearTimeout(flushTimer);
  // keepalive: true lets the request survive page unload
  fetch(API_URL, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    keepalive: true,
    body: JSON.stringify(getAllLocalState()),
  }).catch(() => {});
}

function scheduleRemoteFlush() {
  // Don't push to remote until the initial load has resolved — otherwise a
  // fresh device would flush blank defaults and clobber data from another device.
  if (!remoteHydrated) return;
  clearTimeout(flushTimer);
  flushTimer = setTimeout(flushNow, FLUSH_DELAY_MS);
}

// Flush immediately when the tab goes to background or the page is unloading,
// so changes aren't lost when the user closes the browser before the debounce fires.
if (typeof document !== "undefined") {
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") flushNow();
  });
  window.addEventListener("pagehide", flushNow);
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
