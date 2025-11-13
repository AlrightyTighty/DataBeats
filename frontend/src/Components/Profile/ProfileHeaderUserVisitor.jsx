import styles from "./ProfileHeader.module.css";
import KebabMenu from "./KebabMenu";
import useFollow from "../../hooks/useFollow";

const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:5062";

export default function ProfileHeaderUserVisitor({ profile, viewerId }) {
  const targetId = profile.id ?? profile.userId;

  const { label, act, loading } = useFollow({
    variant: "user",
    viewerId,
    targetId,
    initialStatus: profile.myFollowStatus || "none",
    apiBase: API,
  });

  const url = `${window.location.origin}/user/${targetId}`;
  const displayName = profile.displayName || profile.username || "Profile";

  function handleShare() {
    if (navigator.share) {
      navigator.share({ title: `Check out ${displayName}`, url });
    } else {
      navigator.clipboard?.writeText(url);
    }
  }

  function handleReport() {
    location.href = `/report?type=user&id=${targetId}`;
  }

  const avatarSrc =
    profile.imageUrl ||
    (profile.profilePictureFileId != null
      ? `/api/images/profile-picture/${profile.profilePictureFileId}`
      : "");

  return (
    <div className={styles.profileCard}>
      <img className={styles.avatar} src={avatarSrc} alt="" />

      <div className={styles.main}>
        <div className={styles.row}>
          <div className={styles.name}>{displayName}</div>
        </div>

        <div className={styles.counts}>
          <span>Following: {profile.followingCount ?? 0}</span>
          <span>Followers: {profile.followerCount ?? 0}</span>
        </div>
      </div>

      <div className={styles.actions}>
        {/* Follow / Unfollow */}
        <button
          type="button"
          className={styles.chip}
          onClick={act}
          disabled={loading || !viewerId || viewerId === targetId}
        >
          {loading ? "..." : label}
        </button>

        <KebabMenu onShare={handleShare} onReport={handleReport} />
      </div>
    </div>
  );
}
