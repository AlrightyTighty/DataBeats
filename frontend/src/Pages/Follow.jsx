import { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router";
import Topnav from "../Components/Topnav";
import API from "../lib/api.js";
import styles from "./Follow.module.css";

async function fetchJson(url, opts = {}) {
  const res = await fetch(url, { credentials: "include", ...opts });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `HTTP ${res.status}`);
  }
  return res.json();
}

export default function Follows({ defaultTab = "followers" }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const profileUserId = Number(id);

  const [follows, setFollows] = useState({
    followers: [],
    following: [],
    loadingFollowers: true,
    loadingFollowing: true,
    errorFollowers: "",
    errorFollowing: "",
  });

  const setFollowState = useCallback((patch) => {
    setFollows((s) => ({ ...s, ...patch }));
  }, []);

  const loadFollowers = useCallback(
    async (signal) => {
      if (!profileUserId) {
        setFollowState({ followers: [], loadingFollowers: false });
        return;
      }
      try {
        setFollowState({ loadingFollowers: true, errorFollowers: "" });
        const data = await fetchJson(
          `${API}/api/follow/followers/${profileUserId}`,
          { signal }
        );
        return Array.isArray(data) ? data : [];
      } catch (err) {
        if (err.name === "AbortError") throw err;
        console.error("loadFollowers failed:", err);
        throw new Error(err.message || "Error loading followers.");
      }
    },
    [profileUserId, setFollowState]
  );

  const loadFollowing = useCallback(
    async (signal) => {
      if (!profileUserId) {
        setFollowState({ following: [], loadingFollowing: false });
        return;
      }
      try {
        setFollowState({ loadingFollowing: true, errorFollowing: "" });
        const data = await fetchJson(
          `${API}/api/follow/following/${profileUserId}`,
          { signal }
        );
        return Array.isArray(data) ? data : [];
      } catch (err) {
        if (err.name === "AbortError") throw err;
        console.error("loadFollowing failed:", err);
        throw new Error(err.message || "Error loading following.");
      }
    },
    [profileUserId, setFollowState]
  );

  useEffect(() => {
    if (!profileUserId) return;

    const controller = new AbortController();
    let alive = true;

    (async () => {
      try {
        const [followersResult, followingResult] = await Promise.allSettled([
          loadFollowers(controller.signal),
          loadFollowing(controller.signal),
        ]);

        if (!alive) return;

        // followers
        if (followersResult.status === "fulfilled") {
          setFollowState({
            followers: followersResult.value,
            errorFollowers: "",
          });
        } else {
          setFollowState({
            followers: [],
            errorFollowers: "Could not load followers.",
          });
          console.warn("Followers promise rejected:", followersResult.reason);
        }

        //following
        if (followingResult.status === "fulfilled") {
          setFollowState({
            following: followingResult.value,
            errorFollowing: "",
          });
        } else {
          setFollowState({
            following: [],
            errorFollowing: "Could not load following.",
          });
          console.warn("Following promise rejected:", followingResult.reason);
        }
      } catch (err) {
        if (err.name === "AbortError") {
          console.info("Follows fetch aborted for user:", profileUserId);
          return;
        }
        console.error("Unexpected error loading follows:", err);
        setFollowState({
          followers: [],
          following: [],
          errorFollowers: "Error loading followers.",
          errorFollowing: "Error loading following.",
        });
      } finally {
        setTimeout(() => {
          if (alive) {
            setFollowState({
              loadingFollowers: false,
              loadingFollowing: false,
            });
          }
        }, 120);
      }
    })();

    return () => {
      alive = false;
      controller.abort();
    };
  }, [profileUserId, loadFollowers, loadFollowing, setFollowState]);

  function openUser(userId) {
    navigate(`/user/${userId}`);
  }

  function openMusician(musicianId) {
    navigate(`/artist/${musicianId}`);
  }

  const {
    followers,
    following,
    loadingFollowers,
    loadingFollowing,
    errorFollowers,
    errorFollowing,
  } = follows;

  return (
    <>
      <Topnav />
      <div className={styles.page}>
        <div className={styles.container}>
          {/* Tabs */}
          <div className={styles.tabs}>
            <button
              type="button"
              className={`${styles.tabButton} ${
                (followers && (follows._activeTab === "followers" || undefined),
                "")
              }`}
              onClick={() => setFollowState({ _activeTab: "followers" })}
              aria-pressed={true}
            >
              Followers
            </button>

            <button
              type="button"
              className={`${styles.tabButton}`}
              onClick={() => setFollowState({ _activeTab: "following" })}
            >
              Following
            </button>
          </div>

          {(() => {
            const tab = follows._activeTab || "followers";
            if (tab === "followers") {
              return (
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

                  <div className={styles.list} role="list">
                    {followers.map((f) => (
                      <div key={f.userId} className={styles.row}>
                        <button
                          type="button"
                          className={styles.card}
                          onClick={() => openUser(f.userId)}
                          aria-label={`Open profile for ${f.username}`}
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
                        {f.isFriend && (
                          <div className={styles.friendsBadge}>
                            ⭐ Friends
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </>
              );
            }

            // following
            return (
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
                      <button
                        type="button"
                        className={styles.card}
                        onClick={() => openUser(u.userId)}
                        aria-label={`Open profile for ${u.username}`}
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

                      {u.isFriend && (
                        <div className={styles.friendsBadge}>
                          ⭐ Friends
                        </div>
                      )}

                      {u.hasMusicianProfile && u.musicianId && (
                        <button
                          type="button"
                          className={styles.musicianCard}
                          onClick={() => openMusician(u.musicianId)}
                          aria-label={`Open musician profile for ${
                            u.musicianName || u.username
                          }`}
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
            );
          })()}
        </div>
      </div>
    </>
  );
}
