import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import Topnav from "../Components/Topnav";
import styles from "./NewReleases.module.css";

const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:5062";

export default function Albums() {
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

        const sorted = list.sort((a, b) => {
          const ra =
            a.releaseDate ??
            a.ReleaseDate ??
            a.timestampReleased ??
            a.TimestampReleased ??
            null;
          const rb =
            b.releaseDate ??
            b.ReleaseDate ??
            b.timestampReleased ??
            b.TimestampReleased ??
            null;
          return new Date(rb) - new Date(ra);
        });

        setAlbums(sorted);
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
          <h1>Albums</h1>

          {err && <div style={{ opacity: 0.85 }}>{err}</div>}

          {loading ? (
            <p>Loading...</p>
          ) : albums.length === 0 ? (
            <p>No Albums found.</p>
          ) : (
            <div className={styles.grid}>
              {albums.map((a) => {
                const albumId = a.albumId ?? a.AlbumId;
                const albumTitle = a.albumTitle ?? a.AlbumTitle;

                const coverId =
                  a.albumOrSongArtFileId ?? a.AlbumOrSongArtFileId ?? null;
                const coverSrc = coverId
                  ? `${API}/api/art/view/${coverId}`
                  : null;

                const rawDate =
                  a.releaseDate ??
                  a.ReleaseDate ??
                  a.timestampReleased ??
                  a.TimestampReleased ??
                  null;

                const dateStr = rawDate
                  ? new Date(rawDate).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })
                  : "—";

                const rawArtists = a.artists ?? a.Artists ?? [];
                const artistLine =
                  Array.isArray(rawArtists) && rawArtists.length > 0
                    ? rawArtists
                        .map((x) => x.artistName ?? x.ArtistName)
                        .join(", ")
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
