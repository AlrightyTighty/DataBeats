import styles from "./ProfileHeader.module.css";
import KebabMenu from "./KebabMenu";
import useFollow from "../../hooks/useFollow";

export default function ProfileHeaderArtistVisitor({ artist, viewerId }) {
  const { label, act, loading } = useFollow({
    variant: "artist",
    viewerId,
    targetId: artist.id,
    initialStatus: artist.isFollowed ? "following" : "none"
  });

  const url = `${window.location.origin}/artist/${artist.id}`;
  const share = () => navigator.share?.({ title: `Listen to ${artist.name}`, url }) || navigator.clipboard?.writeText(url);

  return (
    <div className={styles.profileCard}>
      <img className={styles.avatar} src={artist.imageUrl} alt="" />
      <div className={styles.main}>
        <div className={styles.name}>{artist.name}</div>
        <div className={styles.counts}>
          <span>Followers: {artist.followerCount ?? 0}</span>
          <span>Monthly listeners: {artist.monthlyListeners ?? 0}</span>
        </div>
      </div>
      <div className={styles.actions}>
        <KebabMenu
          onShare={share}
          followLabel={loading ? "..." : label}
          onFollowAction={act}
          onReport={() => (location.href = `/report?type=artist&id=${artist.id}`)}
        />
      </div>
    </div>
  );
}