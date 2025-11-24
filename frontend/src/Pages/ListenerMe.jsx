import { useEffect, useMemo, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router";
import Topnav from "../Components/Topnav";
import verifiedBadge from "../assets/graphics/musician_verification.png";
import useMe from "../Components/UseMe";
import KebabMenu from "../Components/Profile/KebabMenu.jsx";
import useFollow from "../hooks/useFollow.js";
import API from "../lib/api.js";
import styles from "./ListenerMe.module.css";

export default function ListenerMe({ setPlaybarState }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const profileUserId = useMemo(() => Number(id), [id]);

  const { me, loading: authLoading } = useMe();
  const currentUserId = useMemo(() => me?.userId ?? null, [me]);

  useEffect(() => {
    if (!authLoading && !me) {
      navigate("/login");
    }
  }, [authLoading, me, navigate]);

  const [user, setUser] = useState(null);
  const musicianId = user?.musicianId ?? null;
  const hasMusician = !!musicianId;
  const [isVerifiedMusician, setIsVerifiedMusician] = useState(false);
  const [loadingUser, setLoadingUser] = useState(true);
  const [error, setError] = useState("");

  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [userAvatarSrc, setUserAvatarSrc] = useState(null);
  const [musician, setMusician] = useState(null);
  const [musicianAvatarSrc, setMusicianAvatarSrc] = useState(null);

  const [topSongs, setTopSongs] = useState([]);

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

  useEffect(() => {
    if (!user?.profilePictureFileId) {
      setUserAvatarSrc(null);
      return;
    }

    (async () => {
      try {
        const res = await fetch(
          `${API}/api/images/profile-picture/${user.profilePictureFileId}`
        );
        if (!res.ok) {
          setUserAvatarSrc(null);
          return;
        }
        const data = await res.json();
        const fileData = data.fileData;
        const fileExt = data.fileExtension;
        if (!fileData) {
          setUserAvatarSrc(null);
          return;
        }
        setUserAvatarSrc(`data:image/${fileExt};base64,${fileData}`);
      } catch {
        setUserAvatarSrc(null);
      }
    })();
  }, [user?.profilePictureFileId]);

  // musician
  useEffect(() => {
    if (!musicianId) {
      setMusician(null);
      setMusicianAvatarSrc(null);
      setIsVerifiedMusician(false);
      return;
    }

    (async () => {
      try {
        // If this user is a musician, fetch musician record to check verification
        const res = await fetch(`${API}/api/musician/${musicianId}`);
        if (!res.ok) {
          setMusician(null);
          setIsVerifiedMusician(false);
          return;
        }
        const m = await res.json();
        setMusician(m);
        setIsVerifiedMusician(!!m.isVerified);
      } catch {
        setMusician(null);
        setIsVerifiedMusician(false);
      }
    })();
  }, [musicianId]);

  // load musician avatar
  useEffect(() => {
    if (!musician?.profilePictureFileId) {
      setMusicianAvatarSrc(null);
      return;
    }

    (async () => {
      try {
        const res = await fetch(
          `${API}/api/images/profile-picture/${musician.profilePictureFileId}`
        );
        if (!res.ok) {
          setMusicianAvatarSrc(null);
          return;
        }
        const data = await res.json();
        const fileData = data.fileData;
        const fileExt = data.fileExtension;
        if (!fileData) {
          setMusicianAvatarSrc(null);
          return;
        }
        setMusicianAvatarSrc(`data:image/${fileExt};base64,${fileData}`);
      } catch {
        setMusicianAvatarSrc(null);
      }
    })();
  }, [musician?.profilePictureFileId]);

  // load top songs
  useEffect(() => {
    if (!profileUserId) return;

    (async () => {
      try {
        const res = await fetch(`${API}/api/history/top-songs?limit=5`, {
          headers: {
            "X-UserId": String(profileUserId),
          },
        });
        if (!res.ok) {
          setTopSongs([]);
          return;
        }
        const data = await res.json();
        const items = Array.isArray(data.items) ? data.items : [];
        setTopSongs(items);
      } catch {
        setTopSongs([]);
      }
    })();
  }, [profileUserId]);

  const shareUrl = `${window.location.origin}/user/${profileUserId}`;

  function onShare() {
    navigator.share?.({
      title: user?.username ?? "User",
      url: shareUrl,
    }) || navigator.clipboard?.writeText(shareUrl);
  }

  function onReport() {
    location.href = `/report?type=USER&id=${profileUserId}`;
  }

  function goToConnections() {
    navigate(`/follows/${profileUserId}`);
  }

  async function handleFollowClick() {
    if (!canFollow) return;
    await followAct();
    await loadCounts();
  }

  function handlePlaySong(song) {
    if (!setPlaybarState) return;
    const songId = song.songId;
    const albumId = song.albumId ?? null;

    setPlaybarState({
      songId,
      albumId,
      playlistId: null,
      visible: true,
    });
  }

  function goToPlaylists() {
    navigate(`/user-playlists/${profileUserId}`);
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
            <>
              {/* Top header */}
              <div className={styles.header}>
                <div className={styles.kebabSlot}>
                  <KebabMenu onShare={onShare} onReport={onReport} />
                </div>

                {userAvatarSrc ? (
                  <img src={userAvatarSrc} alt="User" className={styles.pic} />
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
                          alt={musician.musicianName}
                          className={styles.musicianPic}
                        />
                      ) : (
                        <div className={styles.musicianPic} />
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

              {/*Playlists */}
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
