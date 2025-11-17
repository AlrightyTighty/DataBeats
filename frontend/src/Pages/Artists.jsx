import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import Topnav from "../Components/Topnav";
import API from "../lib/api";
import styles from "./Artists.module.css";

export default function Artists() {
  const navigate = useNavigate();
  const [artists, setArtists] = useState([]);
  const [avatarMap, setAvatarMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        setErr(null);
        setLoading(true);

        const res = await fetch(`${API}/api/musician/all`);
        if (!res.ok) {
          throw new Error(`GET /api/musician/all failed (${res.status})`);
        }

        const data = await res.json();
        const list = Array.isArray(data) ? data : [];

        list.sort((a, b) => {
          const na = (a.musicianName ?? a.MusicianName ?? "").toLowerCase();
          const nb = (b.musicianName ?? b.MusicianName ?? "").toLowerCase();
          return na.localeCompare(nb);
        });

        setArtists(list);

        const entries = await Promise.all(
          list.map(async (m) => {
            const picId =
              m.profilePictureFileId ?? m.ProfilePictureFileId ?? null;
            const id = m.musicianId ?? m.MusicianId;
            if (!id || !picId) return null;

            try {
              const imgRes = await fetch(
                `${API}/api/images/profile-picture/${picId}`
              );
              if (!imgRes.ok) return null;

              const imgData = await imgRes.json();
              const fileData = imgData.fileData ?? imgData.FileData;
              const fileExt =
                imgData.fileExtension ?? imgData.FileExtension ?? "png";
              if (!fileData) return null;

              return {
                id,
                src: `data:image/${fileExt};base64,${fileData}`,
              };
            } catch {
              return null;
            }
          })
        );

        const map = {};
        for (const entry of entries) {
          if (!entry) continue;
          map[entry.id] = entry.src;
        }
        setAvatarMap(map);
      } catch (e) {
        setErr(e.message || String(e));
        setArtists([]);
        setAvatarMap({});
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
          <h1 className={styles.title}>Browse Artists</h1>

          {err && <div className={styles.error}>{err}</div>}

          {loading ? (
            <p className={styles.status}>Loading artists...</p>
          ) : artists.length === 0 ? (
            <p className={styles.status}>No artists found.</p>
          ) : (
            <div className={styles.grid}>
              {artists.map((m) => {
                const id = m.musicianId ?? m.MusicianId;
                const name = m.musicianName ?? m.MusicianName ?? "Unknown";
                const handle = `@${name}`;

                const followersRaw = m.followerCount ?? m.FollowerCount ?? 0;
                const monthlyRaw =
                  m.monthlyListenerCount ?? m.MonthlyListenerCount ?? 0;

                const followers = Number(followersRaw) || 0;
                const monthly = Number(monthlyRaw) || 0;

                const avatarSrc = avatarMap[id] ?? null;

                return (
                  <button
                    key={id}
                    type="button"
                    className={styles.card}
                    onClick={() => navigate(`/artist/${id}`)}
                    title={name}
                  >
                    {avatarSrc ? (
                      <img
                        src={avatarSrc}
                        alt={name}
                        className={styles.avatar}
                        loading="lazy"
                      />
                    ) : (
                      <div className={styles.avatarPlaceholder} />
                    )}

                    <div className={styles.text}>
                      <h3 className={styles.name}>{handle}</h3>
                      <p className={styles.statsLine}>
                        {followers.toLocaleString()} followers •{" "}
                        {monthly.toLocaleString()} monthly listeners
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
