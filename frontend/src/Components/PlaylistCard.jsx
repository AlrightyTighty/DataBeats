import React from "react";
import styles from "./PlaylistCard.module.css";
import ReportButton from "./ReportButton";
import { useNavigate } from "react-router";

export function PlaylistCard({ playlist }) {
  const navigate = useNavigate();

  return (
    <div onClick={() => navigate(`/playlist/${playlist.playlistId}`)} className={styles.card}>
      <ReportButton right="10px" top="10px" contentId={playlist.playlistId} reportType="PLAYLIST" width="15px" height="15px" />
      <div className={styles.coverWrapper}>
        <img src={`data:image/png;base64,${playlist.playlistImage}`} alt={playlist.playlistTitle} className={styles.cover} />
      </div>
      <div className={styles.info}>
        <h3 className={styles.title}>{playlist.playlistTitle}</h3>
      </div>
    </div>
  );
}
