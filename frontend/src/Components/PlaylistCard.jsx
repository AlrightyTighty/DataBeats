import React from "react";
import styles from "./PlaylistCard.module.css";

export function PlaylistCard({ playlist }) {
  return (
    <div className={styles.card}>
      <div className={styles.coverWrapper}>
        <img src={`data:image/png;base64,${playlist.playlistImage}`} alt={playlist.playlistTitle} className={styles.cover} />
      </div>
      <div className={styles.info}>
        <h3 className={styles.title}>{playlist.playlistTitle}</h3>
      </div>
    </div>
  );
}
