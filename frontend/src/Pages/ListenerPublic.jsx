import { useEffect, useMemo, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Topnav from "../Components/Topnav";
import useMe from "../Components/UseMe";
import KebabMenu from "../Components/Profile/KebabMenu.jsx";
import useFollow from "../hooks/useFollow.js";
import API from "../lib/api.js";
import styles from "./ListenerPublic.module.css";

export default function ListenerPublic() {
  const { id } = useParams();
  const navigate = useNavigate();
  const profileUserId = useMemo(() => Number(id), [id]);

  const { me } = useMe();
  const currentUserId = useMemo(() => me?.userId ?? me?.UserId ?? null, [me]);

  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [error, setError] = useState("");
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);

  const {
    label: followLabel,
    act: followAct,
    loading: followLoading,
    canFollow,
  } = useFollow({
    viewerId: currentUserId,
    targetId: profileUserId,
    apiBase: API,
  });

  const loadCounts = useCallback(async () => {
    if (!profileUserId) return;
    try {
      const [followersRes, followingRes] = await Promise.all([
        fetch(`${API}/api/follow/followers/${profileUserId}`, {
          credentials: "include",
        }),
        fetch(`${API}/api/follow/following/${profileUserId}`, {
          credentials: "include",
        }),
      ]);

      if (followersRes.ok) {
        const f = await followersRes.json();
        setFollowerCount(Array.isArray(f) ? f.length : 0);
      } else {
        setFollowerCount(0);
      }

      if (followingRes.ok) {
        const g = await followingRes.json();
        setFollowingCount(Array.isArray(g) ? g.length : 0);
      } else {
        setFollowingCount(0);
      }
    } catch {
      setFollowerCount(0);
      setFollowingCount(0);
    }
  }, [profileUserId]);

  useEffect(() => {
    if (!profileUserId) return;

    (async () => {
      try {
        setLoadingUser(true);
        setError("");
        const res = await fetch(`${API}/api/user/${profileUserId}`, {
          credentials: "include",
        });
        if (!res.ok) {
          setError("Could not load user.");
          setUser(null);
          return;
        }
        const data = await res.json();
        setUser(data);
      } catch {
        setError("Error loading user.");
      } finally {
        setLoadingUser(false);
      }
    })();
  }, [profileUserId]);

  useEffect(() => {
    loadCounts();
  }, [loadCounts]);

  const avatarSrc =
    user && user.profilePictureFileId
      ? `${API}/api/file/view/${user.profilePictureFileId}`
      : null;

  const shareUrl = `${window.location.origin}/user/${profileUserId}`;

  function onShare() {
    navigator.share?.({
      title: user?.username ?? "User",
      url: shareUrl,
    }) || navigator.clipboard?.writeText(shareUrl);
  }

  function onReport() {
    location.href = `/report?type=user&id=${profileUserId}`;
  }

  function goToFollowers() {
    navigate(`/followers/${profileUserId}`);
  }

  function goToFollowing() {
    navigate(`/following/${profileUserId}`);
  }

  async function handleFollowClick() {
    if (!canFollow) return;
    await followAct();
    await loadCounts();
  }

  const showFollowButton =
    canFollow &&
    currentUserId &&
    profileUserId &&
    currentUserId !== profileUserId;

  return (
    <>
      <Topnav />
      <div className={styles.page}>
        <div className={styles.container}>
          {loadingUser && <p className={styles.status}>Loading profile...</p>}
          {error && <p className={styles.status}>{error}</p>}
          {!loadingUser && !user && (
            <p className={styles.status}>User not found.</p>
          )}

          {user && (
            <div className={styles.header}>
              <div className={styles.kebabSlot}>
                <KebabMenu onShare={onShare} onReport={onReport} />
              </div>

              {avatarSrc ? (
                <img src={avatarSrc} alt="User" className={styles.pic} />
              ) : (
                <div className={styles.pic} />
              )}

              <div className={styles.info}>
                <h1 className={styles.username}>@{user.username}</h1>

                <div className={styles.stats}>
                  <span>{followerCount} Followers</span>
                  <span>{followingCount} Following</span>
                </div>

                <div className={styles.buttons}>
                  {showFollowButton && (
                    <button
                      onClick={handleFollowClick}
                      className={
                        followLabel === "Unfollow"
                          ? styles.unfollow
                          : styles.follow
                      }
                      disabled={followLoading}
                    >
                      {followLoading ? "..." : followLabel || "Follow"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
