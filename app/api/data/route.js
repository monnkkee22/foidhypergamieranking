import { NextResponse } from "next/server";
import { getData, saveData } from "../../../lib/store";

export const dynamic = "force-dynamic";

function getAdminCode() {
  return process.env.ADMIN_CODE || "dihranking";
}

export async function GET() {
  const data = await getData();
  return NextResponse.json(data);
}

export async function POST(request) {
  const body = await request.json();
  const { code, data, verifyOnly } = body || {};

  if (code !== getAdminCode()) {
    return NextResponse.json({ error: "Falscher Code." }, { status: 401 });
  }

  if (verifyOnly) {
    return NextResponse.json({ ok: true });
  }

  if (!data || typeof data !== "object") {
    return NextResponse.json({ error: "Ungültige Daten." }, { status: 400 });
  }

  try {
    await saveData(data);
  } catch (err) {
    console.error("saveData failed:", err);
    return NextResponse.json(
      { error: "Speichern fehlgeschlagen: " + (err?.message || String(err)) },
      { status: 500 }
    );
  }
  return NextResponse.json({ ok: true });
}
