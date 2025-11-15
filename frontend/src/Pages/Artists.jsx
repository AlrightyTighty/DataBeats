import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import Topnav from "../Components/Topnav";
import styles from "./Artists.module.css";

const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:5062";

export default function Artists() {
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setErr(null);
        const res = await fetch(`${API}/api/musician/all?includeImageData=true`, { credentials: "include" });
        if (!res.ok) throw new Error(`GET /api/musician/all failed (${res.status})`);
        const data = await res.json();
        setArtists(Array.isArray(data) ? data : []);
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
      <div className={styles.page}>
        <h1 className={styles.title}>Artists</h1>
        {loading && <div className={styles.status}>Loading artists…</div>}
        {err && <div className={styles.error}>{err}</div>}
        {!loading && !err && artists.length === 0 && (
          <div className={styles.empty}>No artists yet.</div>
        )}
        <div className={styles.grid}>
          {artists.map(a => {
            const imgSrc = a.profilePictureImage
              ? `data:image/${a.fileExtension || "jpeg"};base64,${a.profilePictureImage}`
              : undefined;
            return (
              <div
                key={a.musicianId}
                className={styles.card}
                onClick={() => navigate(`/artist/${a.musicianId}`)}
                tabIndex={0}
                onKeyDown={(ev) => {
                  if (ev.key === "Enter" || ev.key === " ") navigate(`/artist/${a.musicianId}`);
                }}
              >
                <div className={styles.media}>{imgSrc && <img src={imgSrc} alt={a.musicianName} loading="lazy" />}</div>
                <div className={styles.content}>
                  <div className={styles.artistName}>{a.musicianName}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}