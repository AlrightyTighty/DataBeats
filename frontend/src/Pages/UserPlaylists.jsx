import { useEffect, useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router";
import Topnav from "../Components/Topnav";
import styles from "./UserPlaylists.module.css";

const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:5062";

export default function UserPlaylists() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [playlists, setPlaylists] = useState([]);
  const [username, setUsername] = useState("User");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  useEffect(() => {
    if (!id) return;

    (async () => {
      try {
        setLoading(true);
        setErr(null);

        try {
          const userRes = await fetch(`${API}/api/user/${id}`, {
            credentials: "include",
          });
          if (userRes.ok) {
            const u = await userRes.json();
            setUsername(u.username ?? "User");
          }
        } catch (e) {
          console.warn("Failed to load user info:", e);
        }

        const res = await fetch(`${API}/api/playlist/user/${id}`, {
          credentials: "include",
        });

        if (!res.ok) {
          console.error("Playlist response status:", res.status);
          const text = await res.text().catch(() => "");
          console.error("Playlist response body:", text);

          if (res.status === 404) {
            setPlaylists([]);
            setErr("No playlists found for this user.");
          } else {
            setErr("Couldn't load this user's playlists.");
          }
          return;
        }
        const data = await res.json();
        console.log("User playlists raw data:", data);

        const list = Array.isArray(data) ? data : [];
        setPlaylists(list);
      } catch (e) {
        console.error("Error fetching user playlists:", e);
        setErr(e.message || String(e));
        setPlaylists([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const displayName = useMemo(() => username || "User", [username]);

  return (
    <>
      <Topnav />
      <div className={styles.page}>
        <div className={styles.container}>
          {/* username — Playlists */}
          <h1 className={styles.title}>
            <button
              type="button"
              className={styles.userLink}
              onClick={() => navigate(`/me/${id}`)}
              title={`View ${displayName} profile`}
              aria-label={`View ${displayName} profile`}
            >
              {displayName}
            </button>
            <span className={styles.sep}> — </span>
            <span>Playlists</span>
          </h1>

          {err && <div className={styles.centerText}>{err}</div>}

          {loading ? (
            <p className={styles.centerText}>Loading...</p>
          ) : playlists.length === 0 ? (
            <p className={styles.centerText}>No playlists found.</p>
          ) : (
            <div className={styles.grid}>
              {playlists.map((pl) => {
                const playlistId = pl.playlistId;
                const playlistTitle = pl.playlistTitle ?? "Playlist";
                const imgData = pl.playlistImage;

                const coverSrc =
                  imgData && imgData.length
                    ? `data:image/png;base64,${imgData}`
                    : null;

                return (
                  <button
                    key={playlistId}
                    type="button"
                    className={styles.card}
                    onClick={() => navigate(`/playlist/${playlistId}`)}
                    title={playlistTitle}
                  >
                    {coverSrc ? (
                      <img
                        src={coverSrc}
                        alt={playlistTitle}
                        className={styles.cover}
                        loading="lazy"
                      />
                    ) : (
                      <div className={styles.cover} />
                    )}
                    <div className={styles.body}>
                      <h3 className={styles.playlistTitle}>{playlistTitle}</h3>
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
