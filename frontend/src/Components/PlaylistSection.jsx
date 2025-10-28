import React from "react";
import { PlaylistCard } from "./PlaylistCard";
import styles from "./PlaylistSection.module.css";

export function PlaylistSection({ title, playlists }) {
  return (
    <section className={styles.section}>
      <h2 className={styles.title}>{title}</h2>
      <div className={styles.grid}>
        {playlists.map((playlist) => (
          <PlaylistCard key={playlist.playlistId} playlist={playlist} />
        ))}
      </div>
    </section>
  );
}
