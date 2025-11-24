import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router";
import Topnav from "../Components/Topnav";
import API from "../lib/api.js";
import styles from "./Follow.module.css";

export default function Follows({ defaultTab = "followers" }) {
  const { id } = useParams();
  const profileUserId = useMemo(() => Number(id), [id]);
  const navigate = useNavigate();

  const [tab, setTab] = useState(defaultTab); // "followers" | "following"
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [loadingFollowers, setLoadingFollowers] = useState(true);
  const [loadingFollowing, setLoadingFollowing] = useState(true);
  const [errorFollowers, setErrorFollowers] = useState("");
  const [errorFollowing, setErrorFollowing] = useState("");

  useEffect(() => {
    if (!profileUserId) return;

    (async () => {
      try {
        setLoadingFollowers(true);
        setErrorFollowers("");

        const res = await fetch(
          `${API}/api/follow/followers/${profileUserId}`,
          { credentials: "include" }
        );

        if (!res.ok) {
          setErrorFollowers("Could not load followers.");
          setFollowers([]);
          return;
        }

        const data = await res.json();
        setFollowers(Array.isArray(data) ? data : []);
      } catch {
        setErrorFollowers("Error loading followers.");
        setFollowers([]);
      } finally {
        setLoadingFollowers(false);
      }
    })();

    (async () => {
      try {
        setLoadingFollowing(true);
        setErrorFollowing("");

        const res = await fetch(
          `${API}/api/follow/following/${profileUserId}`,
          { credentials: "include" }
        );

        if (!res.ok) {
          setErrorFollowing("Could not load following.");
          setFollowing([]);
          return;
        }

        const data = await res.json();
        setFollowing(Array.isArray(data) ? data : []);
      } catch {
        setErrorFollowing("Error loading following.");
        setFollowing([]);
      } finally {
        setLoadingFollowing(false);
      }
    })();
  }, [profileUserId]);

  function openUser(userId) {
    navigate(`/user/${userId}`);
  }

  function openMusician(musicianId) {
    navigate(`/artist/${musicianId}`);
  }

  return (
    <>
      <Topnav />
      <div className={styles.page}>
        <div className={styles.container}>
          {/* Tabs*/}
          <div className={styles.tabs}>
            <button
              type="button"
              className={
                tab === "followers"
                  ? `${styles.tabButton} ${styles.tabActive}`
                  : styles.tabButton
              }
              onClick={() => setTab("followers")}
            >
              Followers
            </button>
            <button
              type="button"
              className={
                tab === "following"
                  ? `${styles.tabButton} ${styles.tabActive}`
                  : styles.tabButton
              }
              onClick={() => setTab("following")}
            >
              Following
            </button>
          </div>

          {/* Followers */}
          {tab === "followers" && (
            <>
              <h1 className={styles.title}>Followers</h1>

              {loadingFollowers && (
                <p className={styles.status}>Loading followers...</p>
              )}
              {errorFollowers && (
                <p className={styles.status}>{errorFollowers}</p>
              )}
              {!loadingFollowers &&
                !errorFollowers &&
                followers.length === 0 && (
                  <p className={styles.status}>No followers yet.</p>
                )}

              <div className={styles.list}>
                {followers.map((f) => (
                  <button
                    key={f.userId}
                    type="button"
                    className={styles.card}
                    onClick={() => openUser(f.userId)}
                  >
                    <div className={styles.text}>
                      <span className={styles.username}>@{f.username}</span>
                      {(f.fname || f.lname) && (
                        <span className={styles.name}>
                          {[f.fname, f.lname].filter(Boolean).join(" ")}
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}

          {/* Following  */}
          {tab === "following" && (
            <>
              <h1 className={styles.title}>Following</h1>

              {loadingFollowing && (
                <p className={styles.status}>Loading following...</p>
              )}
              {errorFollowing && (
                <p className={styles.status}>{errorFollowing}</p>
              )}
              {!loadingFollowing &&
                !errorFollowing &&
                following.length === 0 && (
                  <p className={styles.status}>Not following anyone yet.</p>
                )}

              <div className={styles.list}>
                {following.map((u) => (
                  <div key={u.userId} className={styles.row}>
                    {/* user card */}
                    <button
                      type="button"
                      className={styles.card}
                      onClick={() => openUser(u.userId)}
                    >
                      <div className={styles.text}>
                        <span className={styles.username}>@{u.username}</span>
                        {(u.fname || u.lname) && (
                          <span className={styles.name}>
                            {[u.fname, u.lname].filter(Boolean).join(" ")}
                          </span>
                        )}
                      </div>
                    </button>

                    {/* musician chip (only if they have musician profile) */}
                    {u.hasMusicianProfile && u.musicianId && (
                      <button
                        type="button"
                        className={styles.musicianCard}
                        onClick={() => openMusician(u.musicianId)}
                      >
                        <span className={styles.musicianLabel}>Musician</span>
                        <span className={styles.musicianName}>
                          {u.musicianName || "View artist profile"}
                        </span>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
