import styles from "./SearchResultCard.module.css";

export default function SearchResultCard({ image, title, subtitle, type }) {
  const imageClassName = type === "artist" || type === "user" ? `${styles.image} ${styles.imageCircle}` : `${styles.image} ${styles.imageSquare}`;

  return (
    <div className={styles.card}>
      <img src={`data:image/png;base64,${image}`} alt={title} className={imageClassName} />
      <div className={styles.textContainer}>
        <div className={styles.title}>{title}</div>
        {subtitle && <div className={styles.subtitle}>{subtitle}</div>}
      </div>
    </div>
  );
}
