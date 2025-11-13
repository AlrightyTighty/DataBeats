import { useEffect, useState } from "react";
import styles from "./ProfileHeader.module.css";

const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:5062";

export default function ProfileFollowModal({ userId, open, onClose }) {
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);

  useEffect(() => {
    if (!open || !userId) return;

    (async () => {
      try {
        setLoading(true);
        setErr(null);

        const r = await fetch(`${API}/api/friend/friends/${userId}`, {
          credentials: "include",
        });
        if (!r.ok) throw new Error("Failed to load friends");

        const data = await r.json();
        const mapped = (Array.isArray(data) ? data : []).map((x) => ({
          id: x.friendId,
          username: x.username,
          since: x.timeAccepted ?? x.timeFriended,
        }));
        setFriends(mapped);
      } catch (e) {
        setErr(e.message || String(e));
      } finally {
        setLoading(false);
      }
    })();
  }, [open, userId]);

  if (!open) return null;

  return (
    <div className={styles.followModalBackdrop} onClick={onClose}>
      <div className={styles.followModal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.followModalHeader}>
          <span>Followers &amp; Following</span>
          <button type="button" className={styles.closeBtn} onClick={onClose}>
            ×
          </button>
        </div>

        <div className={styles.followModalBody}>
          {loading && <div>Loading…</div>}
          {err && <div>{err}</div>}

          {!loading && !err && (
            <div className={styles.followList}>
              {friends.length === 0 ? (
                <div className={styles.followEmpty}>No friends yet.</div>
              ) : (
                friends.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    className={styles.followRow}
                    onClick={() => (location.href = `/user/${f.id}`)}
                  >
                    <div className={styles.followAvatar} />
                    <div className={styles.followText}>
                      <div className={styles.followName}>{f.username}</div>
                      {f.since && (
                        <div className={styles.followSince}>
                          Since {new Date(f.since).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
