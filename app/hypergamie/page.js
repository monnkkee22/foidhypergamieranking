import styles from "./hypergamie.module.css";

export const metadata = {
  title: "Hypergamie · Ranking"
};

export default function HypergamiePage() {
  return (
    <main className={styles.main}>
      <span className={styles.kicker}>Zum Nachdenken</span>
      <h1 className={styles.title}>Hypergamie</h1>
      <p className={styles.subtitle}>
        Wen Männer und Frauen jeweils gerne als Partner hätten – und wo die Erwartung liegt.
      </p>

      <div className={styles.frame}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/hypergamie.jpeg" alt="Grafik zur Hypergamie-These" className={styles.image} />
      </div>
    </main>
  );
}
