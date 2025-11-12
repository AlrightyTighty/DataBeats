import styles from "./ProfileHeader.module.css";
import KebabMenu from "./KebabMenu";
import useFollow from "../../hooks/useFollow";

export default function ProfileHeaderUserVisitor({ profile, viewerId }) {
  const { label, act, loading, status } = useFollow({
    variant: "user",
    viewerId,
    targetId: profile.id,
    initialStatus: profile.myFollowStatus || "none"
  });

  const url = `${window.location.origin}/user/${profile.id}`;
  const share = () => navigator.share?.({ title: `Check out ${profile.displayName || profile.username}`, url }) || navigator.clipboard?.writeText(url);

  return (
    <div className={styles.profileCard}>
      <img className={styles.avatar} src={profile.imageUrl} alt="" />
      <div className={styles.main}>
        <div className={styles.name}>{profile.displayName || profile.username}</div>
        <div className={styles.counts}>
          <span>Following: {profile.followingCount ?? 0}</span>
          <span>Followers: {profile.followerCount ?? 0}</span>
        </div>
        {status === "pending" && <div className={styles.subtle}>Follow request sent</div>}
      </div>
      <div className={styles.actions}>
        <KebabMenu
          onShare={share}
          followLabel={loading ? "..." : label}
          onFollowAction={act}
          onReport={() => (location.href = `/report?type=user&id=${profile.id}`)}
        />
      </div>
    </div>
  );
}
