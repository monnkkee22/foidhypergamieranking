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

// Auf Vercel ist das Dateisystem flüchtig (jede Function-Instanz/jeder
// Request kann eine eigene, leere Kopie sehen) - dort NIE lautlos auf die
// lokale Datei zurückfallen, sonst wirkt "Speichern" erfolgreich, obwohl
// nichts dauerhaft ankommt.
function isVercel() {
  return Boolean(process.env.VERCEL);
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

async function readBlobData() {
  const result = await get(BLOB_PATHNAME, {
    access: "public",
    useCache: false
  });
  // get() returns null if the blob doesn't exist yet (it does not throw).
  if (!result || !result.stream) return null;
  return await new Response(result.stream).json();
}

export async function getData() {
  if (hasBlobConfig()) {
    try {
      const data = await readBlobData();
      if (data) return data;
    } catch (err) {
      console.error("readBlobData failed:", err);
    }
    await saveData(DEFAULT_DATA);
    return DEFAULT_DATA;
  }

  if (isVercel()) {
    // Kein Blob-Store verbunden: es gibt keinen dauerhaften Speicher.
    // DEFAULT_DATA zurückgeben, statt eine lokale Datei vorzutäuschen,
    // die bei jedem Request wieder verschwindet.
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

  if (isVercel()) {
    throw new Error(
      "Kein Blob-Speicher verbunden (BLOB_READ_WRITE_TOKEN fehlt). " +
        "Im Vercel-Projekt unter Storage einen Blob-Store erstellen, " +
        "mit dem Projekt verknüpfen und neu deployen."
    );
  }

  writeLocalFile(data);
}
