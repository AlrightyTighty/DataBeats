// src/Pages/ListenerMe.jsx
import Topnav from "../Components/Topnav";
import styles from "./ListenerProfile.module.css";

import useMe from "../Components/UseMe.js";
import ProfileHeaderMe from "../Components/Profile/ProfileHeaderMe.jsx";

export default function ListenerMe() {
  const { me, loading: authLoading } = useMe();

  if (authLoading && !me) {
    return (
      <>
        <Topnav />
        <div className={styles.page}>
          <div className={styles.loadingCenter}>Loading profile...</div>
        </div>
      </>
    );
  }

  if (!me) {
    return (
      <>
        <Topnav />
        <div className={styles.page}>
          <div className={styles.loadingCenter}>Could not load profile.</div>
        </div>
      </>
    );
  }

  return (
    <>
      <Topnav />
      <div className={styles.page}>
        <div className={styles.container}>
          {/* Header card (same vibe as ArtistProfileUser, but via component) */}
          <div className={styles.header}>
            <ProfileHeaderMe me={me} />
          </div>

          {/* You can add more sections below later (top songs, playlists, etc.) */}
        </div>
      </div>
    </>
  );
}
