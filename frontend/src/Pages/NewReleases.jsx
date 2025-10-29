import { useEffect, useState } from "react";
import Topnav from "../Components/Topnav";
import styles from "./NewReleases.module.css";

const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:5062";

export default function NewReleases() {
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        setErr(null);
        setLoading(true);
        const res = await fetch(`${API}/api/album/new`);
        if (!res.ok) throw new Error(`GET /api/album/new failed (${res.status})`);
        const data = await res.json();
        setAlbums(Array.isArray(data) ? data : []);
      } catch (e) {
        setErr(e.message || String(e));
        setAlbums([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <>
      <Topnav />
      <div className={styles.page}>
        <div className={styles.container}>
          <h1>New Releases</h1>

          {err && <div style={{ opacity: 0.85 }}>{err}</div>}
          {loading ? (
            <p>Loading...</p>
          ) : albums.length === 0 ? (
            <p>No new releases found.</p>
          ) : (
            <div className={styles.grid}>
              {albums.map((a) => {
                const coverSrc = a.albumOrSongArtFileId
                  ? `${API}/api/file/view/${a.albumOrSongArtFileId}`
                  : null;
                const year = a.releaseDate
                  ? new Date(a.releaseDate).getFullYear()
                  : "—";
                const artistLine =
                  (a.artists && a.artists.join(", ")) || "Unknown Artist";

                return (
                  <a
                    key={a.albumId}
                    href={`/album/${a.albumId}`}
                    className={styles.card}
                    title={a.albumTitle}
                  >
                    {coverSrc ? (
                      <img
                        src={coverSrc}
                        alt={a.albumTitle}
                        className={styles.cover}
                        loading="lazy"
                      />
                    ) : (
                      <div className={styles.cover} />
                    )}

                    <div className={styles.text}>
                      <h3>{a.albumTitle}</h3>
                      <p>
                        {artistLine} • {year}
                      </p>
                    </div>
                  </a>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
