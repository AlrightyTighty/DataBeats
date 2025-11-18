// src/Pages/PlaylistPage.jsx
import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router";
import {
  getPlaylistPage,
  addSongToPlaylist,
  removeSongFromPlaylist,
} from "../lib/playlistPageApi.js";
import { toggleLike, getLikeStatuses } from "../lib/likesApi.js";
import { usePlaybar } from "../contexts/PlaybarContext.jsx";
import Topnav from "../Components/Topnav.jsx";
import AddSongModal from "../Components/AddSongModal.jsx";
import AddUserModal from "../Components/AddUserModal.jsx";
import DeleteButton from "../Components/DeleteButton.jsx";
import API from "../lib/api";
import styles from "./PlaylistPage.module.css";
import albumArtPlaceholder from "../assets/graphics/albumartplaceholder.png";

export default function PlaylistPage() {
  const { id } = useParams();
  const playlistId = useMemo(() => Number(id), [id]);
  const { setPlaybarState } = usePlaybar();

  const [loading, setLoading] = useState(true);
  const [playlist, setPlaylist] = useState(null);
  const [error, setError] = useState("");
  const [addId, setAddId] = useState("");
  const [albumArtCache, setAlbumArtCache] = useState({});
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAddUser, setShowAddUser] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [likes, setLikes] = useState({});

  async function load() {
    try {
      setLoading(true);
      setError("");
      // Request playlist data with album art and like statuses embedded
      const data = await getPlaylistPage(playlistId, true, true);
      setPlaylist(data);

      // Build album art cache from embedded data
      const newCache = { ...albumArtCache };
      const artIdsToFetch = [];
      
      data.songs.forEach((song) => {
        if (song.albumArtFileId) {
          if (song.albumArtDataUrl) {
            // Use embedded album art if available
            newCache[song.albumArtFileId] = song.albumArtDataUrl;
          } else if (!newCache[song.albumArtFileId]) {
            // Fallback: need to fetch album art separately
            artIdsToFetch.push(song.albumArtFileId);
          }
        }
      });

      // Fetch any missing album art (fallback for when backend doesn't include it)
      for (const artId of [...new Set(artIdsToFetch)]) {
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

      setAlbumArtCache(newCache);

      // Build likes map from embedded data
      const likesMap = {};
      data.songs.forEach((song) => {
        // If isLiked is provided, use it; otherwise default to false
        likesMap[song.songId] = song.isLiked === true;
      });
      setLikes(likesMap);
      
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

  async function handleToggleLike(songId) {
    try {
      const { isLiked } = await toggleLike(songId);
      setLikes((prev) => ({
        ...prev,
        [songId]: isLiked,
      }));
    } catch (error) {
      console.error("Error toggling like:", error);
    }
  }

  function toggleDeleteModal() {
    setShowDelete(!showDelete);
  }

  function handleSongClick(songId) {
    setPlaybarState({
      songId,
      songList: playlist.songs,
      playlistId: playlistId,
      visible: true,
    });
  }

  if (loading || error || !playlist) {
    return (
      <>
        <Topnav />
        <div className={styles.page}>
          <div className={styles.inner}>
            {loading && (
              <div className={styles.status}>Loading playlist...</div>
            )}
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

  const isLikedPlaylist = playlist.playlistName === "Your Liked Playlist";

  const canEdit =(playlist.isOwner || playlist.isCollaborator) && !isLikedPlaylist;
  const canManageAccess = playlist.isOwner && !isLikedPlaylist;
  const canDelete = playlist.isOwner && !isLikedPlaylist;

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
                    Owner:{" "}
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

            {/* Add song / user row (hidden for liked playlist) */}
            {canEdit && (
              <div className={styles.addRow}>
                <button
                  onClick={() => setShowAddModal(true)}
                  className={styles.addButton}
                >
                  ➕ Add Songs
                </button>
                {canManageAccess && (
                  <button
                    onClick={() => setShowAddUser(true)}
                    className={styles.addUserButton}
                  >
                    ➕ Add Users
                  </button>
                )}
                {showAddModal && (
                  <AddSongModal
                    isOpen={showAddModal}
                    onClose={() => setShowAddModal(false)}
                    existingSongIds={playlist.songs?.map(s => s.songId) || []}
                    onSelect={async (song) => {
                      // reuse existing addSongToPlaylist flow
                      try {
                        const data = await addSongToPlaylist(playlistId, song.songId);
                        setPlaylist(data);
                        // Don't close modal - let user add more songs
                      } catch (e) {
                        // Re-throw to let modal handle the error
                        throw e;
                      }
                    }}
                  />
                )}
                {showAddUser && (
                  <AddUserModal
                    isOpen={showAddUser}
                    onClose={() => setShowAddUser(false)}
                    collaborators={playlist.collaborators || []}
                    ownerName={playlist.ownerDisplayName}
                    onAdd={async (username) => {
                      try {
                        const { addCollaboratorToPlaylist } = await import(
                          "../lib/playlistPageApi.js"
                        );
                        const data = await addCollaboratorToPlaylist(
                          playlistId,
                          username
                        );
                        setPlaylist(data);
                      } catch (err) {
                        console.warn(err);
                        return Promise.reject(err);
                      }
                    }}
                    onRemove={async (collaboratorUserId) => {
                      try {
                        const { removeCollaboratorFromPlaylist } = await import(
                          "../lib/playlistPageApi.js"
                        );
                        const data = await removeCollaboratorFromPlaylist(
                          playlistId,
                          collaboratorUserId
                        );
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

            {error && (
              <div className={`${styles.status} ${styles.statusError}`}>
                {error}
              </div>
            )}

            <section className={styles.songsSection}>
              {playlist.songs.length === 0 ? (
                <div className={styles.emptyText}>No songs yet.</div>
              ) : (
                <>
                  <div className={styles.songsHeaderRow}>
                    <div className={styles.colLike}></div>
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
                      const albumArtSrc =
                        s.albumArtFileId && albumArtCache[s.albumArtFileId]
                          ? albumArtCache[s.albumArtFileId]
                          : albumArtPlaceholder;

                      return (
                        <li
                          key={
                            s.playlistEntryId ??
                            `${s.songId}-${s.timeAddedUtc}`
                          }
                          className={`${styles.songRow} ${styles.songRowGrid}`}
                          onClick={() => handleSongClick(s.songId)}
                          style={{ cursor: 'pointer' }}
                        >
                          {/* like button */}
                          <div className={styles.colLike}>
                            <button
                              className={styles.likeButton}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleToggleLike(s.songId);
                              }}
                              aria-label={
                                likes[s.songId]
                                  ? "Unlike this song"
                                  : "Like this song"
                              }
                            >
                              {likes[s.songId] ? "♥" : "♡"}
                            </button>
                          </div>

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

                          {/* actions (hidden for liked playlist) */}
                          <div className={styles.colActions}>
                            {canEdit && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onRemove(s.songId);
                                }}
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
        {canDelete && (
          <DeleteButton
            strwhattodelete="playlist"
            api={`${API}/api/playlist/${playlistId}`}
            state={showDelete}
            clickFunction={toggleDeleteModal}
          />
        )}
      </div>
    </>
  );
}
