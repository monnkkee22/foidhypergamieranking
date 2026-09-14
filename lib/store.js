import { put, get } from "@vercel/blob";
import fs from "fs";
import path from "path";
import { DEFAULT_DATA } from "./defaultData";

// Feste Pfad/Dateiname im Vercel Blob Store. Wird bei jedem Speichern
// überschrieben (kein neuer Eintrag), sodass es immer nur einen aktuellen
// Datensatz gibt, der für alle Besucher sichtbar ist und dauerhaft bestehen
// bleibt (Vercel Blob ist persistenter Objektspeicher, kein Cache).
const BLOB_PATHNAME = "dihranking/data.json";
const LOCAL_FILE = path.join(process.cwd(), "data.local.json");

function hasBlobConfig() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

function readLocalFile() {
  try {
    const raw = fs.readFileSync(LOCAL_FILE, "utf-8");
    return JSON.parse(raw);
  } catch (err) {
    return null;
  }
}

function writeLocalFile(data) {
  try {
    fs.writeFileSync(LOCAL_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    // Lokal (z.B. in read-only Umgebungen) einfach ignorieren.
  }
}

export async function getData() {
  if (hasBlobConfig()) {
    try {
      const blob = await get(BLOB_PATHNAME, {
        access: "public",
        useCache: false
      });
      const res = await fetch(blob.url, { cache: "no-store" });
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      // Blob existiert noch nicht -> unten mit DEFAULT_DATA anlegen.
    }
    await saveData(DEFAULT_DATA);
    return DEFAULT_DATA;
  }

  // Fallback für lokale Entwicklung ohne Blob-Token.
  const local = readLocalFile();
  if (local) return local;
  writeLocalFile(DEFAULT_DATA);
  return DEFAULT_DATA;
}

export async function saveData(data) {
  if (hasBlobConfig()) {
    await put(BLOB_PATHNAME, JSON.stringify(data, null, 2), {
      access: "public",
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType: "application/json",
      cacheControlMaxAge: 0
    });
    return;
  }
  writeLocalFile(data);
}
