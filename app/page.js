"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import styles from "./page.module.css";

function formatTime(iso) {
  try {
    const d = new Date(iso);
    return d.toLocaleString("de-DE", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit"
    });
  } catch (e) {
    return "";
  }
}

export default function Home() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch("/api/data")
      .then((r) => r.json())
      .then(setData)
      .catch(() => setData(null));
  }, []);

  const now = Date.now();
  const activeAnnouncements =
    data?.announcements
      ?.filter((a) => new Date(a.time).getTime() <= now)
      .sort((a, b) => new Date(b.time) - new Date(a.time)) || [];

  const rankingList = data
    ? Object.entries(data.rankings)
    : [
        ["ranking1", { title: "Bauern Ranking", entries: [] }],
        ["ranking2", { title: "Rüpel Ranking", entries: [] }]
      ];

  const accent = { ranking1: "gold", ranking2: "teal" };

  return (
    <main className={styles.main}>
      <div className={styles.hero}>
        <span className={styles.kicker}>Wähle eine Rangliste</span>
        <h1 className={styles.title}>Wer steht ganz oben?</h1>
        <p className={styles.subtitle}>
          Zwei Ranglisten, ein Zahnrad zum Bearbeiten. Aktuelle Platzierungen auf einen Blick.
        </p>
      </div>

      {activeAnnouncements.length > 0 && (
        <div className={styles.announcements}>
          {activeAnnouncements.map((a) => (
            <div key={a.id} className={styles.announcement}>
              <p className={styles.announcementText}>{a.text}</p>
              <span className={styles.announcementTime}>{formatTime(a.time)}</span>
            </div>
          ))}
        </div>
      )}

      <div className={styles.cards}>
        {rankingList.map(([id, ranking]) => (
          <Link href={`/ranking/${id}`} key={id} className={`${styles.card} ${styles[accent[id] || "gold"]}`}>
            <span className={styles.cardLabel}>{ranking.title}</span>
            <span className={styles.cardCount}>
              {ranking.entries.length} {ranking.entries.length === 1 ? "Eintrag" : "Einträge"}
            </span>
            <span className={styles.cardGo}>Rangliste ansehen →</span>
          </Link>
        ))}

        <Link href="/hypergamie" className={`${styles.card} ${styles.rose}`}>
          <span className={styles.cardLabel}>Hypergamie</span>
          <span className={styles.cardCount}>Eine Grafik</span>
          <span className={styles.cardGo}>Ansehen →</span>
        </Link>
      </div>
    </main>
  );
}
