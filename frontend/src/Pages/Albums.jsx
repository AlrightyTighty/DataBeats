import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import Topnav from "../Components/Topnav";
import styles from "./Albums.module.css";

const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:5062";

export default function Albums() {
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setErr(null);
        const res = await fetch(`${API}/api/album?includeImageData=true`, { credentials: "include" });
        if (!res.ok) throw new Error(`GET /api/album failed (${res.status})`);
        const data = await res.json();
        setAlbums(Array.isArray(data) ? data : []);
      } catch (e) {
        setErr(e.message || String(e));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <>
      <Topnav />
      <div className={styles.page}>        <h1 className={styles.title}>Albums</h1>
        {loading && <div className={styles.status}>Loading albums…</div>}
        {err && <div className={styles.error}>{err}</div>}
        {!loading && !err && albums.length === 0 && (
          <div className={styles.empty}>No albums yet.</div>
        )}
        <div className={styles.grid}>
          {albums.map(a => {
            const imgSrc = a.albumArtImage
              ? `data:image/png;base64,${a.albumArtImage}`
              : undefined;
            const collaborators = (a.artists || []).map(ar => ar.artistName).join(", ");
            return (
              <div
                key={a.albumId}
                className={styles.card}
                onClick={() => navigate(`/album/${a.albumId}`)}
                tabIndex={0}
                onKeyDown={(ev) => {
                  if (ev.key === "Enter" || ev.key === " ") navigate(`/album/${a.albumId}`);
                }}
              >
                <div className={styles.media}>{imgSrc && <img src={imgSrc} alt={a.albumTitle} loading="lazy" />}</div>
                <div className={styles.content}>
                  <div className={styles.header}>                  <div className={styles.albumTitle}>{a.albumTitle}</div>
                    <div className={styles.collaborators}>{collaborators}</div>
                  </div>
                  <div className={styles.divider} />
                  <div className={styles.footer}>                  <span className={styles.meta}>{new Date(a.releaseDate).toLocaleDateString()}</span>
                    <span className={styles.badge}>{a.numSongs} song{a.numSongs === 1 ? "" : "s"}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
