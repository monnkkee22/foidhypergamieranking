"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./Nav.module.css";
import { useRankingData } from "../../lib/useRankingData";
import { getAccent } from "../../lib/rankingUtils";

export default function Nav() {
  const { data } = useRankingData();
  const pathname = usePathname();

  const rankingTabs = data
    ? Object.entries(data.rankings).map(([id, ranking]) => ({
        href: `/ranking/${id}`,
        label: ranking.title,
        accent: getAccent(id, ranking)
      }))
    : [];

  const tabs = [
    { href: "/", label: "Übersicht", accent: "gold", exact: true },
    ...rankingTabs,
    { href: "/hypergamie", label: "Hypergamie", accent: "rose" }
  ];

  return (
    <header className={styles.nav}>
      <Link href="/" className={styles.brand}>
        RANKING
      </Link>
      <nav className={styles.tabs}>
        {tabs.map((tab) => {
          const active = tab.exact ? pathname === tab.href : pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`${styles.tab} ${styles[tab.accent]} ${active ? styles.active : ""}`}
            >
              {tab.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
