"use client";

import Link from "next/link";
import styles from "./ranking.module.css";
import { useRankingData } from "../../../lib/useRankingData";
import { getAccent } from "../../../lib/rankingUtils";

export default function RankingView({ id }) {
  const { data, loadError } = useRankingData();

  const ranking =
    data && Object.prototype.hasOwnProperty.call(data.rankings, id)
      ? data.rankings[id]
      : undefined;
  const entries = (ranking?.entries || [])
    .slice()
    .sort((a, b) => b.elo - a.elo)
    .slice(0, 10);

  const accent = getAccent(id, ranking);
  const medals = ["🥇", "🥈", "🥉"];

  return (
    <main className={styles.main}>
      <Link href="/" className={styles.back}>
        ← Zurück zur Übersicht
      </Link>

      <div className={styles.header}>
        <h1 className={`${styles.title} ${styles[accent]}`}>
          {ranking ? ranking.title : "Rangliste"}
        </h1>
        {ranking?.description && <p className={styles.description}>{ranking.description}</p>}
      </div>

      {loadError && <p className={styles.empty}>Fehler beim Laden: {loadError}</p>}

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
