import { AlbumSongListing } from "../Components/AlbumSongListing.jsx";
import styles from "./Album.module.css";
import API from "../lib/api.js";
import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router";
import Topnav from "../Components/Topnav.jsx";
import { toggleLike, getLikeStatuses } from "../lib/likesApi.js";
import { usePlaybar } from "../contexts/PlaybarContext.jsx";
import useAuthentication from "../hooks/useAuthentication";

const Album = () => {
  const { setPlaybarState } = usePlaybar();
  const navigate = useNavigate();
  const user = useAuthentication();

  const formatArtists = (artists) => {
    return artists.map((artist) => artist.artistName).join(", ");
  };

  const formatDuration = (timeString) => {
    if (!timeString) return "0:00";
    const parts = timeString.split(":");
    if (parts.length < 2) return "0:00";

    const hours = parseInt(parts[0], 10);
    const minutes = parseInt(parts[1], 10);
    const seconds = parseInt(parts[2]?.split(".")[0] || "0", 10);

    if (hours > 0) {
      return `${hours} hr ${minutes} min`;
    }
    return `${minutes} min ${seconds} sec`;
  };

  const getYear = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).getFullYear();
  };

  const [albumData, setAlbumData] = useState({
    title: null,
    artists: [],
    type: null,
    description: null,
    coverImage: null,
    songs: [],
    createdBy: null,
  });

  const [likes, setLikes] = useState({}); // { songId: true/false }

  const isLoading = useRef(false);

  const id = useParams().id;

  useEffect(() => {
    if (isLoading.current) return;

    isLoading.current = true;
    (async () => {
      const albumInfoResponse = await fetch(
        `${API}/api/album/${id}?includeImageData=true`
      );
      const albumInfo = await albumInfoResponse.json();

      const songInfoResponse = await fetch(`${API}/api/album/songs/${id}`);
      const songInfo = await songInfoResponse.json();

      albumInfo.songs = songInfo;
      console.log(albumInfo);
      setAlbumData(albumInfo);

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
            <img
              src={`data:image/png;base64,${albumData.albumArtImage}`}
              alt={albumData.albumTitle}
              className={styles.coverImage}
            />
          </div>

          <div className={styles.albumInfo}>
            <div className={styles.albumType}>{albumData.albumType}</div>
            <h1 className={styles.albumTitle}>{albumData.albumTitle}</h1>
            <div className={styles.albumArtists}>
              {formatArtists(albumData.artists)}
            </div>
            <div className={styles.albumMetadata}>
              {albumData.releaseDate && (
                <span>{getYear(albumData.releaseDate)}</span>
              )}
              {albumData.numSongs !== undefined && (
                <>
                  <span className={styles.metadataDot}>•</span>
                  <span>{albumData.numSongs} {albumData.numSongs === 1 ? 'song' : 'songs'}</span>
                </>
              )}
              {albumData.duration && (
                <>
                  <span className={styles.metadataDot}>•</span>
                  <span>{formatDuration(albumData.duration)}</span>
                </>
              )}
            </div>
            {user && user.musicianId === albumData.createdBy && (
              <button
                className={styles.editButton}
                onClick={() => navigate(`/editalbum/${id}`)}
              >
                Edit Album
              </button>
            )}
          </div>
        </div>

        <div className={styles.songsList}>
          <div className={styles.songsHeader}>
            <div className={styles.headerLike}></div> {/* heart column */}
            <div className={styles.headerNumber}>#</div>
            <div className={styles.headerTitle}>Title</div>
            <div className={styles.headerArtists}>Artists</div>
            <div className={styles.headerGenre}>Genre</div>
            <div className={styles.headerDuration}>Duration</div>
            <div className={styles.headerStreams}>Streams</div>
            <div className={styles.headerReport}></div> {/* report column */}
          </div>

          {albumData.songs.map((song, index) => (
            <AlbumSongListing
              setPlaybarState={setPlaybarState}
              songs={albumData.songs}
              key={song.songId}
              number={index + 1}
              name={song.songName}
              artists={song.artistNames}
              genres={song.genres}
              duration={song.duration}
              streams={song.streams}
              id={song.songId}
              albumId={id}
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
