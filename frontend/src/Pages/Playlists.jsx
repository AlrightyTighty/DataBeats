import React, { useEffect, useRef, useState } from "react";
import { PlaylistSection } from "../Components/PlaylistSection";
import styles from "./Playlists.module.css";
import Topnav from "../Components/Topnav";
import { useNavigate } from "react-router";
import API from "../lib/api";
import ContextMenu from "../Components/ContextMenu";
import AddButton from "../Components/AddButton"

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

  const ownedPlaylists = playlistInfo.ownedPlaylists || [];
  const contributorPlaylists = playlistInfo.contributorPlaylists || [];
  const navigate = useNavigate();

  console.log(playlistInfo);

  // Organize playlists into categories
  const likedPlaylist = ownedPlaylists.find(p => {
    const name = p.playlistName || p.PlaylistName || p.playlistTitle || p.PlaylistTitle;
    return name === "Your Liked Playlist";
  });

  const yourPlaylists = ownedPlaylists.filter(p => {
    const name = p.playlistName || p.PlaylistName || p.playlistTitle || p.PlaylistTitle;
    const hasCollaborators = p.hasCollaborators || p.HasCollaborators;
    return name !== "Your Liked Playlist" && !hasCollaborators;
  });

  const sharedPlaylists = ownedPlaylists.filter(p => {
    const name = p.playlistName || p.PlaylistName || p.playlistTitle || p.PlaylistTitle;
    const hasCollaborators = p.hasCollaborators || p.HasCollaborators;
    return name !== "Your Liked Playlist" && hasCollaborators;
  });

  const collaborativePlaylists = contributorPlaylists || [];

  useEffect(() => {
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
          {/* Liked Playlist - Pinned at the top */}
          {likedPlaylist && (
            <PlaylistSection title="Liked Playlist" playlists={[likedPlaylist]} />
          )}

          {/* Your Playlists - No collaborators */}
          {yourPlaylists.length > 0 && (
            <PlaylistSection title="Your Playlists" playlists={yourPlaylists} />
          )}

          {/* Shared Playlists - You own and others collaborate */}
          {sharedPlaylists.length > 0 && (
            <PlaylistSection title="Shared Playlists" playlists={sharedPlaylists} />
          )}

          {/* Collaborative Playlists - You collaborate but don't own */}
          {collaborativePlaylists.length > 0 && (
            <PlaylistSection title="Collaborative Playlists" playlists={collaborativePlaylists} />
          )}

          <AddButton route="/createplaylist" />
        </main>
      </div>
    </>
  );
}
