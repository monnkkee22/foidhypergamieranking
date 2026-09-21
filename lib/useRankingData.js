"use client";

import { useEffect, useRef, useState } from "react";

const UPDATE_EVENT = "ranking-data-updated";

// Wird vom Admin-Menü nach dem Speichern aufgerufen, damit Navigation,
// Übersicht und Ranglisten-Seite sofort die neuen Daten zeigen (ohne
// Seite neu zu laden).
export function publishDataUpdate(data) {
  window.dispatchEvent(new CustomEvent(UPDATE_EVENT, { detail: data }));
}

// Lädt die aktuellen Daten vom Server und aktualisiert sich automatisch,
// wenn im Admin-Menü etwas gespeichert wurde.
export function useRankingData() {
  const [data, setData] = useState(null);
  const [loadError, setLoadError] = useState("");
  const gotUpdate = useRef(false);

  useEffect(() => {
    let cancelled = false;

    fetch("/api/data", { cache: "no-store" })
      .then((r) => r.json())
      .then((json) => {
        if (cancelled || gotUpdate.current) return;
        if (json && json.rankings) {
          setData(json);
          setLoadError("");
        } else {
          setLoadError(json?.error || "Daten konnten nicht geladen werden.");
        }
      })
      .catch(() => {
        if (!cancelled && !gotUpdate.current) setLoadError("Verbindung fehlgeschlagen.");
      });

    function onUpdate(e) {
      if (e.detail && e.detail.rankings) {
        gotUpdate.current = true;
        setData(e.detail);
        setLoadError("");
      }
    }
    window.addEventListener(UPDATE_EVENT, onUpdate);

    return () => {
      cancelled = true;
      window.removeEventListener(UPDATE_EVENT, onUpdate);
    };
  }, []);

  return { data, loadError };
}
