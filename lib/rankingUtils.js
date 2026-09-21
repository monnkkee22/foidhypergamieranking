// Reine Hilfsfunktionen ohne Node- oder Browser-Abhängigkeiten - werden
// sowohl vom Server (API/Store) als auch vom Client (Admin-Menü, Seiten)
// verwendet.

export const MAX_ENTRIES = 10;
export const MAX_RANKINGS = 50;
export const MAX_TITLE_LENGTH = 60;
export const MAX_DESCRIPTION_LENGTH = 500;

// IDs landen in der URL (/ranking/<id>), deshalb nur sichere Zeichen.
const ID_PATTERN = /^[A-Za-z0-9_-]{1,64}$/;

// Akzentfarbe eines Rankings. Neue Rankings speichern ihre Farbe selbst;
// ältere Daten ohne "accent" behalten ihr bisheriges Aussehen
// (ranking2 = türkis, alles andere = gold).
export function getAccent(id, ranking) {
  if (ranking?.accent === "teal" || ranking?.accent === "gold") {
    return ranking.accent;
  }
  return id === "ranking2" ? "teal" : "gold";
}

// Neue Rankings wechseln sich farblich ab (gold, türkis, gold, ...).
export function nextAccent(rankings) {
  const list = Object.entries(rankings || {});
  if (list.length === 0) return "gold";
  const [lastId, last] = list[list.length - 1];
  return getAccent(lastId, last) === "gold" ? "teal" : "gold";
}

export function newRankingId() {
  return `r_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}

function newAnnouncementId() {
  return `a_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function str(value, max) {
  return typeof value === "string" ? value.slice(0, max) : "";
}

// Prüft und normalisiert einen kompletten Datensatz. Gibt null zurück, wenn
// die Grundstruktur nicht stimmt (dann wird nichts gespeichert). Ergänzt bei
// älteren Daten fehlende Felder (description, accent).
export function sanitizeData(input) {
  if (!input || typeof input !== "object" || Array.isArray(input)) return null;
  const rawRankings = input.rankings;
  if (!rawRankings || typeof rawRankings !== "object" || Array.isArray(rawRankings)) {
    return null;
  }

  const rankings = {};
  for (const [id, raw] of Object.entries(rawRankings).slice(0, MAX_RANKINGS)) {
    if (!ID_PATTERN.test(id) || !raw || typeof raw !== "object") continue;

    const entries = (Array.isArray(raw.entries) ? raw.entries : [])
      .slice(0, MAX_ENTRIES)
      .map((entry) => {
        const elo = Number(entry?.elo);
        return {
          name: str(entry?.name, 100),
          elo: Number.isFinite(elo) ? elo : 0
        };
      });

    rankings[id] = {
      title: str(raw.title, MAX_TITLE_LENGTH).trim() || "Neues Ranking",
      description: str(raw.description, MAX_DESCRIPTION_LENGTH).trim(),
      accent: getAccent(id, raw),
      entries
    };
  }

  const announcements = (Array.isArray(input.announcements) ? input.announcements : [])
    .slice(0, 100)
    .flatMap((a) => {
      if (!a || typeof a !== "object") return [];
      const time = new Date(a.time);
      return [
        {
          id: typeof a.id === "string" && a.id ? a.id : newAnnouncementId(),
          text: str(a.text, 2000),
          time: Number.isNaN(time.getTime()) ? new Date().toISOString() : time.toISOString()
        }
      ];
    });

  return { rankings, announcements };
}
