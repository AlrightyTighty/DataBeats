import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router";
import Topnav from "../Components/Topnav";
import styles from "./ListenerProfile.module.css";
import API from "../lib/api.js";

import useMe from "../Components/UseMe.js";
import KebabMenu from "../Components/Profile/KebabMenu.jsx";
import useFollow from "../hooks/useFollow.js";
import ProfileContent from "../Components/Profile/ProfileContent.jsx";

function ProfileHeaderVisitor({ user }) {
  return (
    <div style={{ position: "relative", width: "100%", height: "100%", color: "#fff" }}>
      {/*profile image*/}
      <div style={{
        position: "absolute", left: 92, top: 28, bottom: 28, width: 233,
        borderRadius: 12, background: "#D9D9D9", overflow: "hidden"
      }} />

      {/*username*/}
      <div style={{
        position: "absolute", left: 364, top: 120, width: 287, height: 49,
        display: "flex", alignItems: "center", justifyContent: "center"
      }}>
        <div style={{ fontFamily: "Instrument Sans", fontWeight: 700, fontSize: 40, lineHeight: "49px" }}>
          {user?.username ?? user?.displayName ?? "User"}
        </div>
      </div>

      {/*Following*/}
      <div style={{ position: "absolute", left: 361, bottom: 28, width: 192, height: 41 }}>
        <div style={{ position: "absolute", inset: 0, display: "flex", gap: 10, alignItems: "center" }}>
          <span style={{ fontFamily: "Instrument Sans", fontSize: 34 }}>Following:</span>
          <span style={{ fontFamily: "Instrument Sans", fontSize: 34 }}>
            {user?.followingCount ?? 0}
          </span>
        </div>
      </div>

      {/*Followers*/}
      <div style={{ position: "absolute", left: 825, bottom: 28, width: 192, height: 41 }}>
        <div style={{ position: "absolute", inset: 0, display: "flex", gap: 10, alignItems: "center" }}>
          <span style={{ fontFamily: "Instrument Sans", fontSize: 34 }}>Followers:</span>
          <span style={{ fontFamily: "Instrument Sans", fontSize: 34 }}>
            {user?.followerCount ?? 0}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function ListenerPublic() {
  const { id } = useParams();
  const navigate = useNavigate();
  const viewedUserId = useMemo(() => Number(id), [id]);

  const { me, loading: authLoading } = useMe();
  const [user, setUser] = useState(null);
  const [topSongs, setTopSongs] = useState([]);
  const [playlists, setPlaylists] = useState([]);

  useEffect(() => {
    if (!viewedUserId) return;
    (async () => {
      try {
        const r = await fetch(`${API}/api/user/${viewedUserId}`, { credentials: "include" });
        if (r.ok) setUser(await r.json());
      } catch {}

      // top songs
      try {
        const ts = await fetch(`${API}/api/song/top/${viewedUserId}`, { credentials: "include" });
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
        const r2 = await fetch(`${API}/api/playlist/user/${viewedUserId}`, { credentials: "include" });
        const data = r2.ok ? await r2.json() : [];
        const mapped = (Array.isArray(data) ? data : []).map(p => ({
          playlistId: p.playlistId ?? p.PlaylistId ?? p.id,
          name:       p.playlistName ?? p.PlaylistName ?? p.title ?? "Playlist",
          image:      p.playlistImage ?? p.playlistImageBase64 ?? null,
        }));
        setPlaylists(mapped.slice(0, 5));
      } catch {}
    })();
  }, [viewedUserId]);

  //follow logic
  const { label, act } = useFollow({
    variant: "user",
    viewerId: me?.userId,
    targetId: viewedUserId,
    initialStatus: "none",
    apiBase: API
  });

  // kebabmenu
  function onShare() {
    const url = `${window.location.origin}/user/${viewedUserId}`;
    navigator.share?.({ title: "Profile", url }) || navigator.clipboard?.writeText(url);
  }
  function onReport() {
    navigate(`/report?userId=${viewedUserId}`);
  }

  const isSelf = !!me && Number(me.userId) === viewedUserId;

  return (
    <>
      <Topnav />
      <div className={styles.page}>
        <section className={styles.header}>
          <div className={styles.headerInner}>
            {user ? <ProfileHeaderVisitor user={user} /> : null}
          </div>
        </section>

        {!authLoading && !isSelf && (
          <div className={styles.kebabSlot}>
            <KebabMenu
              onShare={onShare}
              followLabel={label}
              onFollowAction={act}
              onReport={onReport}
            />
          </div>
        )}

        <section className={styles.content}>
          <ProfileContent user={user} topSongs={topSongs} playlists={playlists} />
        </section>
      </div>
    </>
  );
}