import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import Topnav from "../Components/Topnav";
import styles from "./FollowPages.module.css";

const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:5062";

export default function Followers() {
  const { id } = useParams();
  const [friends, setFriends] = useState([]);
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const [busyId, setBusyId] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setErr(null);
        const [rFriends, rPending] = await Promise.all([
          fetch(`${API}/api/friend/friends/${id}`),
          fetch(`${API}/api/friend/pending/${id}`),
        ]);
        if (!rFriends.ok || !rPending.ok) throw new Error("Failed to load follows");
        setFriends(await rFriends.json());
        setPending(await rPending.json());
      } catch (e) {
        setErr(e.message || String(e));
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  async function acceptRequest(reqId) {
    try {
      setBusyId(reqId);
      const r = await fetch(`${API}/api/friend/accept/${reqId}`, { method: "PATCH" });
      if (!r.ok) throw new Error("Accept failed");
      const accepted = pending.find(p => p.friendsWithId === reqId);
      setPending(pending.filter(p => p.friendsWithId !== reqId));
      setFriends([{
        friendsWithId: reqId,
        friendId: accepted.frienderId,
        username: accepted.frienderName,
        timeFriended: accepted.timeFriended,
        timeAccepted: new Date().toISOString()
      }, ...friends]);
    } catch (e) {
      setErr(e.message || String(e));
    } finally {
      setBusyId(null);
    }
  }

  async function declineRequest(reqId) {
    try {
      setBusyId(reqId);
      setPending(pending.filter(p => p.friendsWithId !== reqId));
    } finally {
      setBusyId(null);
    }
  }

  return (
    <>
      <Topnav />
      <div className={styles.page}>
        <div className={styles.container}>
          <h1>Followers {friends.length > 0 ? `(${friends.length})` : ""}</h1>

          {err && (
            <div className={styles.card} style={{ background: "rgba(255,0,0,.15)" }}>
              {err}
            </div>
          )}

          <div className={styles.list}>
            {(!loading && friends.length === 0) && (
              <div className={styles.card} style={{ opacity: .8, justifyContent: "center" }}>
                No followers yet.
              </div>
            )}
            {friends.map(f => (
              <div
                key={f.friendsWithId}
                className={styles.card}
                role="link"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && (location.href = `/user/${f.friendId}`)}
              >
                <div className={styles.avatar} />
                <div className={styles.info}>
                  <h3>{f.username}</h3>
                  <p>
                    Friended on {new Date(f.timeAccepted ?? f.timeFriended).toLocaleDateString()}
                  </p>
                </div>
                <a href={`/user/${f.friendId}`} className={styles.btn}>View Profile</a>
              </div>
            ))}
          </div>

          <h2 style={{ marginTop: 8 }}>Pending Requests {pending.length > 0 ? `(${pending.length})` : ""}</h2>
          <div className={styles.list}>
            {(!loading && pending.length === 0) && (
              <div className={styles.card} style={{ opacity: .8, justifyContent: "center" }}>
                No pending requests.
              </div>
            )}
            {pending.map(p => (
              <div key={p.friendsWithId} className={styles.card}>
                <div className={styles.avatar} />
                <div className={styles.info}>
                  <h3>{p.frienderName}</h3>
                  <p>Requested on {new Date(p.timeFriended).toLocaleDateString()}</p>
                </div>
                <div style={{ display: "flex", gap: 8, minWidth: 180, justifyContent: "flex-end" }}>
                  <button
                    className={styles.btn}
                    disabled={busyId === p.friendsWithId}
                    onClick={() => acceptRequest(p.friendsWithId)}
                  >
                    Accept
                  </button>
                  <button
                    className={styles.btn}
                    style={{ background: "#d07070" }}
                    disabled={busyId === p.friendsWithId}
                    onClick={() => declineRequest(p.friendsWithId)}
                  >
                    Decline
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </>
  );
}
