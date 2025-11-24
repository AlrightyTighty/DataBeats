import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import Topnav from "../Components/Topnav";
import styles from "./NewReleases.module.css";

const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:5062";

export default function NewReleases() {
  const navigate = useNavigate();
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        setErr(null);
        setLoading(true);

        const res = await fetch(`${API}/api/album`);
        if (!res.ok) {
          throw new Error(`GET /api/album failed (${res.status})`);
        }

        const data = await res.json();
        const list = Array.isArray(data) ? data : [];

        const now = new Date();
        const cutoff = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000); // last 30 days

        const recent = list
          .filter((a) => {
            const raw = a.releaseDate ?? null;
            if (!raw) return false;
            const d = new Date(raw);
            return d >= cutoff && d <= now;
          })
          .sort((a, b) => {
            const ra = a.releaseDate ?? null;
            const rb = b.releaseDate ?? null;
            return new Date(rb) - new Date(ra); // latest to oldest
          });

        setAlbums(recent);
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
            <p>No new releases found in the last 30 days.</p>
          ) : (
            <div className={styles.grid}>
              {albums.map((a) => {
                const albumId = a.albumId;
                const albumTitle = a.albumTitle;

                const coverId = a.albumOrSongArtFileId ?? null;
                const coverSrc = coverId
                  ? `${API}/api/art/view/${coverId}`
                  : null;

                const rawDate = a.releaseDate ?? null;

                const dateStr = rawDate
                  ? new Date(rawDate).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })
                  : "—";

                const rawArtists = a.artists ?? [];
                const artistLine =
                  Array.isArray(rawArtists) && rawArtists.length > 0
                    ? rawArtists.map((x) => x.artistName).join(", ")
                    : "Unknown Artist";

                return (
                  <button
                    key={albumId}
                    type="button"
                    className={styles.card}
                    title={albumTitle}
                    onClick={() => navigate(`/album/${albumId}`)}
                  >
                    {coverSrc ? (
                      <img
                        src={coverSrc}
                        alt={albumTitle}
                        className={styles.cover}
                        loading="lazy"
                      />
                    ) : (
                      <div className={styles.cover} />
                    )}

                    <div className={styles.text}>
                      <h3>{albumTitle}</h3>
                      <p>
                        {artistLine} • {dateStr}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
