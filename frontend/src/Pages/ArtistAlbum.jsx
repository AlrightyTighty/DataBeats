import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router";
import Topnav from "../Components/Topnav";
import styles from "./NewReleases.module.css";

const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:5062";

function formatReleaseDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (!isNaN(d.getTime())) {
    return d.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }
  return String(iso).split("T")[0] || String(iso);
}

export default function ArtistAlbum() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const [artistName, setArtistName] = useState("Artist");

  const musicianId = useMemo(() => {
    const n = id ? Number(id) : null;
    return Number.isNaN(n) ? null : n;
  }, [id]);

  useEffect(() => {
    if (!musicianId) return;

    const controller = new AbortController();
    let alive = true;

    (async () => {
      setErr(null);
      setLoading(true);
      try {
        const res = await fetch(`${API}/api/album/by-musician/${musicianId}`, {
          credentials: "include",
          signal: controller.signal,
        });

        if (!res.ok) {
          if (res.status === 404) {
            if (alive) {
              setAlbums([]);
              setErr("No albums found for this artist.");
            }
          } else {
            const body = await res.text().catch(() => "");
            throw new Error(
              body ||
                `GET /api/album/by-musician/${musicianId} failed (${res.status})`
            );
          }
          return;
        }

        const data = await res.json();
        const list = Array.isArray(data) ? data : [];

        // newest to oldest
        list.sort((a, b) => {
          const ta = a && a.releaseDate ? new Date(a.releaseDate).getTime() : 0;
          const tb = b && b.releaseDate ? new Date(b.releaseDate).getTime() : 0;
          return tb - ta;
        });

        if (alive) {
          setAlbums(list);
        }
      } catch (e) {
        if (e.name === "AbortError") {
          console.info("Album fetch aborted for musician", musicianId);
          return;
        }
        console.error("Error loading albums:", e);
        if (alive) {
          setErr(e.message || String(e));
          setAlbums([]);
        }
      } finally {
        setTimeout(() => {
          if (alive) setLoading(false);
        }, 120);
      }
    })();

    return () => {
      alive = false;
      controller.abort();
    };
  }, [musicianId]);

  useEffect(() => {
    if (!musicianId) return;

    const controller = new AbortController();
    let alive = true;

    (async () => {
      try {
        const res = await fetch(`${API}/api/musician/${musicianId}`, {
          credentials: "include",
          signal: controller.signal,
        });
        if (!res.ok) {
          const text = await res.text().catch(() => "");
          console.warn("Failed to load musician name:", res.status, text);
          return;
        }
        const data = await res.json();
        if (alive) {
          setArtistName(data.musicianName || "Artist");
        }
      } catch (e) {
        if (e.name === "AbortError") {
          console.info("Musician fetch aborted:", musicianId);
          return;
        }
        console.warn("Failed to load musician name", e);
      }
    })();

    return () => {
      alive = false;
      controller.abort();
    };
  }, [musicianId]);

  const artistDisplay = artistName || "Artist";

  return (
    <>
      <Topnav />
      <div className={styles.page}>
        <div className={styles.container}>
          {/* Title row*/}
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
                  ? formatReleaseDate(a.releaseDate)
                  : "—";
                const artistLine =
                  Array.isArray(a.artists) && a.artists.length > 0
                    ? a.artists.map((x) => x.artistName).join(", ")
                    : artistDisplay;

                const title = a.albumTitle || "Untitled";

                return (
                  <button
                    key={a.albumId}
                    type="button"
                    className={styles.card}
                    title={title}
                    onClick={() => navigate(`/album/${a.albumId}`)}
                    aria-label={`Open album ${title}`}
                  >
                    {coverSrc ? (
                      <img
                        src={coverSrc}
                        alt={title}
                        className={styles.cover}
                        loading="lazy"
                      />
                    ) : (
                      <div className={styles.cover} aria-hidden />
                    )}

                    <div className={styles.text}>
                      <h3>{title}</h3>
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
