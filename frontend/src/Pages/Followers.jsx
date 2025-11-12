import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router";
import Topnav from "../Components/Topnav";
import styles from "./FollowPages.module.css";

const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:5062";

export default function Followers() {
  const { id } = useParams();
  const userId = useMemo(() => Number(id), [id]);
  const navigate = useNavigate();

  const [owner, setOwner] = useState(null);
  const [followers, setFollowers] = useState([]);
  const [pending, setPending] = useState([]);
  const [busyId, setBusyId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  useEffect(() => {
    if (!userId) return;
    (async () => {
      try {
        setLoading(true);
        setErr(null);
        const [u, f, p] = await Promise.all([
          fetch(`${API}/api/user/${userId}`, { credentials: "include" }),
          fetch(`${API}/api/friend/friends/${userId}`, { credentials: "include" }),
          fetch(`${API}/api/friend/pending/${userId}`, { credentials: "include" }),
        ]);
        if (u.ok) setOwner(await u.json());

        if (!f.ok) throw new Error("Failed to load followers");
        const fData = await f.json();
        const mappedF = (Array.isArray(fData) ? fData : []).map(x => ({
          id: x.friendId,
          username: x.username,
          since: x.timeAccepted ?? x.timeFriended,
        }));
        setFollowers(mappedF);

        const pData = p.ok ? await p.json() : [];
        const mappedP = (Array.isArray(pData) ? pData : []).map(x => ({
          requestId: x.friendsWithId,
          id: x.frienderId,
          username: x.frienderName,
          since: x.timeFriended,
        }));
        setPending(mappedP);
      } catch (e) {
        setErr(e.message || String(e));
      } finally {
        setLoading(false);
      }
    })();
  }, [userId]);

  async function accept(reqId) {
    try {
      setBusyId(reqId);
      const r = await fetch(`${API}/api/friend/accept/${reqId}`, { method: "PATCH", credentials: "include" });
      if (!r.ok) throw new Error("Accept failed");
      const item = pending.find(p => p.requestId === reqId);
      setPending(pending.filter(p => p.requestId !== reqId));
      if (item) setFollowers([{ id: item.id, username: item.username, since: new Date().toISOString() }, ...followers]);
    } catch (e) {
      setErr(e.message || String(e));
    } finally {
      setBusyId(null);
    }
  }

  async function decline(reqId) {
    try {
      setBusyId(reqId);
      setPending(pending.filter(p => p.requestId !== reqId));
    } finally {
      setBusyId(null);
    }
  }

  const cards = [...pending.map(p => ({ type: "pending", ...p })), ...followers.map(f => ({ type: "friend", ...f }))];

  return (
    <>
      <Topnav />
      <div className={styles.page}>
        <div className={styles.panel}>
          <div className={styles.headerRow}>
            <div className={styles.headerUsername}>{owner?.username ?? "Username"}</div>
            <div className={styles.headerTitle}>Follower</div>
          </div>

          {err && <div className={styles.errorCard}>{err}</div>}

          <div className={styles.grid}>
            {!loading && cards.length === 0 && (
              <div className={styles.emptyCard}>No followers yet.</div>
            )}

            {cards.map(card =>
              card.type === "pending" ? (
                <div key={`p-${card.requestId}`} className={styles.requestWrap}>
                  <button
                    className={styles.account}
                    onClick={() => navigate(`/user/${card.id}`)}
                  >
                    <div className={styles.avatar} />
                    <span
                      className={styles.usernameLink}
                      onClick={(e) => { e.stopPropagation(); navigate(`/user/${card.id}`); }}
                    >
                      {card.username}
                    </span>
                  </button>

                  <div className={styles.requestBtns}>
                    <button
                      className={styles.pill}
                      disabled={busyId === card.requestId}
                      onClick={() => accept(card.requestId)}
                    >
                      Accept
                    </button>
                    <button
                      className={`${styles.pill} ${styles.pillDanger}`}
                      disabled={busyId === card.requestId}
                      onClick={() => decline(card.requestId)}
                    >
                      Decline
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  key={`f-${card.id}`}
                  className={styles.account}
                  onClick={() => navigate(`/user/${card.id}`)}
                >
                  <div className={styles.avatar} />
                  <span
                    className={styles.usernameLink}
                    onClick={(e) => { e.stopPropagation(); navigate(`/user/${card.id}`); }}
                  >
                    {card.username}
                  </span>
                </button>
              )
            )}
          </div>
        </div>
      </div>
    </>
  );
}
