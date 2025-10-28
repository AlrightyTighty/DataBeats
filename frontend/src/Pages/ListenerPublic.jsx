import { useEffect, useState } from "react";
import { useParams } from "react-router";
import Topnav from "../Components/Topnav";
import styles from "./ListenerProfile.module.css";

const API = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:5062";
const CURRENT_USER_ID = 1; 

export default function ListenerPublic() {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    (async () => {
      const res = await fetch(`${API}/api/user/${id}`);
      if (res.ok) setUser(await res.json());
    })();
    (async () => {
      const res = await fetch(`${API}/api/friend/friends/${CURRENT_USER_ID}`);
      if (res.ok) {
        const data = await res.json();
        const friendIds = data.map(f => f.friendId);
        setIsFollowing(friendIds.includes(Number(id)));
      }
    })();
  }, [id]);

  async function handleFollowToggle() {
    if (isFollowing) {
      await fetch(`${API}/api/friend/${CURRENT_USER_ID}/${id}`, { method: "DELETE" });
      setIsFollowing(false);
    } else {
      await fetch(`${API}/api/friend`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ frienderId: CURRENT_USER_ID, friendeeId: Number(id) }),
        });
      setIsFollowing(true);
    }
  }

  return (
    <>
      <Topnav />
      <div className={styles.page}>
        <div className={styles.container}>
          <div className={styles.left}>
            <div className={styles.avatar}/>
            <div>
              <h1>{user?.username || "User"}</h1>
              <p>{user?.email || "-"}</p>
              <div className={styles.actions}>
                <button className={isFollowing ? styles.btnUnfollow : styles.btn}
                        onClick={handleFollowToggle}>
                  {isFollowing ? "Unfollow" : "Follow"}
                </button>
                <a href={`/followers/${id}`} className={styles.btnSec}>Followers</a>
                <a href={`/following/${id}`} className={styles.btnSec}>Following</a>
              </div>
            </div>
          </div>
          <div className={styles.right}>
            <div className={styles.card}><h2>Recent Activity</h2><div>No activity yet</div></div>
            <div className={styles.card}><h2>Public Playlists</h2><div>None available</div></div>
          </div>
        </div>
      </div>
    </>
  );
}
