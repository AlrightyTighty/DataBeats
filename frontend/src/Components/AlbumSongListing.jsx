import { useNavigate } from "react-router";
import styles from "./AlbumSongListing.module.css";
import ReportButton from "./ReportButton.jsx";

export const AlbumSongListing = ({ songs, number, name, artists, streams, duration, genres, id, setPlaybarState, isLiked, onToggleLike }) => {
  const navigate = useNavigate();

  const formatStreams = (count) => {
    if (count >= 1000000) {
      return (count / 1000000).toFixed(1) + "M";
    } else if (count >= 1000) {
      return (count / 1000).toFixed(1) + "K";
    }
    return count.toString();
  };

  const formatArtists = (artistList) => {
    return artistList.join(", ");
  };

  const formatDuration = (timeString) => {
    if (!timeString) return "0:00";
    // TimeOnly comes as "HH:MM:SS" or "HH:MM:SS.mmm"
    const parts = timeString.split(":");
    if (parts.length < 2) return "0:00";

    const hours = parseInt(parts[0], 10);
    const minutes = parseInt(parts[1], 10);
    const seconds = parseInt(parts[2]?.split(".")[0] || "0", 10);

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const formatGenres = (genreList) => {
    if (!genreList || genreList.length === 0) return "-";
    return genreList.join(", ");
  };

  const handleRowClick = () => {
    setPlaybarState({
      songId: id,
      songList: songs,
      visible: true,
    });
  };

  const handleHeartClick = async (e) => {
    e.stopPropagation();
    await onToggleLike(id);
  };

  return (
    <div onClick={handleRowClick} className={styles.songItem}>
      <button type="button" className={`${styles.songLike} ${isLiked ? styles.songLikeActive : ""}`} onClick={handleHeartClick} aria-label={isLiked ? "Unlike song" : "Like song"}>
        {isLiked ? "♥" : "♡"}
      </button>

      <div className={styles.songNumber}>{number}</div>
      <div className={styles.songName}>{name}</div>
      <div className={styles.songArtists}>{formatArtists(artists)}</div>
      <div className={styles.songGenres}>{formatGenres(genres)}</div>
      <div className={styles.songDuration}>{formatDuration(duration)}</div>
      <div className={styles.songStreams}>{formatStreams(streams)}</div>

      <div className={styles.reportButtonContainer}>
        <ReportButton contentId={id} reportType={"SONG"} />
      </div>
    </div>
  );
};
