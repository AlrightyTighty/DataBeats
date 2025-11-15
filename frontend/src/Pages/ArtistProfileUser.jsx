import { useEffect, useMemo, useState, useCallback } from "react";
import { useParams, Link } from "react-router";
import Topnav from "../Components/Topnav";
import styles from "./ArtistProfileUser.module.css";

import API from "../lib/api.js";
import useMe from "../Components/UseMe.js";
import useFollow from "../hooks/useFollow.js";
import KebabMenu from "../Components/Profile/KebabMenu.jsx";
import verifiedBadge from "../assets/graphics/musician_verification.png";

export default function ArtistProfileUser() {
  const { id } = useParams();
  const musicianId = useMemo(() => Number(id), [id]);

  const { me } = useMe({ redirectIfMissing: true });
  const viewerId = useMemo(() => me?.userId ?? me?.UserId ?? null, [me]);

  const [artist, setArtist] = useState(null);
  const [albums, setAlbums] = useState([]);
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);

  const {
    isFollowing,
    label: followLabel,
    act: followAct,
    loading: followLoading,
    canFollow,
  } = useFollow({
    viewerId,
    targetId: artist?.userId ?? null, // follow the artist's UserId
    apiBase: API,
  });

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

      // albums by this musician
      const albumRes = await fetch(
        `${API}/api/album/by-musician/${musicianId}`,
        { credentials: "include" }
      );
      if (albumRes.ok) {
        const data = await albumRes.json();
        setAlbums(Array.isArray(data) ? data : []);
      }

      // songs by this artist
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

  const avatarSrc =
    artist.profilePic || artist.profilePictureFileId
      ? `${API}/api/musician/file/view/${
          artist.profilePic ?? artist.profilePictureFileId
        }`
      : null;

  const shareUrl = `${window.location.origin}/artist-user/${musicianId}`;
  function onShare() {
    navigator.share?.({
      title: artist.musicianName ?? "Artist",
      url: shareUrl,
    }) || navigator.clipboard?.writeText(shareUrl);
  }

  function onReport() {
    location.href = `/report?type=artist&id=${musicianId}`;
  }

  async function handleFollowClick() {
    if (!canFollow || !artist) return;

    const wasFollowing = isFollowing;
    await followAct();

    // update followerCount
    setArtist((prev) => {
      if (!prev) return prev;
      const current = prev.followerCount ?? 0;
      const delta = wasFollowing ? -1 : 1;
      return {
        ...prev,
        followerCount: Math.max(0, current + delta),
      };
    });
  }

  const showFollowButton =
    canFollow && viewerId && artist && viewerId !== artist.userId;

  return (
    <>
      <Topnav />
      <div className={styles.page}>
        <div className={styles.container}>
          <div className={styles.header}>
            {/* kebab in top-right corner */}
            <div className={styles.kebabSlot}>
              <KebabMenu onShare={onShare} onReport={onReport} />
            </div>

            {/* avatar */}
            {avatarSrc ? (
              <img src={avatarSrc} alt="Artist" className={styles.pic} />
            ) : (
              <div className={styles.pic} />
            )}

            {/* text + follow button */}
            <div className={styles.info}>
              <h1 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                @{artist.musicianName || "Artist Name"}
                {artist.isVerified && (
                  <img 
                    src={verifiedBadge} 
                    alt="Verified" 
                    style={{ width: '55px', height: '55px' }} 
                  />
                )}
              </h1>
              <p>{artist.bio || "No bio available."}</p>

              <div className={styles.stats}>
                <span>{artist.followerCount ?? 0} Followers</span>
                <span>
                  {artist.monthlyListenerCount ?? 0} Monthly Listeners
                </span>
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

          {/* Middle: top songs + albums */}
          <div className={styles.middle}>
            <div className={styles.box}>
              <h2>Top Songs</h2>
              {songs.length === 0 ? (
                <p>No songs available.</p>
              ) : (
                songs.map((s) => (
                  <div key={s.songId} className={styles.song}>
                    <span>{s.songName}</span>
                    <button
                      onClick={() =>
                        (window.location.href = `/stream/${s.songId}`)
                      }
                    >
                      ▶
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className={styles.box}>
              <h2>Albums</h2>
              {albums.length === 0 ? (
                <p>No albums yet.</p>
              ) : (
                albums.map((a) => (
                  <a
                    key={a.albumId}
                    href={`/album/${a.albumId}`}
                    className={styles.album}
                  >
                    {a.albumOrSongArtFileId ? (
                      <img
                        src={`${API}/api/file/view/${a.albumOrSongArtFileId}`}
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

          {/*artist events */}
          <div className={styles.bottom}>
            <Link to={`/artist-events/${id}`} className={styles.viewEvents}>
              View All Events
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
