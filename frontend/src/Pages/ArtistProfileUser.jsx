import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router";
import Topnav from "../Components/Topnav";
import styles from "./ArtistProfileUser.module.css";

import API from "../lib/api.js";
import useMe from "../Components/UseMe.js";
import useFollow from "../hooks/useFollow.js";
import KebabMenu from "../Components/Profile/KebabMenu.jsx";

export default function ArtistProfileUser() {
  const { id } = useParams(); // musicianId from route
  const musicianId = useMemo(() => Number(id), [id]);

  const { me } = useMe({ redirectIfMissing: true });

  const [artist, setArtist] = useState(null);
  const [albums, setAlbums] = useState([]);
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);

  // follow hook for ARTIST
  const {
    label: followLabel,
    act: followAct,
    loading: followLoading,
  } = useFollow({
    variant: "artist",
    viewerId: me?.userId,
    targetId: musicianId,
    initialStatus: "none",
    apiBase: API,
  });

  useEffect(() => {
    if (!musicianId) return;

    (async () => {
      try {
        setLoading(true);

        // artist info
        const artistRes = await fetch(`${API}/api/musician/${musicianId}`);
        if (artistRes.ok) {
          const a = await artistRes.json();
          setArtist(a);
        }

        // albums by this musician (matches AlbumController: by-musician/{musicianId})
        const albumRes = await fetch(
          `${API}/api/album/by-musician/${musicianId}`
        );
        if (albumRes.ok) {
          const data = await albumRes.json();
          setAlbums(Array.isArray(data) ? data : []);
        }

        // songs by this artist (your existing route)
        const songRes = await fetch(`${API}/api/song/artist/${musicianId}`);
        if (songRes.ok) {
          const data = await songRes.json();
          setSongs(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error("Error loading artist profile:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [musicianId]);

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

  return (
    <>
      <Topnav />
      <div className={styles.page}>
        <div className={styles.container}>
          {/* Header block similar style */}
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
              <h1>{artist.musicianName || "Artist Name"}</h1>
              <p>{artist.bio || "No bio available."}</p>

              <div className={styles.stats}>
                <span>{artist.followerCount ?? 0} Followers</span>
                <span>
                  {artist.monthlyListenerCount ?? 0} Monthly Listeners
                </span>
              </div>

              <div className={styles.buttons}>
                {me && me.userId !== artist.userId && (
                  <button
                    onClick={followAct}
                    className={
                      followLabel === "Unfollow"
                        ? styles.unfollow
                        : styles.follow
                    }
                    disabled={followLoading}
                  >
                    {followLoading ? "..." : followLabel}
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

          {/* Link to artist events */}
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
