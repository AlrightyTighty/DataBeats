import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router";
import Topnav from "../Components/Topnav";
import verifiedBadge from "../assets/graphics/musician_verification.png";
import useMe from "../Components/UseMe";
import KebabMenu from "../Components/Profile/KebabMenu.jsx";
import useFollow from "../hooks/useFollow.js";
import { usePlaybar } from "../contexts/PlaybarContext";
import API from "../lib/api.js";
import styles from "./ListenerMe.module.css";

async function fetchImageDataUrl(fileId) {
  if (!fileId) return null;
  try {
    const res = await fetch(`${API}/api/images/profile-picture/${fileId}`, {
      credentials: "include",
    });
    if (!res.ok) return null;
    const data = await res.json();
    const fileData = data.fileData;
    const fileExt = data.fileExtension || "jpeg";
    if (!fileData) return null;
    return `data:image/${fileExt};base64,${fileData}`;
  } catch (err) {
    console.error("fetchImageDataUrl error:", err);
    return null;
  }
}

export default function ListenerMe() {
  const { setPlaybarState } = usePlaybar();
  const { id } = useParams();
  const navigate = useNavigate();
  const profileUserId = Number(id);

  const { me, loading: authLoading } = useMe();
  const currentUserId = me?.userId ?? null;

  useEffect(() => {
    if (!authLoading && !me) {
      navigate("/login");
    }
  }, [authLoading, me, navigate]);

  const [user, setUser] = useState(null);
  const [musician, setMusician] = useState(null);
  const [userAvatarSrc, setUserAvatarSrc] = useState(null);
  const [musicianAvatarSrc, setMusicianAvatarSrc] = useState(null);

  const [isVerifiedMusician, setIsVerifiedMusician] = useState(false);
  const [loadingUser, setLoadingUser] = useState(true);
  const [error, setError] = useState("");
  const [follows, setFollows] = useState({ followers: 0, following: 0 });
  const [areFriends, setAreFriends] = useState(false);

  const [topSongs, setTopSongs] = useState([]);
  const {
    label: followLabel,
    act: followAct,
    loading: followLoading,
    canFollow,
    isFollowing,
  } = useFollow({
    viewerId: currentUserId,
    targetId: profileUserId,
    apiBase: API,
  });

  const loadCounts = useCallback(async () => {
    if (!profileUserId) return;
    const controller = new AbortController();
    try {
      const [followersRes, followingRes] = await Promise.all([
        fetch(`${API}/api/follow/followers/${profileUserId}`, {
          credentials: "include",
          signal: controller.signal,
        }),
        fetch(`${API}/api/follow/following/${profileUserId}`, {
          credentials: "include",
          signal: controller.signal,
        }),
      ]);

      const followers = followersRes.ok
        ? (await followersRes.json()).length
        : 0;
      const following = followingRes.ok
        ? (await followingRes.json()).length
        : 0;
      setFollows({ followers, following });
    } catch (err) {
      if (err.name === "AbortError") return;
      console.error("loadCounts error:", err);
      setFollows({ followers: 0, following: 0 });
    } finally {
    }
  }, [profileUserId]);

  const checkFriendship = useCallback(async () => {
    if (!currentUserId || !profileUserId) {
      setAreFriends(false);
      return;
    }
    try {
      const res = await fetch(
        `${API}/api/follow/are-friends/${currentUserId}/${profileUserId}`,
        { credentials: "include" }
      );
      if (res.ok) {
        const data = await res.json();
        setAreFriends(data.areFriends);
      } else {
        setAreFriends(false);
      }
    } catch {
      setAreFriends(false);
    }
  }, [currentUserId, profileUserId]);

  useEffect(() => {
    if (!profileUserId) return;
    const controller = new AbortController();
    let mounted = true;

    (async () => {
      setLoadingUser(true);
      setError("");
      try {
        const res = await fetch(`${API}/api/user/${profileUserId}`, {
          credentials: "include",
          signal: controller.signal,
        });
        if (!res.ok) {
          setError("Could not load user.");
          setUser(null);
          return;
        }
        const data = await res.json();
        if (mounted) setUser(data);
      } catch (err) {
        if (err.name === "AbortError") return;
        console.error("Error loading user:", err);
        if (mounted) setError("Error loading user.");
      } finally {
        if (mounted) setLoadingUser(false);
      }
    })();

    return () => {
      mounted = false;
      controller.abort();
    };
  }, [profileUserId]);

  useEffect(() => {
    loadCounts();
    checkFriendship();
  }, [loadCounts, checkFriendship]);

  useEffect(() => {
    let mounted = true;
    if (!user?.profilePictureFileId) {
      setUserAvatarSrc(null);
      return;
    }
    (async () => {
      const src = await fetchImageDataUrl(user.profilePictureFileId);
      if (mounted) setUserAvatarSrc(src);
    })();
    return () => {
      mounted = false;
    };
  }, [user?.profilePictureFileId]);

  const musicianId = user?.musicianId ?? null;
  const hasMusician = !!musicianId;

  useEffect(() => {
    if (!musicianId) {
      setMusician(null);
      setMusicianAvatarSrc(null);
      setIsVerifiedMusician(false);
      return;
    }

    const controller = new AbortController();
    let mounted = true;

    (async () => {
      try {
        const res = await fetch(`${API}/api/musician/${musicianId}`, {
          credentials: "include",
          signal: controller.signal,
        });
        if (!res.ok) {
          if (mounted) {
            setMusician(null);
            setIsVerifiedMusician(false);
          }
          return;
        }
        const m = await res.json();
        if (mounted) {
          setMusician(m);
          setIsVerifiedMusician(!!m.isVerified);
        }
      } catch (err) {
        if (err.name === "AbortError") return;
        console.error("Error loading musician:", err);
        if (mounted) {
          setMusician(null);
          setIsVerifiedMusician(false);
        }
      }
    })();

    return () => {
      controller.abort();
    };
  }, [musicianId]);

  useEffect(() => {
    if (!musician?.profilePictureFileId) {
      setMusicianAvatarSrc(null);
      return;
    }
    let mounted = true;
    (async () => {
      const src = await fetchImageDataUrl(musician.profilePictureFileId);
      if (mounted) setMusicianAvatarSrc(src);
    })();
    return () => {
      mounted = false;
    };
  }, [musician?.profilePictureFileId]);

  useEffect(() => {
    if (!profileUserId) return;
    const controller = new AbortController();
    let mounted = true;
    (async () => {
      try {
        const res = await fetch(`${API}/api/history/top-songs?limit=5`, {
          headers: { "X-UserId": String(profileUserId) },
          credentials: "include",
          signal: controller.signal,
        });
        if (!res.ok) {
          if (mounted) setTopSongs([]);
          return;
        }
        const data = await res.json();
        const items = Array.isArray(data.items) ? data.items : [];
        if (mounted) setTopSongs(items);
      } catch (err) {
        if (err.name === "AbortError") return;
        console.error("Error loading top songs:", err);
        if (mounted) setTopSongs([]);
      }
    })();
    return () => {
      mounted = false;
      controller.abort();
    };
  }, [profileUserId]);

  const shareUrl = `${window.location.origin}/user/${profileUserId}`;

  const onShare = useCallback(async () => {
    const title = user?.username ?? "User";
    try {
      if (navigator.share) {
        await navigator.share({ title, url: shareUrl });
        return;
      }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(shareUrl);
        return;
      }
      window.prompt("Copy this link:", shareUrl);
    } catch (err) {
      console.error("Share failed:", err);
      try {
        await navigator.clipboard.writeText(shareUrl);
      } catch (e) {
        window.prompt("Copy this link:", shareUrl);
      }
    }
  }, [shareUrl, user]);

  const onReport = useCallback(() => {
    location.href = `/report?type=USER&id=${profileUserId}`;
  }, [profileUserId]);

  const goToConnections = useCallback(() => {
    navigate(`/follows/${profileUserId}`);
  }, [navigate, profileUserId]);

  const handleFollowClick = useCallback(async () => {
    if (!canFollow) return;
    try {
      await followAct();
      await loadCounts();
      await checkFriendship();
    } catch (err) {
      console.error("Follow action failed:", err);
    }
  }, [canFollow, followAct, loadCounts, checkFriendship]);

  function handlePlaySong(song) {
    const songId = song.songId ?? song.SongId;
    const albumId = song.albumId ?? song.AlbumId ?? null;

    setPlaybarState({
      songId,
      albumId,
      songList: topSongs,
      playlistId: null,
      visible: true,
    });
  }

  const goToPlaylists = useCallback(() => {
    navigate(`/user-playlists/${profileUserId}`);
  }, [navigate, profileUserId]);

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
            <>
              {/* Top header */}
              <div className={styles.header}>
                <div className={styles.kebabSlot}>
                  <KebabMenu onShare={onShare} onReport={onReport} />
                </div>

                {userAvatarSrc ? (
                  <img
                    src={userAvatarSrc}
                    alt={`${user.username ?? "User"} avatar`}
                    className={styles.pic}
                  />
                ) : (
                  <div className={styles.pic} aria-hidden />
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
                    <span>{follows.followers} Followers</span>
                    <span>{follows.following} Following</span>
                    {areFriends && (
                      <span className={styles.friendsBadge}>⭐ Friends</span>
                    )}
                  </div>

                  <div className={styles.buttonsRow}>
                    <button
                      type="button"
                      className={styles.connectionsButton}
                      onClick={goToConnections}
                    >
                      Connections
                    </button>

                    {showFollowButton && (
                      <button
                        onClick={handleFollowClick}
                        className={
                          followLabel === "Unfollow"
                            ? styles.unfollow
                            : styles.follow
                        }
                        disabled={followLoading}
                        aria-label={followLabel ?? "Follow"}
                      >
                        {followLoading ? "..." : followLabel || "Follow"}
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* musician block + top songs */}
              <div className={styles.sectionsRow}>
                {hasMusician && musician && (
                  <div className={styles.musicianCard}>
                    <div className={styles.musicianHeader}>
                      {musicianAvatarSrc ? (
                        <img
                          src={musicianAvatarSrc}
                          alt={`${musician.musicianName ?? "Artist"} avatar`}
                          className={styles.musicianPic}
                        />
                      ) : (
                        <div className={styles.musicianPic} aria-hidden />
                      )}

                      <div>
                        <h2 className={styles.musicianName}>
                          {musician.musicianName}
                        </h2>
                        <p className={styles.musicianStats}>
                          {musician.monthlyListenerCount ?? 0} Monthly Listeners
                        </p>
                      </div>
                    </div>

                    <p className={styles.musicianBio}>
                      {musician.bio || "No bio available."}
                    </p>

                    <button
                      type="button"
                      className={styles.musicianProfileButton}
                      onClick={() => navigate(`/artist/${musician.musicianId}`)}
                    >
                      View Musician Profile
                    </button>
                  </div>
                )}

                <div
                  className={`${styles.topSongsCard} ${
                    !hasMusician ? styles.topSongsFull : ""
                  }`}
                >
                  <div className={styles.topSongsHeader}>
                    <h2>Top Songs</h2>
                  </div>

                  {topSongs.length === 0 ? (
                    <p className={styles.centerText}>
                      No listening history yet.
                    </p>
                  ) : (
                    <div className={styles.songList}>
                      {topSongs.map((s, idx) => {
                        const songId = s.songId;
                        const title = s.songName;
                        const artist = s.artistName ?? "Unknown";
                        const album = s.albumTitle ?? "";

                        return (
                          <div key={songId ?? idx} className={styles.songRow}>
                            <div className={styles.songInfo}>
                              <span className={styles.songIndex}>
                                {idx + 1}.
                              </span>
                              <div>
                                <div className={styles.songTitle}>{title}</div>
                                <div className={styles.songMeta}>
                                  {artist}
                                  {album ? ` • ${album}` : ""}
                                </div>
                              </div>
                            </div>

                            <button
                              type="button"
                              className={styles.playButton}
                              aria-label={`Play ${title}`}
                              onClick={() => handlePlaySong(s)}
                            >
                              ▶
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Playlists */}
              <div className={styles.bottomRow}>
                <button
                  type="button"
                  className={styles.viewPlaylists}
                  onClick={goToPlaylists}
                >
                  View All Playlists
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
