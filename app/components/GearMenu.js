"use client";

import { useRef, useState } from "react";
import styles from "./GearMenu.module.css";
import { publishDataUpdate } from "../../lib/useRankingData";
import {
  MAX_ENTRIES,
  MAX_RANKINGS,
  MAX_TITLE_LENGTH,
  MAX_DESCRIPTION_LENGTH,
  newRankingId,
  nextAccent
} from "../../lib/rankingUtils";

function newAnnouncementId() {
  return `a_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function toLocalInputValue(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
}

export default function GearMenu() {
  const [open, setOpen] = useState(false);
  const [authed, setAuthed] = useState(false);
  const [code, setCode] = useState("");
  const [codeError, setCodeError] = useState("");
  const [checking, setChecking] = useState(false);

  const [data, setData] = useState(null);
  const [tab, setTab] = useState("ranglisten");
  const [status, setStatus] = useState("");
  const [saving, setSaving] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState(null); // Schlüssel des Eintrags, der gerade bestätigt werden soll
  const focusRankingId = useRef(null); // neu erstelltes Ranking: Titelfeld fokussieren

  function resetAndClose() {
    setOpen(false);
    setAuthed(false);
    setCode("");
    setCodeError("");
    setData(null);
    setStatus("");
    setTab("ranglisten");
    setConfirmRemove(null);
  }

  async function handleUnlock(e) {
    e.preventDefault();
    if (!code) return;
    setChecking(true);
    setCodeError("");
    try {
      const verifyRes = await fetch("/api/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, verifyOnly: true })
      });
      if (!verifyRes.ok) {
        setCodeError("Falscher Code.");
        setChecking(false);
        return;
      }
      const dataRes = await fetch("/api/data", { cache: "no-store" });
      const freshData = await dataRes.json();
      setData(freshData);
      setAuthed(true);
    } catch (err) {
      setCodeError("Verbindung fehlgeschlagen. Versuch es erneut.");
    } finally {
      setChecking(false);
    }
  }

  function updateEntry(rankingId, index, field, value) {
    setStatus("");
    setData((prev) => {
      const next = structuredClone(prev);
      next.rankings[rankingId].entries[index][field] =
        field === "elo" ? Number(value) : value;
      return next;
    });
  }

  function addEntry(rankingId) {
    setStatus("");
    setData((prev) => {
      const next = structuredClone(prev);
      if (next.rankings[rankingId].entries.length >= MAX_ENTRIES) return next;
      next.rankings[rankingId].entries.push({ name: "Neuer Name", elo: 1000 });
      return next;
    });
  }

  function removeEntry(rankingId, index) {
    setStatus("");
    setData((prev) => {
      const next = structuredClone(prev);
      next.rankings[rankingId].entries.splice(index, 1);
      return next;
    });
    setConfirmRemove(null);
  }

  function updateRankingTitle(rankingId, title) {
    setStatus("");
    setData((prev) => {
      const next = structuredClone(prev);
      next.rankings[rankingId].title = title;
      return next;
    });
  }

  function updateRankingDescription(rankingId, description) {
    setStatus("");
    setData((prev) => {
      const next = structuredClone(prev);
      next.rankings[rankingId].description = description;
      return next;
    });
  }

  function addRanking() {
    setStatus("");
    const id = newRankingId();
    focusRankingId.current = id;
    setData((prev) => {
      const next = structuredClone(prev);
      next.rankings = next.rankings || {};
      if (Object.keys(next.rankings).length >= MAX_RANKINGS) return next;
      next.rankings[id] = {
        title: "Neues Ranking",
        description: "",
        accent: nextAccent(next.rankings),
        entries: []
      };
      return next;
    });
  }

  function removeRanking(rankingId) {
    setStatus("");
    setData((prev) => {
      const next = structuredClone(prev);
      delete next.rankings[rankingId];
      return next;
    });
    setConfirmRemove(null);
  }

  function addAnnouncement() {
    setStatus("");
    setData((prev) => {
      const next = structuredClone(prev);
      const inOneHour = new Date(Date.now() + 60 * 60 * 1000).toISOString();
      next.announcements = next.announcements || [];
      next.announcements.push({ id: newAnnouncementId(), text: "", time: inOneHour });
      return next;
    });
  }

  function updateAnnouncement(id, field, value) {
    setStatus("");
    setData((prev) => {
      const next = structuredClone(prev);
      const ann = next.announcements.find((a) => a.id === id);
      if (!ann) return next;
      if (field === "time") {
        ann.time = new Date(value).toISOString();
      } else {
        ann.text = value;
      }
      return next;
    });
  }

  function removeAnnouncement(id) {
    setStatus("");
    setData((prev) => {
      const next = structuredClone(prev);
      next.announcements = next.announcements.filter((a) => a.id !== id);
      return next;
    });
    setConfirmRemove(null);
  }

  async function handleSave() {
    setSaving(true);
    setStatus("");
    try {
      const res = await fetch("/api/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, data })
      });
      const result = await res.json().catch(() => ({}));
      if (!res.ok) {
        setStatus(result.error || `Fehler (${res.status})`);
      } else {
        // Vom Server bereinigte Daten übernehmen und Navigation/Seiten
        // sofort aktualisieren (für alle anderen Besucher gilt es ab jetzt
        // beim nächsten Laden, da es im Blob-Store liegt).
        if (result.data) {
          setData(result.data);
          publishDataUpdate(result.data);
        }
        setStatus("ok");
      }
    } catch (err) {
      setStatus("Verbindung fehlgeschlagen: " + (err?.message || String(err)));
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <button
        className={styles.gear}
        onClick={() => setOpen(true)}
        aria-label="Einstellungen öffnen"
        title="Einstellungen"
      >
        <GearIcon />
      </button>

      {open && (
        <div className={styles.overlay} onClick={resetAndClose}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <button className={styles.close} onClick={resetAndClose} aria-label="Schließen">
              ×
            </button>

            {!authed && (
              <form className={styles.loginForm} onSubmit={handleUnlock}>
                <div className={styles.lockIcon}>
                  <LockIcon />
                </div>
                <h2 className={styles.loginTitle}>Bearbeiten</h2>
                <p className={styles.loginHint}>
                  Gib den Admin-Code ein, um Ranglisten zu erstellen, zu bearbeiten oder zu löschen und Ankündigungen zu verwalten.
                </p>
                <input
                  type="password"
                  value={code}
                  onChange={(e) => {
                    setCode(e.target.value);
                    if (codeError) setCodeError("");
                  }}
                  className={`${styles.codeInput} ${codeError ? styles.codeInputError : ""}`}
                  placeholder="Admin-Code"
                  autoFocus
                />
                {codeError && <p className={styles.errorText}>{codeError}</p>}
                <button
                  type="submit"
                  className={styles.primaryButton}
                  disabled={checking || !code}
                >
                  {checking ? "Prüfe..." : "Entsperren"}
                </button>
              </form>
            )}

            {authed && data && (
              <div className={styles.panel}>
                <div className={styles.panelHeader}>
                  <span className={styles.unlockedBadge}>
                    <CheckIcon /> Entsperrt
                  </span>
                </div>

                <div className={styles.tabs}>
                  <button
                    className={`${styles.tab} ${tab === "ranglisten" ? styles.tabActive : ""}`}
                    onClick={() => setTab("ranglisten")}
                  >
                    Ranglisten
                  </button>
                  <button
                    className={`${styles.tab} ${tab === "ankuendigungen" ? styles.tabActive : ""}`}
                    onClick={() => setTab("ankuendigungen")}
                  >
                    Ankündigungen
                  </button>
                </div>

                {tab === "ranglisten" && (
                  <div className={styles.tabContent}>
                    {Object.keys(data.rankings).length === 0 && (
                      <p className={styles.emptyHint}>Noch keine Ranglisten.</p>
                    )}
                    {Object.entries(data.rankings).map(([rankingId, ranking]) => {
                      const removeRankingKey = `ranking-${rankingId}`;
                      return (
                      <div key={rankingId} className={styles.rankingBlock}>
                        <div className={styles.rankingHeader}>
                          <input
                            className={styles.titleInput}
                            value={ranking.title}
                            maxLength={MAX_TITLE_LENGTH}
                            onChange={(e) => updateRankingTitle(rankingId, e.target.value)}
                            placeholder="Titel"
                            ref={(el) => {
                              if (el && focusRankingId.current === rankingId) {
                                focusRankingId.current = null;
                                el.focus();
                                el.select();
                                el.scrollIntoView({ block: "nearest" });
                              }
                            }}
                          />
                          {confirmRemove === removeRankingKey ? (
                            <button
                              className={styles.confirmDeleteRankingButton}
                              onClick={() => removeRanking(rankingId)}
                              onBlur={() => setConfirmRemove(null)}
                              autoFocus
                            >
                              Wirklich löschen?
                            </button>
                          ) : (
                            <button
                              className={styles.deleteRankingButton}
                              onClick={() => setConfirmRemove(removeRankingKey)}
                              aria-label={`Ranking „${ranking.title}“ löschen`}
                            >
                              Löschen
                            </button>
                          )}
                        </div>
                        <textarea
                          className={styles.descriptionInput}
                          value={ranking.description || ""}
                          maxLength={MAX_DESCRIPTION_LENGTH}
                          onChange={(e) => updateRankingDescription(rankingId, e.target.value)}
                          placeholder="Beschreibung (wird unter dem Titel angezeigt)"
                          rows={2}
                        />
                        <div className={styles.entryList}>
                          {ranking.entries.map((entry, index) => {
                            const removeKey = `entry-${rankingId}-${index}`;
                            return (
                              <div className={styles.entryRow} key={index}>
                                <span className={styles.entryIndex}>{index + 1}</span>
                                <input
                                  className={styles.nameInput}
                                  value={entry.name}
                                  onChange={(e) =>
                                    updateEntry(rankingId, index, "name", e.target.value)
                                  }
                                  placeholder="Name"
                                />
                                <input
                                  className={styles.eloInput}
                                  type="number"
                                  value={entry.elo}
                                  onChange={(e) =>
                                    updateEntry(rankingId, index, "elo", e.target.value)
                                  }
                                  placeholder="Elo"
                                />
                                {confirmRemove === removeKey ? (
                                  <button
                                    className={styles.confirmRemoveButton}
                                    onClick={() => removeEntry(rankingId, index)}
                                    onBlur={() => setConfirmRemove(null)}
                                    autoFocus
                                  >
                                    Sicher?
                                  </button>
                                ) : (
                                  <button
                                    className={styles.removeButton}
                                    onClick={() => setConfirmRemove(removeKey)}
                                    aria-label="Eintrag entfernen"
                                  >
                                    ×
                                  </button>
                                )}
                              </div>
                            );
                          })}
                        </div>
                        <button
                          className={styles.addButton}
                          onClick={() => addEntry(rankingId)}
                          disabled={ranking.entries.length >= MAX_ENTRIES}
                        >
                          {ranking.entries.length >= MAX_ENTRIES
                            ? `Maximal ${MAX_ENTRIES} Einträge erreicht`
                            : "+ Eintrag hinzufügen"}
                        </button>
                      </div>
                      );
                    })}
                    <button
                      className={styles.addRankingButton}
                      onClick={addRanking}
                      disabled={Object.keys(data.rankings).length >= MAX_RANKINGS}
                    >
                      + Neues Ranking erstellen
                    </button>
                  </div>
                )}

                {tab === "ankuendigungen" && (
                  <div className={styles.tabContent}>
                    {(data.announcements || []).length === 0 && (
                      <p className={styles.emptyHint}>Noch keine Ankündigungen.</p>
                    )}
                    {(data.announcements || []).map((a) => {
                      const removeKey = `ann-${a.id}`;
                      return (
                        <div key={a.id} className={styles.announcementBlock}>
                          <textarea
                            className={styles.announcementInput}
                            value={a.text}
                            onChange={(e) => updateAnnouncement(a.id, "text", e.target.value)}
                            placeholder="Text der Ankündigung"
                            rows={2}
                          />
                          <div className={styles.announcementFooter}>
                            <label className={styles.timeLabel}>
                              Erscheint am
                              <input
                                type="datetime-local"
                                className={styles.timeInput}
                                value={toLocalInputValue(a.time)}
                                onChange={(e) => updateAnnouncement(a.id, "time", e.target.value)}
                              />
                            </label>
                            {confirmRemove === removeKey ? (
                              <button
                                className={styles.confirmRemoveButton}
                                onClick={() => removeAnnouncement(a.id)}
                                onBlur={() => setConfirmRemove(null)}
                                autoFocus
                              >
                                Sicher?
                              </button>
                            ) : (
                              <button
                                className={styles.removeButton}
                                onClick={() => setConfirmRemove(removeKey)}
                                aria-label="Ankündigung entfernen"
                              >
                                ×
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                    <button className={styles.addButton} onClick={addAnnouncement}>
                      + Ankündigung hinzufügen
                    </button>
                  </div>
                )}

                <div className={styles.saveBar}>
                  {status === "ok" && (
                    <span className={styles.savedText}>
                      <CheckIcon /> Gespeichert
                    </span>
                  )}
                  {status && status !== "ok" && (
                    <span className={styles.errorText}>{status}</span>
                  )}
                  <button className={styles.primaryButton} onClick={handleSave} disabled={saving}>
                    {saving ? "Speichere..." : "Änderungen speichern"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

function GearIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="4" y="10.5" width="16" height="10" rx="2.2" />
      <path d="M7.5 10.5V7a4.5 4.5 0 0 1 9 0v3.5" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.4">
      <path d="M4 12.5l5 5L20 6" />
    </svg>
  );
}
