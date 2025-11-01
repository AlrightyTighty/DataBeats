import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, Link } from "react-router";
import Topnav from "../Components/Topnav";
import styles from "./ListenerProfile.module.css";
import API from "../lib/api.js";

export default function ListenerPublic() {
  const { id } = useParams();                   
  const navigate = useNavigate();

  const [me, setMe] = useState(null);           
  const [user, setUser] = useState(null);       

  const [isFollowing, setIsFollowing] = useState(false); 
  const [requested, setRequested] = useState(false);      
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const viewedUserId = useMemo(() => Number(id), [id]);

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch(`${API}/api/me`, { credentials: "include" });
        if (!r.ok) { navigate("/login"); return; }
        const meJson = await r.json();
        setMe(meJson);
      } catch {
        navigate("/login");
      }
    })();
  }, [navigate]);

  //Load viewed user
  useEffect(() => {
    if (!viewedUserId) return;
    (async () => {
      try {
        const r = await fetch(`${API}/api/user/${viewedUserId}`, { credentials: "include" });
        if (r.ok) setUser(await r.json());
      } catch { /* ignore */ }
    })();
  }, [viewedUserId]);

  useEffect(() => {
    if (!me || !viewedUserId) return;

    (async () => {
      try {
        const f = await fetch(`${API}/api/friend/friends/${me.userId}`, { credentials: "include" });
        const friends = f.ok ? await f.json() : [];
        const friendIds = Array.isArray(friends) ? friends.map(x => Number(x.FriendId ?? x.friendId)) : [];
        setIsFollowing(friendIds.includes(viewedUserId));

        const p = await fetch(`${API}/api/friend/pending/${viewedUserId}`, { credentials: "include" });
        if (p.ok) {
          const pendingList = await p.json();
          const youRequested = Array.isArray(pendingList)
            ? pendingList.some(req => Number(req.FrienderId ?? req.frienderId) === Number(me.userId))
            : false;
          setRequested(youRequested);
        }
      } catch { /* ignore */ }
      finally {
        setLoading(false);
      }
    })();
  }, [me, viewedUserId]);

  async function handleFollow() {
    if (!me || !viewedUserId || me.userId === viewedUserId) return;
    setBusy(true);
    try {
      const r = await fetch(`${API}/api/friend`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ frienderId: Number(me.userId), friendeeId: viewedUserId }),
      });
      if (r.ok) {
        setRequested(true);  
        setIsFollowing(false);
      }
    } finally {
      setBusy(false);
    }
  }

  async function handleUnfollow() {
    if (!me || !viewedUserId || me.userId === viewedUserId) return;
    setBusy(true);
    try {
      const r = await fetch(`${API}/api/friend/${me.userId}/${viewedUserId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (r.ok) {
        setIsFollowing(false);
        setRequested(false);
      }
    } finally {
      setBusy(false);
    }
  }

  const isSelf = me && Number(me.userId) === viewedUserId;

  return (
    <>
      <Topnav />
      <div className={styles.page}>
        <div className={styles.container}>
          <div className={styles.left}>
            <div className={styles.avatar} />
            <div>
              <h1>{user?.username || "User"}</h1>
              <p>{user?.email || "-"}</p>

              <div className={styles.actions}>
                <Link to={`/followers/${viewedUserId}`} className={styles.btnSec}>
                  Followers
                </Link>
                <Link to={`/following/${viewedUserId}`} className={styles.btnSec}>
                  Following
                </Link>

                {!isSelf && (
                  <>
                    {isFollowing ? (
                      <button className={styles.btnUnfollow} onClick={handleUnfollow} disabled={busy}>
                        {busy ? "..." : "Unfollow"}
                      </button>
                    ) : requested ? (
                      <button className={styles.btnPending} disabled>
                        Requested
                      </button>
                    ) : (
                      <button className={styles.btn} onClick={handleFollow} disabled={busy}>
                        {busy ? "..." : "Follow"}
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          <div className={styles.right}>
            {loading ? (
              <div className={styles.card}><h2>Loading…</h2></div>
            ) : (
              <>
                <div className={styles.card}><h2>Recent Activity</h2><div>No activity yet</div></div>
                <div className={styles.card}><h2>Public Playlists</h2><div>None available</div></div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
