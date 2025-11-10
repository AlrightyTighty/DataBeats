// src/Pages/PlaylistPage.jsx
import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router";
import {
  getPlaylistPage,
  addSongToPlaylist,
  removeSongFromPlaylist,
} from "../lib/playlistPageApi.js";
import Topnav from "../Components/Topnav.jsx";
import AddSongModal from "../Components/AddSongModal.jsx";
import AddUserModal from "../Components/AddUserModal.jsx";
import API from "../lib/api";
import styles from "./PlaylistPage.module.css";
import albumArtPlaceholder from "../assets/graphics/albumartplaceholder.png";

export default function PlaylistPage() {
  const { id } = useParams();
  const playlistId = useMemo(() => Number(id), [id]);

  const [loading, setLoading] = useState(true);
  const [playlist, setPlaylist] = useState(null);
  const [error, setError] = useState("");
  const [addId, setAddId] = useState("");
  const [albumArtCache, setAlbumArtCache] = useState({});
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAddUser, setShowAddUser] = useState(false);

  async function load() {
    try {
      setLoading(true);
      setError("");
      const data = await getPlaylistPage(playlistId);
      setPlaylist(data);
      
      // Load album art for all songs
      const artIds = [...new Set(data.songs.map(s => s.albumArtFileId).filter(Boolean))];
      const newCache = { ...albumArtCache };
      
      for (const artId of artIds) {
        if (!newCache[artId]) {
          try {
            const response = await fetch(`${API}/api/art/${artId}`);
            if (response.ok) {
              const artData = await response.json();
              newCache[artId] = `data:image/${artData.fileExtension};base64,${artData.fileData}`;
            }
          } catch (err) {
            console.error(`Failed to load album art ${artId}:`, err);
          }
        }
      }
      
      setAlbumArtCache(newCache);
    } catch (e) {
      setError(String(e.message || e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (Number.isFinite(playlistId)) {
      load();
    } else {
      setError("Invalid playlist id");
      setLoading(false);
    }
  }, [playlistId]);

  async function onAdd() {
    const num = Number(addId);
    if (!Number.isFinite(num) || num <= 0) {
      setError("Enter a valid numeric songId.");
      return;
    }
    try {
      setError("");
      const data = await addSongToPlaylist(playlistId, num);
      setPlaylist(data);
      setAddId("");
    } catch (e) {
      setError(String(e.message || e));
    }
  }

  async function onRemove(songId) {
    try {
      setError("");
      const data = await removeSongFromPlaylist(playlistId, songId);
      setPlaylist(data);
    } catch (e) {
      setError(String(e.message || e));
    }
  }

  if (loading || error || !playlist) {
    return (
      <>
        <Topnav />
        <div className={styles.page}>
          <div className={styles.inner}>
            {loading && <div className={styles.status}>Loading playlist...</div>}
            {!loading && error && (
              <div className={`${styles.status} ${styles.statusError}`}>
                Error: {error}
              </div>
            )}
            {!loading && !error && !playlist && (
              <div className={styles.status}>No data.</div>
            )}
          </div>
        </div>
      </>
    );
  }

  const picId =
    playlist.playlistPictureFileId ?? playlist.PlaylistPictureFileId ?? null;

  const coverSrc = picId
    ? `${API}/api/playlist/picture/view/${picId}`
    : albumArtPlaceholder;

  const canEdit = playlist.isOwner || playlist.isCollaborator;

  return (
    <>
      <Topnav />
      <div className={styles.page}>
        <div className={styles.inner}>
          <div className={styles.card}>
            {/* Top header block: image + description + meta */}
            <div className={styles.headerRow}>
              <div className={styles.coverWrapper}>
                <img
                  src={coverSrc}
                  alt={playlist.playlistName}
                  className={styles.coverImage}
                />
              </div>

              <div className={styles.headerMain}>
                <h1 className={styles.name}>{playlist.playlistName}</h1>

                <p className={styles.description}>
                  {playlist.playlistDescription || "No description"}
                </p>

                <div className={styles.metaRow}>
                  <span>
                    Access: <strong>{playlist.access}</strong>
                  </span>
                  <span>
                    • Owner: {" "}
                    <strong>
                      {playlist.ownerDisplayName ?? `User #${playlist.userId}`}
                    </strong>
                  </span>
                  <span>
                    • Playlist length: <strong>{playlist.numOfSongs}</strong>{" "}
                    song{playlist.numOfSongs === 1 ? "" : "s"}
                  </span>
                </div>
              </div>
            </div>

            {/* Add song / user row */}
            {canEdit && (
              <div className={styles.addRow}>
                <button onClick={() => setShowAddModal(true)} className={styles.addButton}>
                  ➕ Add Songs
                </button>
                <button onClick={() => setShowAddUser(true)} className={styles.addUserButton}>
                  ➕ Add Users
                </button>
                {showAddModal && (
                  <AddSongModal
                    isOpen={showAddModal}
                    onClose={() => setShowAddModal(false)}
                    onSelect={(song) => {
                      // reuse existing addSongToPlaylist flow
                      addSongToPlaylist(playlistId, song.songId)
                        .then((data) => {
                          setPlaylist(data);
                          setShowAddModal(false);
                        })
                        .catch((e) => setError(String(e.message || e)));
                    }}
                  />
                )}
                {showAddUser && (
                  <AddUserModal
                    isOpen={showAddUser}
                    onClose={() => setShowAddUser(false)}
                    onAdd={async (username) => {
                      try{
                        const { addCollaboratorToPlaylist } = await import("../lib/playlistPageApi.js");
                        const data = await addCollaboratorToPlaylist(playlistId, username);
                        setPlaylist(data);
                      } catch (err) {
                        console.warn(err);
                        return Promise.reject(err);
                      }
                    
                    }}
                  />
                )}
              </div>
            )}

            {}
            {error && (
              <div className={`${styles.status} ${styles.statusError}`}>
                {error}
              </div>
            )}

            {}
            <section className={styles.songsSection}>
              

              {playlist.songs.length === 0 ? (
                <div className={styles.emptyText}>No songs yet.</div>
              ) : (
                <>
                  {}
                  <div className={styles.songsHeaderRow}>
                    <div className={styles.colIndex}>#</div>
                    <div className={styles.colAlbumArt}></div>
                    <div className={styles.colTitle}>Title</div>
                    <div className={styles.colAlbum}>Album</div>
                    <div className={styles.colDate}>Date added</div>
                    <div className={styles.colDuration}>Duration</div>
                    <div className={styles.colActions}></div>
                  </div>

                  <ul className={styles.songList}>
                    {playlist.songs.map((s, i) => {
                      const albumArtSrc = s.albumArtFileId && albumArtCache[s.albumArtFileId]
                        ? albumArtCache[s.albumArtFileId]
                        : albumArtPlaceholder;

                      return (
                        <li
                          key={
                            s.playlistEntryId ?? `${s.songId}-${s.timeAddedUtc}`
                          }
                          className={`${styles.songRow} ${styles.songRowGrid}`}
                        >
                          {/* track number */}
                          <div className={styles.colIndex}>{i + 1}</div>

                          {/* album art thumbnail */}
                          <div className={styles.colAlbumArt}>
                            <img
                              src={albumArtSrc}
                              alt={s.albumName || "Album"}
                              className={styles.albumArtThumb}
                            />
                          </div>

                          {/* title + artist subtext */}
                          <div className={styles.colTitle}>
                            <div className={styles.songTitle}>
                              {s.title || `(Song ${s.songId})`}
                            </div>
                            <div className={styles.songSub}>
                              {s.artistName || "Unknown Artist"}
                            </div>
                          </div>

                          {/* album name */}
                          <div className={styles.colAlbum}>
                            {s.albumName || "—"}
                          </div>

                          {/* date added */}
                          <div className={styles.colDate}>
                            {new Date(s.timeAddedUtc).toLocaleDateString()}
                          </div>

                          {/* duration */}
                          <div className={styles.colDuration}>
                            {s.duration || "—"}
                          </div>

                          {/* actions */}
                          <div className={styles.colActions}>
                            {canEdit && (
                              <button
                                onClick={() => onRemove(s.songId)}
                                className={styles.removeButton}
                              >
                                ❌ Remove
                              </button>
                            )}
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </>
              )}
            </section>
          </div>
        </div>
      </div>
    </>
  );
}
