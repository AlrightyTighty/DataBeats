import { useParams } from "react-router";
import { useEffect, useState } from "react";
import Topnav from "../Components/Topnav";
import styles from "./FollowPages.module.css";

const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:5062";

export default function Following() {
  const { id } = useParams();
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setErr(null);
        const res = await fetch(`${API}/api/friend/friends/${id}`);
        if (!res.ok) throw new Error("Failed to load following");
        setFriends(await res.json());
      } catch (e) {
        setErr(e.message || String(e));
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  return (
    <>
      <Topnav />
      <div className={styles.page}>
        <div className={styles.container}>
          <h1>Following {friends.length > 0 ? `(${friends.length})` : ""}</h1>

          {err && (
            <div className={styles.card} style={{ background: "rgba(255,0,0,.15)" }}>
              {err}
            </div>
          )}

          <div className={styles.list}>
            {!loading && friends.length === 0 && (
              <div className={styles.card} style={{ opacity: 0.8, justifyContent: "center" }}>
                Not following anyone yet.
              </div>
            )}
            {friends.map((f) => (
              <div key={f.friendsWithId} className={styles.card} role="link" tabIndex={0} onKeyDown={(e) => e.key === "Enter" && (location.href = `/user/${f.friendId}`)}>
                <div className={styles.avatar} />
                <div className={styles.info}>
                  <h3>{f.username}</h3>
                  <p>Friends since {new Date(f.timeAccepted ?? f.timeFriended).toLocaleDateString()}</p>
                </div>
                <a href={`/user/${f.friendId}`} className={styles.btn}>
                  View Profile
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
