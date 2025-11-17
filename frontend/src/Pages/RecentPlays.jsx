import { useEffect, useState } from "react";
import { useParams } from "react-router";
import Topnav from "../Components/Topnav";
import API from "../lib/api";
import styles from "./RecentPlays.module.css";

export default function RecentPlays({ setPlaybarState }) {
  const { id } = useParams();
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        setErr(null);
        setLoading(true);

        let effectiveUserId = null;

        if (id) {
          const parsed = Number(id);
          if (!Number.isNaN(parsed) && parsed > 0) {
            effectiveUserId = parsed;
          }
        }

        if (!effectiveUserId) {
          const meRes = await fetch(`${API}/api/me`, {
            credentials: "include",
          });
          if (!meRes.ok) {
            throw new Error("Could not determine current user.");
          }
          const me = await meRes.json();
          effectiveUserId = me.userId ?? me.UserId ?? null;
          if (!effectiveUserId) {
            throw new Error("No user id found on current user.");
          }
        }

        // last 7 days
        const now = new Date();
        const to = now.toISOString();
        const fromDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const from = fromDate.toISOString();

        const qs = new URLSearchParams({
          from,
          to,
          page: "1",
          pageSize: "50",
        }).toString();

        const res = await fetch(`${API}/api/history/recent?${qs}`, {
          headers: {
            "X-UserId": String(effectiveUserId),
          },
          credentials: "include",
        });

        if (!res.ok) {
          throw new Error(`GET /api/history/recent failed (${res.status})`);
        }

        const data = await res.json();
        const items = Array.isArray(data.items) ? data.items : [];
        setSongs(items);
      } catch (e) {
        setErr(e.message || String(e));
        setSongs([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  function handlePlay(song) {
    if (!setPlaybarState) return;
    const songId = song.songId ?? song.SongId;
    const albumId = song.albumId ?? song.AlbumId ?? null;
    if (!songId) return;

    setPlaybarState({
      songId,
      albumId,
      playlistId: null,
      visible: true,
    });
  }

  return (
    <>
      <Topnav />
      <div className={styles.page}>
        <div className={styles.container}>
          <div className={styles.headerRow}>
            <h1 className={styles.title}>Recent Plays</h1>
            <span className={styles.badge}>Last 7 days</span>
          </div>

          {err && <div className={styles.error}>{err}</div>}

          {loading ? (
            <p className={styles.status}>Loading recent plays...</p>
          ) : songs.length === 0 ? (
            <p className={styles.status}>
              You haven&apos;t played any songs in the last 7 days.
            </p>
          ) : (
            <>
              {/*title row*/}
              <div className={styles.columns}>
                <span className={styles.colIndex}>#</span>
                <span className={styles.colTitle}>Title</span>
                <span className={styles.colDuration}>Duration</span>
              </div>

              <div className={styles.list}>
                {songs.map((s, i) => {
                  const key = s.songId ?? s.SongId ?? i;
                  const title = s.songName ?? s.SongName ?? "Untitled";
                  const artist =
                    s.artistName ??
                    s.ArtistName ??
                    s.musicianName ??
                    s.MusicianName ??
                    "Unknown artist";
                  const album = s.albumTitle ?? s.AlbumTitle ?? "";
                  const duration = s.duration ?? s.Duration ?? "";
                  const metaLine = album ? `${artist} • ${album}` : artist;

                  return (
                    <button
                      key={key}
                      type="button"
                      className={styles.row}
                      onClick={() => handlePlay(s)}
                    >
                      <div className={styles.left}>
                        <span className={styles.index}>{i + 1}</span>
                        <div className={styles.textBlock}>
                          <div className={styles.songTitle}>{title}</div>
                          <div className={styles.songMeta}>{metaLine}</div>
                        </div>
                      </div>

                      <div className={styles.right}>
                        <span className={styles.duration}>{duration}</span>
                        <span className={styles.playIcon}>▶</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
