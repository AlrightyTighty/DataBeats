import { useEffect, useMemo, useState, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router";
import Topnav from "../Components/Topnav";
import styles from "./ArtistProfileUser.module.css";
import API from "../lib/api.js";
import useMe from "../Components/UseMe.js";
import useFollow from "../hooks/useFollow.js";
import KebabMenu from "../Components/Profile/KebabMenu.jsx";
import verifiedBadge from "../assets/graphics/musician_verification.png";

export default function ArtistProfileUser({ setPlaybarState }) {
  const { id } = useParams();
  const navigate = useNavigate();

  const musicianId = useMemo(() => Number(id), [id]);
  const { me, loading: authLoading } = useMe();
  const viewerId = useMemo(() => me?.userId ?? null, [me]);

  useEffect(() => {
    if (!authLoading && !me) {
      navigate("/login");
    }
  }, [authLoading, me, navigate]);

  const [artist, setArtist] = useState(null);
  const [albums, setAlbums] = useState([]);
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [avatarSrc, setAvatarSrc] = useState(null);
  const [followerCount, setFollowerCount] = useState(0);

  const {
    isFollowing,
    label: followLabel,
    act: followAct,
    loading: followLoading,
    canFollow,
  } = useFollow({
    viewerId,
    targetId: artist?.userId ?? null,
    apiBase: API,
  });

  const loadFollowerCount = useCallback(async () => {
    if (!artist?.userId) return;
    try {
      const followersRes = await fetch(
        `${API}/api/follow/followers/${artist.userId}`,
        {
          credentials: "include",
        }
      );
      if (followersRes.ok) {
        const followers = await followersRes.json();
        setFollowerCount(Array.isArray(followers) ? followers.length : 0);
      } else {
        setFollowerCount(0);
      }
    } catch {
      setFollowerCount(0);
    }
  }, [artist?.userId]);

  const reloadArtist = useCallback(async () => {
    if (!musicianId) return;
    try {
      setLoading(true);

      const artistRes = await fetch(`${API}/api/musician/${musicianId}`, {
        credentials: "include",
      });
      if (artistRes.ok) {
        const a = await artistRes.json();
        console.log("Artist data received:", a);
        console.log("IsVerified:", a.isVerified);
        setArtist(a);
      }

      const albumRes = await fetch(
        `${API}/api/album/by-musician/${musicianId}`,
        { credentials: "include" }
      );
      if (albumRes.ok) {
        const data = await albumRes.json();
        setAlbums(Array.isArray(data) ? data : []);
      }

      const songRes = await fetch(`${API}/api/song/artist/${musicianId}`, {
        credentials: "include",
      });
      if (songRes.ok) {
        const data = await songRes.json();
        setSongs(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error("Error loading artist profile:", err);
    } finally {
      setLoading(false);
    }
  }, [musicianId]);

  useEffect(() => {
    reloadArtist();
  }, [reloadArtist]);

  useEffect(() => {
    loadFollowerCount();
  }, [loadFollowerCount]);

  useEffect(() => {
    if (!artist?.profilePictureFileId) {
      setAvatarSrc(null);
      return;
    }

    (async () => {
      try {
        const res = await fetch(
          `${API}/api/images/profile-picture/${artist.profilePictureFileId}`
        );
        if (!res.ok) {
          console.warn("Failed to load profile picture DTO");
          setAvatarSrc(null);
          return;
        }

        const data = await res.json();
        const fileData = data.fileData;
        const fileExt = data.fileExtension;

        if (!fileData) {
          setAvatarSrc(null);
          return;
        }

        setAvatarSrc(`data:image/${fileExt};base64,${fileData}`);
      } catch (err) {
        console.error("Error loading profile picture:", err);
        setAvatarSrc(null);
      }
    })();
  }, [artist?.profilePictureFileId]);

  if (loading) {
    return (
      <>
        <Topnav />
        <div className={styles.page}>
          <p style={{ textAlign: "center", color: "#fff" }}>
            Loading artist...
          </p>
        </div>
      </>
    );
  }

  if (!artist) {
    return (
      <>
        <Topnav />
        <div className={styles.page}>
          <p style={{ textAlign: "center", color: "#fff" }}>
            Artist not found.
          </p>
        </div>
      </>
    );
  }

  const shareUrl = `${window.location.origin}/artist/${musicianId}`;

  function onShare() {
    navigator.share?.({
      title: artist.musicianName ?? "Artist",
      url: shareUrl,
    }) || navigator.clipboard?.writeText(shareUrl);
  }

  function onReport() {
    location.href = `/report?type=MUSICIAN&id=${musicianId}`;
  }

  async function handleFollowClick() {
    if (!canFollow || !artist) return;
    await followAct();
    await loadFollowerCount();
  }

  function handlePlaySong(song) {
    if (!setPlaybarState) return;
    setPlaybarState({
      songId: song.songId,
      albumId: song.albumId ?? null,
      playlistId: null,
      visible: true,
    });
  }

  const showFollowButton =
    canFollow && viewerId && artist && viewerId !== artist.userId;

  const topSongs = [...songs]
    .sort((a, b) => (b.streams ?? 0) - (a.streams ?? 0))
    .slice(0, 10);

  return (
    <>
      <Topnav />
      <div className={styles.page}>
        <div className={styles.container}>
          <div className={styles.header}>
            <div className={styles.kebabSlot}>
              <KebabMenu onShare={onShare} onReport={onReport} />
            </div>

            {avatarSrc ? (
              <img src={avatarSrc} alt="Artist" className={styles.pic} />
            ) : (
              <div className={styles.pic} />
            )}

            <div className={styles.info}>
              <h1 style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                @{artist.musicianName || "Artist Name"}
                {artist.isVerified && (
                  <img
                    src={verifiedBadge}
                    alt="Verified"
                    style={{ width: "55px", height: "55px" }}
                  />
                )}
              </h1>
              <p>{artist.bio || "No bio available."}</p>

              <div className={styles.stats}>
                <span>{followerCount} Followers</span>
                <span>
                  {artist.monthlyListenerCount ?? 0} Monthly Listeners
                </span>
              </div>

              <div className={styles.buttons}>
                {artist.userId && (
                  <Link
                    to={`/user/${artist.userId}`}
                    className={styles.secondaryButton}
                  >
                    View User Profile
                  </Link>
                )}

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

          <div className={styles.middle}>
            <div className={styles.box}>
              <div className={styles.boxHeader}>
                <h2>Top Songs</h2>
              </div>

              {topSongs.length === 0 ? (
                <p>No songs available.</p>
              ) : (
                <div className={styles.songList}>
                  {topSongs.map((s, idx) => {
                    const songId = s.songId ?? idx;
                    const title = s.songName ?? "Untitled";

                    const artistName = artist.musicianName ?? "Unknown";

                    const albumTitle = s.albumTitle ?? "";

                    return (
                      <div key={songId} className={styles.songRow}>
                        <div className={styles.songInfo}>
                          <span className={styles.songIndex}>{idx + 1}.</span>
                          <div>
                            <div className={styles.songTitle}>{title}</div>
                            <div className={styles.songMeta}>
                              {artistName}
                              {albumTitle ? ` • ${albumTitle}` : ""}
                            </div>
                          </div>
                        </div>

                        <div className={styles.songRight}>
                          <span className={styles.songStreams}>
                            {s.streams?.toLocaleString() ?? 0} plays
                          </span>
                          <button
                            type="button"
                            className={styles.playButton}
                            onClick={() => handlePlaySong(s)}
                          >
                            ▶
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className={styles.box}>
              <div className={styles.boxHeader}>
                <h2>Albums</h2>
                <Link
                  to={`/artist-albums/${musicianId}`}
                  className={styles.viewAll}
                >
                  View all
                </Link>
              </div>
              {albums.length === 0 ? (
                <p>No albums yet.</p>
              ) : (
                albums.slice(0, 5).map((a) => (
                  <a
                    key={a.albumId}
                    href={`/album/${a.albumId}`}
                    className={styles.album}
                  >
                    {a.albumArtImage ? (
                      <img
                        src={`data:image/png;base64,${a.albumArtImage}`}
                        alt={a.albumTitle}
                        className={styles.cover}
                      />
                    ) : a.albumOrSongArtFileId ? (
                      <img
                        src={`${API}/api/art/view/${a.albumOrSongArtFileId}`}
                        alt={a.albumTitle}
                        className={styles.cover}
                      />
                    ) : (
                      <div className={styles.cover} />
                    )}
                    <div>
                      <h3>{a.albumTitle}</h3>
                      <p>
                        {a.releaseDate
                          ? new Date(a.releaseDate).getFullYear()
                          : ""}
                      </p>
                    </div>
                  </a>
                ))
              )}
            </div>
          </div>

          <div className={styles.bottom}>
            <Link to={`/artist-events/${id}`} className={styles.viewEvents}>
              View Artist's Events
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
