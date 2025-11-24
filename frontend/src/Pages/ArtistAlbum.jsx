import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router";
import Topnav from "../Components/Topnav";
import styles from "./NewReleases.module.css";

const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:5062";

export default function ArtistAlbum() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const [artistName, setArtistName] = useState("Artist");

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        setErr(null);
        setLoading(true);
        const res = await fetch(`${API}/api/album/by-musician/${id}`);
        if (!res.ok) {
          if (res.status === 404) {
            setAlbums([]);
            setErr("No albums found for this artist.");
          } else {
            throw new Error(
              `GET /api/album/by-musician/${id} failed (${res.status})`
            );
          }
        } else {
          const data = await res.json();
          const list = Array.isArray(data) ? data : [];
          // newest to oldest
          list.sort(
            (a, b) => new Date(b.releaseDate) - new Date(a.releaseDate)
          );
          setAlbums(list);
        }
      } catch (e) {
        setErr(e.message || String(e));
        setAlbums([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  useEffect(() => {
    if (!id) return;

    (async () => {
      try {
        const res = await fetch(`${API}/api/musician/${id}`);
        if (res.ok) {
          const data = await res.json();
          setArtistName(data.musicianName || "Artist");
        }
      } catch (e) {
        console.warn("Failed to load musician name", e);
      }
    })();
  }, [id]);

  const artistDisplay = artistName;

  return (
    <>
      <Topnav />
      <div className={styles.page}>
        <div className={styles.container}>
          {/* Title row with artist link */}
          <h1 style={{ textAlign: "center", margin: 0 }}>
            <button
              type="button"
              onClick={() => navigate(`/artist/${id}`)}
              title={`View ${artistDisplay} profile`}
              aria-label={`View ${artistDisplay} profile`}
              style={{
                appearance: "none",
                background: "none",
                border: "none",
                padding: 0,
                margin: 0,
                font: "inherit",
                color: "#79D4F7",
                cursor: "pointer",
                textDecoration: "underline",
                textUnderlineOffset: "4px",
              }}
            >
              {artistDisplay}
            </button>{" "}
            — Albums
          </h1>

          {err && (
            <div style={{ textAlign: "center", opacity: 0.9 }}>{err}</div>
          )}

          {loading ? (
            <p style={{ textAlign: "center", opacity: 0.9 }}>Loading...</p>
          ) : albums.length === 0 ? (
            <p style={{ textAlign: "center", opacity: 0.9 }}>
              No albums found.
            </p>
          ) : (
            <div className={styles.grid}>
              {albums.map((a) => {
                const coverSrc = a.albumOrSongArtFileId
                  ? `${API}/api/art/view/${a.albumOrSongArtFileId}`
                  : null;

                const dateStr = a.releaseDate
                  ? new Date(a.releaseDate).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })
                  : "—";

                const artistLine =
                  Array.isArray(a.artists) && a.artists.length > 0
                    ? a.artists.map((x) => x.artistName).join(", ")
                    : artistDisplay;

                return (
                  <button
                    key={a.albumId}
                    type="button"
                    className={styles.card}
                    title={a.albumTitle}
                    onClick={() => navigate(`/album/${a.albumId}`)}
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
