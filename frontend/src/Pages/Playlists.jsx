import React, { useEffect, useRef, useState } from "react";
import { PlaylistSection } from "../Components/PlaylistSection";
import styles from "./Playlists.module.css";
import Topnav from "../Components/Topnav";
import { useNavigate } from "react-router";
import API from "../lib/api";
import ContextMenu from "../Components/ContextMenu";

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
  const [playlistInfo, setPlaylistInfo] = useState({ ownedPlaylists: [], contributorPlaylists: [] });
  const [contextMenu, setContextMenu] = useState({ items: [], functions: [], x: 0, y: 0, visible: false });

  const contextMenuRef = useRef(null);

  const ownedPlaylists = playlistInfo.ownedPlaylists;
  const contributorPlaylists = playlistInfo.contributorPlaylists;
  const navigate = useNavigate();

  const loaded = useRef(false);

  console.log(playlistInfo);

  useEffect(() => {
    if (loaded.current) return;

    loaded.current = true;
    (async () => {
      const playlistsResponse = await fetch(`${API}/api/playlist/me`, {
        method: "GET",
        credentials: "include",
      });

      const playlists = await playlistsResponse.json();

      playlists.ownedPlaylists.forEach((playlist) => {
        playlist.functions = [
          () => {
            navigate("/playlist/" + playlist.playlistId);
          },
        ];
        playlist.items = ["View/Edit"];
        playlist.setContextMenu = setContextMenu;
      });

      setPlaylistInfo(playlists);
    })();
  }, []);

  useEffect(() => {
    // console.log("set up click event");
    function handleClickOutside(event) {
      // console.log("clicked somewhere");
      //console.log(contextMenuRef.current);
      //  console.log(!contextMenuRef.current.contains(event.target));
      if (contextMenuRef.current && !contextMenuRef.current.contains(event.target)) {
        setContextMenu({ items: [], functions: [], x: 0, y: 0, visible: false });
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      console.log("click event cleaned up");
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [contextMenuRef, contextMenu]);

  return (
    <>
      <Topnav />
      <ContextMenu ref={contextMenuRef} items={contextMenu.items} functions={contextMenu.functions} x={contextMenu.x} y={contextMenu.y} visible={contextMenu.visible} />
      <div className={styles.container}>
        <header className={styles.header}>
          <h1 className={styles.appTitle}>Your Library</h1>
          <p className={styles.subtitle}>Manage and explore your playlists</p>
        </header>

        <main className={styles.content}>
          <PlaylistSection title="Your Playlists" playlists={ownedPlaylists} />
          <button onClick={() => navigate("/createplaylist")}> New Playlist </button>
        </main>
      </div>
    </>
  );
}
