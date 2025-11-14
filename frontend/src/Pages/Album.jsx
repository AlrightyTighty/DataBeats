import { AlbumSongListing } from "../Components/AlbumSongListing.jsx";
import styles from "./Album.module.css";
import API from "../lib/api.js";
import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router";
import Topnav from "../Components/Topnav.jsx";
import { toggleLike, getLikeStatuses } from "../lib/likesApi.js";

const albumData = {
  title: "Midnight Echoes",
  artists: ["Luna Rivera", "The Midnight Collective"],
  type: "LP",
  description: "A mesmerizing journey through ambient soundscapes and ethereal melodies. This album explores themes of solitude, reflection, and the beauty found in darkness.",
  coverImage: "https://images.unsplash.com/photo-1612057345557-26de85152c58?w=800&q=80",
  songs: [
    {
      id: 1,
      name: "Nocturnal Whispers",
      artists: ["Luna Rivera"],
      streams: 2847392,
    },
    {
      id: 2,
      name: "Dancing in Shadows",
      artists: ["Luna Rivera", "The Midnight Collective"],
      streams: 4521876,
    },
    {
      id: 3,
      name: "Velvet Dreams",
      artists: ["Luna Rivera", "Echo Smith"],
      streams: 3294817,
    },
    {
      id: 4,
      name: "Starlit Memories",
      artists: ["Luna Rivera"],
      streams: 5839274,
    },
    {
      id: 5,
      name: "Silent Reflections",
      artists: ["The Midnight Collective"],
      streams: 1923847,
    },
    {
      id: 6,
      name: "Ethereal Nights",
      artists: ["Luna Rivera", "The Midnight Collective"],
      streams: 4192736,
    },
    {
      id: 7,
      name: "Moonlit Serenade",
      artists: ["Luna Rivera", "Aria Rose"],
      streams: 6482913,
    },
    {
      id: 8,
      name: "Echoes of Tomorrow",
      artists: ["Luna Rivera"],
      streams: 3764829,
    },
    {
      id: 9,
      name: "Midnight Waltz",
      artists: ["Luna Rivera", "The Midnight Collective", "Echo Smith"],
      streams: 5192847,
    },
    {
      id: 10,
      name: "Dawn's Embrace",
      artists: ["Luna Rivera"],
      streams: 7293847,
    },
  ],
};

const Album = ({ setPlaybarState }) => {
  const formatArtists = (artists) => {
    return artists.map((artist) => artist.artistName).join(", ");
  };

  const [albumData, setAlbumData] = useState({
    title: null,
    artists: [],
    type: null,
    description: null,
    coverImage: null,
    songs: [],
  });

  const [likes, setLikes] = useState({}); // { songId: true/false }

  const isLoading = useRef(false);

  const id = useParams().id;

  useEffect(() => {
    if (isLoading.current) return;

    isLoading.current = true;
    (async () => {
      const albumInfoResponse = await fetch(`${API}/api/album/${id}?includeImageData=true`);
      const albumInfo = await albumInfoResponse.json();

      const songInfoResponse = await fetch(`${API}/api/album/songs/${id}`);
      const songInfo = await songInfoResponse.json();

      albumInfo.songs = songInfo;
      console.log(albumInfo);
      setAlbumData(albumInfo);

      // Initialize like states for the songs on this album
      try {
        const songIds = (songInfo || []).map((s) => s.songId);
        const likedSet = await getLikeStatuses(songIds);
        const likesMap = {};
        songIds.forEach((sid) => {
          if (likedSet.has(sid)) likesMap[sid] = true;
        });
        setLikes(likesMap);
      } catch (e) {
        console.warn("Failed to fetch like statuses", e);
      }
    })();
  }, [id]);

  async function handleToggleLike(songId) {
    try {
      const { isLiked } = await toggleLike(songId);
      setLikes((prev) => ({
        ...prev,
        [songId]: isLiked,
      }));
    } catch (error) {
      console.error("Error toggling like:", error);
    }
  }

  return (
    <>
      <Topnav />
      <div className={styles.container}>
        <div className={styles.albumHeader}>
          <div className={styles.albumCover}>
            <img src={`data:image/png;base64,${albumData.albumArtImage}`} alt={albumData.albumTitle} className={styles.coverImage} />
          </div>

          <div className={styles.albumInfo}>
            <div className={styles.albumType}>{albumData.albumType}</div>
            <h1 className={styles.albumTitle}>{albumData.albumTitle}</h1>
            <div className={styles.albumArtists}>{formatArtists(albumData.artists)}</div>
          </div>
        </div>

        <div className={styles.songsList}>
          <div className={styles.songsHeader}>
            <div className={styles.headerLike}></div> {/* heart column */}
            <div className={styles.headerNumber}>#</div>
            <div className={styles.headerTitle}>Title</div>
            <div className={styles.headerArtists}>Artists</div>
            <div className={styles.headerStreams}>Streams</div>
            <div className={styles.headerReport}></div> {/* report column */}
          </div>

          {albumData.songs.map((song, index) => (
            <AlbumSongListing
              setPlaybarState={setPlaybarState}
              key={song.songId}
              number={index + 1}
              name={song.songName}
              artists={song.artistNames}
              streams={song.streams}
              id={song.songId}
              songs={albumData.songs.map((song) => song.songId)}
              isLiked={!!likes[song.songId]}
              onToggleLike={handleToggleLike}
            />
          ))}
        </div>
      </div>
    </>
  );
};

export default Album;
