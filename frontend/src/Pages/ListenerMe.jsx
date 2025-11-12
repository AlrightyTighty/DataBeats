import { useEffect, useState } from "react";
import Topnav from "../Components/Topnav";
import styles from "./ListenerProfile.module.css";
import API from "../lib/api.js";

import useMe from "../Components/UseMe.js";
import ProfileHeaderMe from "../Components/Profile/ProfileHeaderMe.jsx";
import ProfileContent from "../Components/Profile/ProfileContent.jsx";

export default function ListenerMe() {
  const { me, loading: authLoading } = useMe();
  const [topSongs, setTopSongs] = useState([]);
  const [playlists, setPlaylists] = useState([]);

  function onShareMe() {
    const url = `${window.location.origin}/user/${me?.userId ?? ""}`;
    navigator.share?.({ title: "My Profile", url }) || navigator.clipboard?.writeText(url);
  }

  useEffect(() => {
    if (authLoading || !me) return;

    (async () => {
      //Top songs (limit 5)
      try {
        const ts = await fetch(`${API}/api/song/top/${me.userId}`, { credentials: "include" });
        const data = ts.ok ? await ts.json() : [];
        const normalized = (Array.isArray(data) ? data : []).map((s) => ({
          songId: s.songId ?? s.SongId ?? s.id,
          title:   s.songName ?? s.SongName ?? s.title ?? "Unknown",
          artistName: s.artistName ?? s.ArtistName ?? "",
          duration: s.duration ?? s.Duration ?? "",
        }));
        setTopSongs(normalized.slice(0, 5));
      } catch {}

      //playlists
      try {
        const pl = await fetch(`${API}/api/playlist/me`, { credentials: "include" });
        const payload = pl.ok ? await pl.json() : {};
        const owned  = payload.ownedPlaylists ?? payload.OwnedPlaylists ?? [];
        const contrib= payload.contributorPlaylists ?? payload.ContributorPlaylists ?? [];
        const flat = [...owned, ...contrib].map((p) => ({
          playlistId: p.playlistId ?? p.PlaylistId ?? p.id,
          name:       p.playlistName ?? p.PlaylistName ?? p.title ?? "Playlist",
          image:      p.playlistImage ?? p.playlistImageBase64 ?? null,
        }));
        setPlaylists(flat.slice(0, 5));
      } catch {}
    })();
  }, [authLoading, me]);

  return (
    <>
      <Topnav />
      <div className={styles.page}>
        {/*Profile header*/}
        <section className={styles.header}>
          <div className={styles.headerInner}>
            <ProfileHeaderMe me={me} />
          </div>
        </section>

        {/*Bio + Top 5 Songs + Playlists*/}
        <section className={styles.content}>
          <ProfileContent user={me} topSongs={topSongs} playlists={playlists} />
        </section>
      </div>
    </>
  );
}
