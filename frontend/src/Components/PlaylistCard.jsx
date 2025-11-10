import React from "react";
import styles from "./PlaylistCard.module.css";
import ReportButton from "./ReportButton";
import { useNavigate } from "react-router";
import ContextMenuButton from "./ContextMenuButton";

export function PlaylistCard({ playlist }) {
  const navigate = useNavigate();

  return (
    <div onClick={() => navigate(`/playlist/${playlist.playlistId}`)} className={styles.card}>
      <ContextMenuButton right="10px" top="10px" width="15px" height="15px" setContextMenu={playlist.setContextMenu} functions={playlist.functions} items={playlist.items} />
      <div className={styles.coverWrapper}>
        <img src={`data:image/png;base64,${playlist.playlistImage}`} alt={playlist.playlistTitle} className={styles.cover} />
      </div>
      <div className={styles.info}>
        <h3 className={styles.title}>{playlist.playlistTitle}</h3>
      </div>
    </div>
  );
}
