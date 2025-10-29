import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import Topnav from "../Components/Topnav";
import styles from "./ListenerProfile.module.css";
import API from "../lib/api.js";

export default function ListenerMe() {
  const navigate = useNavigate();
  const [me, setMe] = useState(null);
  const [topSongs, setTopSongs] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch(`${API}/api/me`, { credentials: "include" });
        if (!r.ok) {
          navigate("/login");
          return;
        }
        const user = await r.json();
        setMe(user);

        //top songs 
        try {
          const ts = await fetch(`${API}/api/song/top/${user.userId}`, {
            credentials: "include",
          });
          if (ts.ok) {
            const data = await ts.json();
            const normalized = (Array.isArray(data) ? data : []).map((s) => ({
              songId: s.songId ?? s.SongId ?? s.id,
              songName: s.songName ?? s.SongName ?? s.title ?? "Unknown",
              duration: s.duration ?? s.Duration ?? "",
            }));
            setTopSongs(normalized.slice(0, 5));
          }
        } catch {
        }
      } catch {
        navigate("/login");
      }
    })();
  }, [navigate]);

  const goStream = (id) => navigate(`/stream/${id}`);

  return (
    <>
      <Topnav />
      <div className={styles.page}>
        <div className={styles.container}>
          <div className={styles.left}>
            <div className={styles.avatar} />
            <div>
              <h1>{me?.username || "My Profile"}</h1>
              <p>{me?.email || "-"}</p>

              <div className={styles.actions}>
                <Link to="/settings" className={styles.btn}>
                  Edit Settings
                </Link>
                <Link
                  to={me ? `/followers/${me.userId}` : "#"}
                  className={styles.btnSec}
                >
                  Followers
                </Link>
                <Link
                  to={me ? `/following/${me.userId}` : "#"}
                  className={styles.btnSec}
                >
                  Following
                </Link>
              </div>
            </div>
          </div>

          <div className={styles.right}>
            <div className={styles.card}>
              <h2>Top Songs</h2>
              {(topSongs.length ? topSongs : [1, 2, 3, 4, 5].map((i) => ({
                songId: i,
                songName: `Song ${i}`,
                duration: "",
              }))).map((s) => (
                <div key={s.songId} className={styles.songRow}>
                  <span>{s.songName}</span>
                  <button onClick={() => goStream(s.songId)}>▶</button>
                </div>
              ))}
            </div>

            <div className={styles.card}>
              <h2>Quick Links</h2>
              <div className={styles.pills}>
                <Link to="/new">New Releases</Link>
                <Link to="/playlists">Playlists</Link>
                <Link to="/events">Events</Link>
              </div>
            </div>

            <div className={styles.card}>
              <h2>Explore</h2>
              <div className={styles.pills}>
                {/* taskbar destinations */}
                <Link to="/new">New</Link>
                <Link to="/playlists">Playlist</Link>
                <Link to={me ? `/following/${me.userId}` : "#"}>Artist</Link>
                <Link to="/playlists">Album</Link>
                <Link to="/events">Event</Link>
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}
