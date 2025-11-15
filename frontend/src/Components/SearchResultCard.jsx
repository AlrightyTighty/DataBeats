import { useNavigate } from "react-router";
import styles from "./SearchResultCard.module.css";

const typeUrls = {
  user: "user",
  artist: "artist",
  album: "album",
  playlist: "playlist",
  event: "event",
  song: "songinfo",
};

export default function SearchResultCard({ image, title, subtitle, type, id }) {
  const imageClassName =
    type === "artist" || type === "user"
      ? `${styles.image} ${styles.imageCircle}`
      : `${styles.image} ${styles.imageSquare}`;

  const navigate = useNavigate();

  const whenClicked = () => {
    navigate(`/${typeUrls[type]}/${id}`);
    return;
  };

  return (
    <div onClick={whenClicked} className={styles.card}>
      <img
        src={`data:image/png;base64,${image}`}
        alt={title}
        className={imageClassName}
      />
      <div className={styles.textContainer}>
        <div className={styles.title}>{title}</div>
        {subtitle && <div className={styles.subtitle}>{subtitle}</div>}
      </div>
    </div>
  );
}
