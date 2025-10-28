import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import Topnav from "../Components/Topnav";
import styles from "./FollowPages.module.css";

const API = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:5062";

export default function Following() {
  const { id } = useParams();
  const [friends, setFriends] = useState([]);

  useEffect(() => {
    (async () => {
      const res = await fetch(`${API}/api/friend/friends/${id}`);
      if (res.ok) setFriends(await res.json());
    })();
  }, [id]);

  return (
    <>
      <Topnav />
      <div className={styles.page}>
        <div className={styles.container}>
          <h1>Following</h1>
          <div className={styles.list}>
            {friends.length === 0 && <p>Not following anyone yet.</p>}
            {friends.map(f => (
              <div key={f.friendsWithId} className={styles.card}>
                <div className={styles.avatar} />
                <div className={styles.info}>
                  <h3>{f.username}</h3>
                  <p>
                    Friends since{" "}
                    {new Date(f.timeAccepted ?? f.timeFriended).toLocaleDateString()}
                  </p>
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
