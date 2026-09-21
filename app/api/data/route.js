import { NextResponse } from "next/server";
import { getData, saveData } from "../../../lib/store";
import { sanitizeData } from "../../../lib/rankingUtils";

export const dynamic = "force-dynamic";

function getAdminCode() {
  return process.env.ADMIN_CODE || "dihranking";
}

export async function GET() {
  try {
    const data = await getData();
    return NextResponse.json(data, {
      headers: { "Cache-Control": "no-store" }
    });
  } catch (err) {
    console.error("getData failed:", err);
    return NextResponse.json(
      { error: "Laden fehlgeschlagen: " + (err?.message || String(err)) },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch (err) {
    return NextResponse.json({ error: "Ungültige Anfrage." }, { status: 400 });
  }
  const { code, data, verifyOnly } = body || {};

  if (code !== getAdminCode()) {
    return NextResponse.json({ error: "Falscher Code." }, { status: 401 });
  }

  if (verifyOnly) {
    return NextResponse.json({ ok: true });
  }

  // Struktur prüfen und normalisieren (Rankings inkl. Beschreibung, Einträge,
  // Ankündigungen). Ungültige Daten werden nicht gespeichert.
  const clean = sanitizeData(data);
  if (!clean) {
    return NextResponse.json({ error: "Ungültige Daten." }, { status: 400 });
  }

  try {
    await saveData(clean);
  } catch (err) {
    console.error("saveData failed:", err);
    return NextResponse.json(
      { error: "Speichern fehlgeschlagen: " + (err?.message || String(err)) },
      { status: 500 }
    );
  }
  return NextResponse.json({ ok: true, data: clean });
}
