import { useNavigate } from "react-router";
import styles from "./AlbumSongListing.module.css";

export const AlbumSongListing = ({ number, name, artists, streams, id }) => {
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

  return (
    <div onClick={() => navigate(`/Stream/${id}`)} className={styles.songItem}>
      <div className={styles.songNumber}>{number}</div>
      <div className={styles.songName}>{name}</div>
      <div className={styles.songArtists}>{formatArtists(artists)}</div>
      <div className={styles.songStreams}>{formatStreams(streams)}</div>
    </div>
  );
};
