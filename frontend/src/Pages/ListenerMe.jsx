import { useEffect, useMemo, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Topnav from "../Components/Topnav";
import verifiedBadge from "../assets/graphics/musician_verification.png";
import useMe from "../Components/UseMe";
import KebabMenu from "../Components/Profile/KebabMenu.jsx";
import useFollow from "../hooks/useFollow.js";
import API from "../lib/api.js";
import styles from "./ListenerMe.module.css";

export default function ListenerMe() {
  const { id } = useParams();
  const navigate = useNavigate();
  const profileUserId = useMemo(() => Number(id), [id]);

  const { me } = useMe({ redirectIfMissing: true });
  const currentUserId = useMemo(() => me?.userId ?? me?.UserId ?? null, [me]);

  const [user, setUser] = useState(null);
  const [isVerifiedMusician, setIsVerifiedMusician] = useState(false);
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
        fetch(`${API}/api/follow/followers/${profileUserId}`),
        fetch(`${API}/api/follow/following/${profileUserId}`),
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
        const res = await fetch(`${API}/api/user/${profileUserId}`);
        if (!res.ok) {
          setError("Could not load user.");
          setUser(null);
          return;
        }
        const data = await res.json();
        setUser(data);
        // If this user is a musician, fetch musician record to check verification
        if (data?.musicianId) {
          try {
            const mRes = await fetch(`${API}/api/musician/${data.musicianId}`, { credentials: "include" });
            if (mRes.ok) {
              const m = await mRes.json();
              if (m?.isVerified) setIsVerifiedMusician(true);
            } else {
              setIsVerifiedMusician(false);
            }
          } catch {
            setIsVerifiedMusician(false);
          }
        } else {
          setIsVerifiedMusician(false);
        }
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

  function goToConnections() {
    navigate(`/follows/${profileUserId}`);
  }

  async function handleFollowClick() {
    if (!canFollow) return;
    await followAct();
    await loadCounts();
  }

  const showFollowButton =
    me && currentUserId && profileUserId && currentUserId !== profileUserId;

  return (
    <>
      <Topnav />
      <div className={styles.page}>
        <div className={styles.container}>
          {loadingUser && (
            <p style={{ textAlign: "center", color: "#fff" }}>
              Loading profile...
            </p>
          )}
          {error && <p className={styles.error}>{error}</p>}
          {!loadingUser && !user && (
            <p style={{ textAlign: "center", color: "#fff" }}>
              User not found.
            </p>
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
                <h1 className={styles.nameRow}>
                  @{user.username}
                  {isVerifiedMusician && (
                    <img
                      src={verifiedBadge}
                      alt="Verified musician"
                      className={styles.verifiedBadge}
                    />
                  )}
                </h1>
                <p>
                  {user.fname} {user.lname}
                </p>

                <div className={styles.stats}>
                  <span>{followerCount} Followers</span>
                  <span>{followingCount} Following</span>
                </div>

                <div className={styles.buttonsRow}>
                  {/* Connections button */}
                  <button
                    type="button"
                    className={styles.connectionsButton}
                    onClick={goToConnections}
                  >
                    Connections
                  </button>

                  {/* Follow / Unfollow button */}
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

          {/* later: playlists/history sections here */}
        </div>
      </div>
    </>
  );
}
