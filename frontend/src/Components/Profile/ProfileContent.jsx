import { useNavigate } from "react-router";
import styles from "./ProfileContent.module.css";

export default function ProfileContent({ user, topSongs = [], playlists = [] }) {
  const navigate = useNavigate();

  return (
    <div className={styles.frame}>
      {/*Bio + Top Songs Row*/}
      <div className={styles.bioAndSongs}>
        {/*Bio*/}
        <div className={styles.bioBox}>
          <h2 className={styles.bioTitle}>About Me!</h2>
          <p className={styles.bioText}>
            {user?.bio || "This user hasn't written a bio yet."}
          </p>
        </div>

        {/*Top Songs*/}
        <div className={styles.songBox}>
          <div className={styles.songHeader}>
            <h2 className={styles.songTitle}>Top 5 Songs</h2>
          </div>

          <div className={styles.songList}>
            {topSongs.length === 0 && (
              <div className={styles.empty}>No songs available.</div>
            )}
            {topSongs.map((song, index) => (
              <div
                key={song.songId}
                className={styles.songRow}
                onClick={() => navigate(`/stream/${song.songId}`)}
              >
                <span className={styles.songName}>{song.title}</span>
                <span className={styles.songArtist}>{song.artistName}</span>
                <span className={styles.songDuration}>{song.duration}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/*Playlist*/}
      <div className={styles.playlistBox}>
        <div className={styles.playlistHeader}>
          <h2 className={styles.playlistTitle}>Playlists</h2>
          <button
            className={styles.viewAll}
            disabled={!user?.userId}
            onClick={() => user?.userId && navigate(`/user/${user.userId}/playlists`)}
            >
            View All
          </button>
        </div>

        <div className={styles.playlistGrid}>
          {playlists.map((p) => (
            <div
              key={p.playlistId}
              className={styles.playlistCard}
              onClick={() => navigate(`/playlist/${p.playlistId}`)}
            >
              <div className={styles.albumPic} />
              <div className={styles.playlistName}>{p.name}</div>
              <div className={styles.playlistYear}>2025</div>
              <div className={styles.playlistType}>Playlist</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
