import React, { useEffect, useRef, useState } from "react";
import { PlaylistSection } from "../Components/PlaylistSection";
import styles from "./Playlists.module.css";

// Mock data for playlists
/*const ownedPlaylists = [
  {
    id: 1,
    title: "My Chill Vibes",
    owner: "You",
    songCount: 42,
    genres: ["Indie", "Alternative", "Chill"],
    cover:
      "https://images.unsplash.com/photo-1618175349544-71ca933f4979?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtdXNpYyUyMHBsYXlsaXN0JTIwdmlueWx8ZW58MXx8fHwxNzYxNjEzMjU3fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  },
] */

export default function Playlists() {
  const [playlistInfo, setPlaylistInfo] = useState({ ownedPlaylists: [], contributorPlaylists: [], followingPlaylists: [] });

  const ownedPlaylists = playlistInfo.ownedPlaylists;
  const contributorPlaylists = playlistInfo.contributorPlaylists;
  const followingPlaylists = playlistInfo.followingPlaylists;

  const loaded = useRef(false);

  useEffect(() => {
    if (loaded.current) return;

    loaded.current = true;
    (async () => {
      const playlists = await fetch("http://localhost:5062/api/playlists/me", {
        method: "GET",
        credentials: "include",
      });

      setPlaylistInfo(await playlists.json());
    })();
  }, []);

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.appTitle}>Your Library</h1>
        <p className={styles.subtitle}>Manage and explore your playlists</p>
      </header>

      <main className={styles.content}>
        <PlaylistSection title="Your Playlists" playlists={ownedPlaylists} />

        <PlaylistSection title="Collaborative Playlists" playlists={contributorPlaylists} />

        <PlaylistSection title="Following" playlists={followingPlaylists} />
      </main>
    </div>
  );
}
