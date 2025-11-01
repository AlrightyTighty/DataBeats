import { useEffect, useState } from "react";
import { useParams, Link } from "react-router";
import Topnav from "../Components/Topnav";
import styles from "./ArtistProfileUser.module.css";

const API = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:5062";
const CURRENT_USER_ID = 1;

export default function ArtistProfileUser() {
  const { id } = useParams();
  const [artist, setArtist] = useState(null);
  const [albums, setAlbums] = useState([]);
  const [songs, setSongs] = useState([]);
  const [isFriend, setIsFriend] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const artistRes = await fetch(`${API}/api/musician/${id}`);
        if (artistRes.ok) setArtist(await artistRes.json());

        const albumRes = await fetch(`${API}/api/album/artist/${id}`);
        if (albumRes.ok) setAlbums(await albumRes.json());

        const songRes = await fetch(`${API}/api/song/artist/${id}`);
        if (songRes.ok) setSongs(await songRes.json());

        const friendRes = await fetch(`${API}/api/friend/friends/${CURRENT_USER_ID}`);
        if (friendRes.ok) {
          const data = await friendRes.json();
          const friendIds = data.map((f) => f.friendId);
          setIsFriend(friendIds.includes(Number(id)));
        }
      } catch (err) {
        console.error("Error loading artist profile:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  async function handleFriendToggle() {
    if (isFriend) {
      await fetch(`${API}/api/friend/${CURRENT_USER_ID}/${id}`, { method: "DELETE" });
      setIsFriend(false);
    } else {
      await fetch(`${API}/api/friend`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          frienderId: CURRENT_USER_ID,
          friendeeId: Number(id),
        }),
      });
      setIsFriend(true);
    }
  }

  if (loading) {
    return (
      <>
        <Topnav />
        <div className={styles.page}>
          <p style={{ textAlign: "center", color: "#fff" }}>Loading artist...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Topnav />
      <div className={styles.page}>
        <div className={styles.container}>
          <div className={styles.header}>
            {artist?.profilePic ? <img src={`${API}/api/musician/file/view/${artist.profilePic}`} alt="Artist" className={styles.pic} /> : <div className={styles.pic} />}

            <div className={styles.info}>
              <h1>{artist?.musicianName || "Artist Name"}</h1>
              <p>{artist?.bio || "No bio available"}</p>
              <div className={styles.stats}>
                <span>{artist?.followerCount ?? 0} Followers</span>
                <span>{artist?.monthlyListeners ?? 0} Monthly Listeners</span>
              </div>
              <div className={styles.buttons}>
                <button onClick={handleFriendToggle} className={isFriend ? styles.unfollow : styles.follow}>
                  {isFriend ? "Remove Friend" : "Add Friend"}
                </button>
                <a href={`/followers/${artist?.userId || 0}`}>View Friends</a>
              </div>
            </div>
          </div>

          <div className={styles.middle}>
            <div className={styles.box}>
              <h2>Top Songs</h2>
              {songs.length === 0 ? (
                <p>No songs available.</p>
              ) : (
                songs.map((s) => (
                  <div key={s.songId} className={styles.song}>
                    <span>{s.songName}</span>
                    <button onClick={() => (window.location.href = `/stream/${s.songId}`)}>▶</button>
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
                  <a key={a.albumId} href={`/album/${a.albumId}`} className={styles.album}>
                    {a.albumOrSongArtFileId ? <img src={`${API}/api/file/view/${a.albumOrSongArtFileId}`} alt={a.albumTitle} className={styles.cover} /> : <div className={styles.cover} />}
                    <div>
                      <h3>{a.albumTitle}</h3>
                      <p>{a.releaseDate ? new Date(a.releaseDate).getFullYear() : ""}</p>
                    </div>
                  </a>
                ))
              )}
            </div>
          </div>

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
