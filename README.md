# Ranking

Eine kleine Website mit beliebig vielen Ranglisten (je bis zu 10 Plätze,
Name + Elo), einer Übersichtsseite mit geplanten Ankündigungen, einer
Hypergamie-Seite mit einer Grafik, und einem Zahnrad-Symbol unten auf jeder
Seite, über das man sich mit einem Admin-Code anmelden und Ranglisten
erstellen, umbenennen, beschreiben und löschen sowie alle Namen, Elo-Werte
und Ankündigungen bearbeiten kann. Änderungen sind sofort für alle Besucher
sichtbar.

## Lokal testen

```bash
npm install
npm run dev
```

Dann [http://localhost:3000](http://localhost:3000) öffnen. Ohne weitere
Einrichtung werden die Daten lokal in der Datei `data.local.json` gespeichert
(wird nicht mit hochgeladen).

## Auf Vercel veröffentlichen

1. Dieses Projekt in ein GitHub-Repository laden (oder mit der Vercel CLI:
   `npx vercel` im Projektordner ausführen).
2. Auf [vercel.com](https://vercel.com) ein neues Projekt aus dem
   Repository erstellen.
3. **Speicher einrichten (wichtig, sonst gehen Änderungen beim nächsten
   Deploy verloren) — kostenlos, ohne Redis:**
   - Im Vercel-Projekt auf den Reiter **Storage** gehen.
   - **Create Database** → **Blob** auswählen und einen Store erstellen
     (im kostenlosen Hobby-Plan enthalten).
   - Mit dem Projekt verknüpfen ("Connect Project"). Vercel legt dabei
     automatisch die Umgebungsvariable `BLOB_READ_WRITE_TOKEN` an.
4. Unter **Settings → Environment Variables** zusätzlich setzen (optional):
   - `ADMIN_CODE` = ein eigener Admin-Code (wenn nicht gesetzt, gilt
     automatisch `dihranking`).
5. Neu deployen (**Deployments → Redeploy**), damit die Umgebungsvariablen
   greifen.

Sobald der Blob-Store verknüpft ist, werden Admin-Änderungen dauerhaft in
einer JSON-Datei im Blob-Store gespeichert (nicht im Dateisystem der
Funktion) und sind danach für alle Besucher sichtbar — auch nach einem
Redeploy oder Cold Start. Ohne verknüpften Blob-Store läuft die Seite auf
Vercel zwar, aber Änderungen über das Zahnrad-Menü werden nicht dauerhaft
gespeichert, da Vercel-Funktionen keine Dateien dauerhaft schreiben können.

## Bedienung

- **Übersicht (`/`):** Auswahl zwischen den zwei Ranglisten und der
  Hypergamie-Seite, darüber erscheinen aktive Ankündigungen (also solche,
  deren eingestellte Uhrzeit bereits erreicht ist).
- **Navigationsleiste (oben):** feste Leiste mit Tabs zu Übersicht, beiden
  Ranglisten und Hypergamie — auf jeder Seite sichtbar.
- **Ranglisten-Seite:** zeigt Titel, Beschreibung und bis zu 10 Plätze,
  automatisch nach Elo sortiert, die ersten drei mit Medaillen hervorgehoben.
- **Hypergamie-Seite (`/hypergamie`):** zeigt die Grafik `hypergamie.jpeg`.
- **Zahnrad (unten rechts, auf jeder Seite):** Admin-Code eingeben, dann
  können im Tab **Ranglisten**
  - über **„+ Neues Ranking erstellen"** neue Ranglisten angelegt werden,
  - Titel und **Beschreibung** jeder Rangliste geändert werden (die
    Beschreibung erscheint auf der Übersicht und auf der Ranglisten-Seite),
  - Ranglisten mit **„Löschen"** komplett entfernt werden,
  - Namen und Elo-Werte bearbeitet werden.

  Im Tab **Ankündigungen** lassen sich Ankündigungen (Text + Uhrzeit, zu der
  sie erscheinen sollen) bearbeiten, hinzufügen oder löschen. Löschen
  erfordert immer eine kurze Bestätigung. Erst mit „Änderungen speichern"
  werden die Änderungen im Blob-Store gespeichert und sind dauerhaft für alle
  Besucher sichtbar.

## Code ändern

Der Admin-Code ist über die Umgebungsvariable `ADMIN_CODE` einstellbar
(siehe `.env.example`). Ohne gesetzte Variable gilt `dihranking` als
Standard.
