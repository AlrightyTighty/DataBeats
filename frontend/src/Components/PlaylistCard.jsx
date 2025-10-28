import React from "react";
import styles from "./PlaylistCard.module.css";

export function PlaylistCard({ playlist }) {
  return (
    <div className={styles.card}>
      <div className={styles.coverWrapper}>
        <img src={playlist.cover} alt={playlist.title} className={styles.cover} />
      </div>
      <div className={styles.info}>
        <h3 className={styles.title}>{playlist.title}</h3>
        <p className={styles.owner}>By {playlist.owner}</p>
        <div className={styles.metadata}>
          <span className={styles.songCount}>{playlist.songCount} songs</span>
          <span className={styles.separator}>•</span>
          <span className={styles.genres}>{playlist.genres.join(", ")}</span>
        </div>
      </div>
    </div>
  );
}
