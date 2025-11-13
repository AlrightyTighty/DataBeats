import styles from "./ProfileHeader.module.css";
import KebabMenu from "./KebabMenu";
import useFollow from "../../hooks/useFollow";

const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:5062";

export default function ProfileHeaderArtistVisitor({ artist, viewerId }) {
  const { label, act, loading } = useFollow({
    variant: "artist",
    viewerId,
    targetId: artist.id,
    initialStatus: artist.isFollowed ? "following" : "none",
    apiBase: API,
  });

  const url = `${window.location.origin}/artist/${artist.id}`;

  function handleShare() {
    const title = `Listen to ${artist.name}`;
    if (navigator.share) {
      navigator.share({ title, url });
    } else {
      navigator.clipboard?.writeText(url);
    }
  }

  function handleReport() {
    location.href = `/report?type=artist&id=${artist.id}`;
  }

  return (
    <div className={styles.profileCard}>
      <img className={styles.avatar} src={artist.imageUrl} alt="" />

      <div className={styles.main}>
        <div className={styles.row}>
          <div className={styles.name}>{artist.name}</div>
        </div>

        <div className={styles.counts}>
          <span>Followers: {artist.followerCount ?? 0}</span>
          <span>Monthly listeners: {artist.monthlyListeners ?? 0}</span>
        </div>
      </div>

      <div className={styles.actions}>
        <button
          type="button"
          className={styles.chip}
          onClick={act}
          disabled={loading}
        >
          {loading ? "..." : label /*Follow / Unfollow */}
        </button>

        <KebabMenu onShare={handleShare} onReport={handleReport} />
      </div>
    </div>
  );
}
