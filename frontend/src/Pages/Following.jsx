import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router";
import Topnav from "../Components/Topnav";
import styles from "./FollowPages.module.css";

const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:5062";

export default function Following() {
  const { id } = useParams();
  const userId = useMemo(() => Number(id), [id]);
  const navigate = useNavigate();

  const [owner, setOwner] = useState(null);
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  useEffect(() => {
    if (!userId) return;
    (async () => {
      try {
        setLoading(true);
        setErr(null);
        const [u, f] = await Promise.all([
          fetch(`${API}/api/user/${userId}`, { credentials: "include" }),
          fetch(`${API}/api/friend/friends/${userId}`, { credentials: "include" }),
        ]);
        if (u.ok) setOwner(await u.json());
        if (!f.ok) throw new Error("Failed to load following");
        const data = await f.json();
        const mapped = (Array.isArray(data) ? data : []).map(x => ({
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
  }, [userId]);

  return (
    <>
      <Topnav />
      <div className={styles.page}>
        <div className={styles.panel}>
          <div className={styles.headerRow}>
            <div className={styles.headerUsername}>{owner?.username ?? "Username"}</div>
            <div className={styles.headerTitle}>Following</div>
          </div>

          {err && <div className={styles.errorCard}>{err}</div>}

          <div className={styles.grid}>
            {!loading && friends.length === 0 && (
              <div className={styles.emptyCard}>Not following anyone yet.</div>
            )}

            {friends.map(u => (
              <button
                key={u.id}
                className={styles.account}
                onClick={() => navigate(`/user/${u.id}`)}
              >
                <div className={styles.avatar} />
                <span
                  className={styles.usernameLink}
                  onClick={(e) => { e.stopPropagation(); navigate(`/user/${u.id}`); }}
                >
                  {u.username}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
