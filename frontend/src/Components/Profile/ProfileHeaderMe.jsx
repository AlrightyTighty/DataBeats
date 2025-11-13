import { useMemo, useState } from "react";
import styles from "./ProfileHeader.module.css";
import KebabMenu from "./KebabMenu";
import ProfileFollowModal from "./ProfileFollowModal.jsx";

export default function ProfileHeaderMe({ me }) {
  const [copied, setCopied] = useState(false);
  const [showFriends, setShowFriends] = useState(false);

  const userId = useMemo(() => me?.userId ?? me?.id ?? null, [me]);
  const username =
    me?.displayName || me?.username || (userId ? `user-${userId}` : "profile");

  const shareUrl = useMemo(
    () =>
      userId
        ? `${window.location.origin}/user/${userId}`
        : window.location.origin,
    [userId]
  );

  async function share() {
    try {
      if (navigator.share) {
        await navigator.share({ title: "My DataBeats profile", url: shareUrl });
      } else {
        await navigator.clipboard?.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 1200);
      }
    } catch {}
  }

  function openFriendsModal() {
    if (!userId) return;
    setShowFriends(true);
  }

  function closeFriendsModal() {
    setShowFriends(false);
  }

  const avatarSrc =
    me?.imageUrl ||
    (me?.profilePictureFileId != null
      ? `/api/images/profile-picture/${me.profilePictureFileId}`
      : "");

  return (
    <>
      <div className={styles.profileCard}>
        <img className={styles.avatar} src={avatarSrc} alt="" />

        <div className={styles.main}>
          <div className={styles.row}>
            <div className={styles.name}>{username}</div>
          </div>

          <div className={styles.counts}>
            <button
              type="button"
              className={styles.countLinkBtn}
              disabled={!userId}
              onClick={openFriendsModal}
            >
              Following: {me?.followingCount ?? 0}
            </button>

            <button
              type="button"
              className={styles.countLinkBtn}
              disabled={!userId}
              onClick={openFriendsModal}
            >
              Followers: {me?.followerCount ?? 0}
            </button>
          </div>
        </div>

        <div className={styles.actions}>
          {/*Follow button = open popup */}
          <button
            type="button"
            className={styles.chip}
            onClick={openFriendsModal}
            disabled={!userId}
          >
            Followers &amp; Following
          </button>

          <button
            type="button"
            className={styles.chip}
            onClick={() => (location.href = "/settings")}
          >
            Edit Profile
          </button>

          <KebabMenu onShare={share} onReport={null} />
        </div>

        {copied && <div className={styles.toast}>Link copied</div>}
      </div>

      {/*Popup component*/}
      <ProfileFollowModal
        userId={userId}
        open={showFriends}
        onClose={closeFriendsModal}
      />
    </>
  );
}
