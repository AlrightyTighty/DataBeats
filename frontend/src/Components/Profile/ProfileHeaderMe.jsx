import { useState, useMemo } from "react";
import styles from "./ProfileHeader.module.css";

export default function ProfileHeaderMe({ me }) {
  const [copied, setCopied] = useState(false);

  const userId = me.userId ?? me.id;
  const shareUrl = useMemo(() => `${window.location.origin}/user/${userId}`, [userId]);

  async function share() {
    try {
      if (navigator.share) {
        await navigator.share({ title: "My DataBeats profile", url: shareUrl });
      } else {
        await navigator.clipboard?.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 1200);
      }
    } catch {
    }
  }

  return (
    <div className={styles.profileCard}>
      <img
        className={styles.avatar}
        src={me.imageUrl || `/api/images/profile-picture/${me.profilePictureFileId ?? ""}`}
        alt=""
      />

      <div className={styles.main}>
        <div className={styles.name}>{me.displayName || me.username}</div>
        <div className={styles.counts}>
          <a className={styles.countLink} href={`/following/${userId}`}>Following: {me.followingCount ?? 0}</a>
          <a className={styles.countLink} href={`/followers/${userId}`}>Followers: {me.followerCount ?? 0}</a>
        </div>
      </div>

      <div className={styles.actions}>
        <a className={styles.chip} href="/settings">Edit Profile</a>
        <button className={styles.chip} onClick={share} aria-label="Share my profile">Share</button>
      </div>

      {copied && <div className={styles.toast}>Link copied</div>}
    </div>
  );
}
