"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import styles from "./ranking.module.css";

export default function RankingView({ id }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch("/api/data")
      .then((r) => r.json())
      .then(setData)
      .catch(() => setData(null));
  }, []);

  const ranking = data?.rankings?.[id];
  const entries = (ranking?.entries || [])
    .slice()
    .sort((a, b) => b.elo - a.elo)
    .slice(0, 10);

  const accent = id === "ranking2" ? "teal" : "gold";
  const medals = ["🥇", "🥈", "🥉"];

  return (
    <main className={styles.main}>
      <Link href="/" className={styles.back}>
        ← Zurück zur Übersicht
      </Link>

      <h1 className={`${styles.title} ${styles[accent]}`}>
        {ranking ? ranking.title : "Rangliste"}
      </h1>

      {data && !ranking && <p className={styles.empty}>Diese Rangliste gibt es nicht.</p>}

      {ranking && (
        <div className={styles.table}>
          <div className={styles.headerRow}>
            <span className={styles.headerRank}>Platz</span>
            <span className={styles.headerName}>Name</span>
            <span className={styles.headerElo}>Elo</span>
          </div>

          {entries.length === 0 && <p className={styles.empty}>Noch keine Einträge.</p>}

          {entries.map((entry, index) => (
            <div className={`${styles.row} ${index < 3 ? styles.top : ""}`} key={index}>
              <span className={`${styles.rank} ${styles[accent]}`}>
                {medals[index] || index + 1}
              </span>
              <span className={styles.name}>{entry.name}</span>
              <span className={styles.elo}>{entry.elo}</span>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
