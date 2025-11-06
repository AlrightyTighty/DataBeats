// src/Pages/PlaylistPage.jsx
import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router";
import {
  getPlaylistPage,
  addSongToPlaylist,
  removeSongFromPlaylist,
} from "../lib/playlistPageApi.js";

const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:5062";


export default function PlaylistPage() {
  const { id } = useParams();
  const playlistId = useMemo(() => Number(id), [id]);

  const [loading, setLoading] = useState(true);
  const [playlist, setPlaylist] = useState(null);
  const [error, setError] = useState("");
  const [addId, setAddId] = useState("");

  async function load() {
    try {
      setLoading(true);
      setError("");
      const data = await getPlaylistPage(playlistId);
      setPlaylist(data);
    } catch (e) {
      setError(String(e.message || e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (Number.isFinite(playlistId)) load();
    else {
      setError("Invalid playlist id");
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  if (loading) return <div>Loading playlist...</div>;
  if (error) return <div style={{ color: "crimson" }}>Error: {error}</div>;
  if (!playlist) return <div>No data.</div>;

  return (
    <div style={{ padding: 16 }}>
      <h2 style={{ marginBottom: 8 }}>
        {playlist.playlistName}{" "}
        <small style={{ fontWeight: 400, color: "#555" }}>
          #{playlist.playlistId}
        </small>
      </h2>

      <p style={{ marginTop: 0, color: "#666" }}>
        {playlist.playlistDescription || "No description"}
      </p>

      <div style={{ marginBottom: 16, color: "#444" }}>
        Access: <b>{playlist.access}</b> • Owner user: <b>{playlist.userId}</b> • You are{" "}
        {playlist.isOwner ? "Owner" : playlist.isCollaborator ? "Collaborator" : "Viewer"}
      </div>

      {/* Add song */}
      {(playlist.isOwner || playlist.isCollaborator) && (
        <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 16 }}>
          <input
            type="number"
            placeholder="Song ID"
            value={addId}
            onChange={(e) => setAddId(e.target.value)}
            style={{ padding: 8, width: 160 }}
          />
          <button onClick={onAdd} style={{ padding: "8px 12px" }}>
            ➕ Add Song
          </button>
        </div>
      )}

      {/* Songs */}
      <div>
        <h3 style={{ marginBottom: 8 }}>Songs ({playlist.numOfSongs})</h3>
        {playlist.songs.length === 0 ? (
          <div>No songs yet.</div>
        ) : (
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 8 }}>
            {playlist.songs.map((s) => (
              <li key={s.playlistEntryId ?? `${s.songId}-${s.timeAddedUtc}`}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    border: "1px solid #eee",
                    padding: 8,
                    borderRadius: 8,
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600 }}>
                      {s.title || `(Song ${s.songId})`}
                    </div>
                    <div style={{ fontSize: 12, color: "#666" }}>
                      ID: {s.songId} • Added:{" "}
                      {new Date(s.timeAddedUtc).toLocaleString()}
                    </div>
                  </div>
                  {(playlist.isOwner || playlist.isCollaborator) && (
                    <button
                      onClick={() => onRemove(s.songId)}
                      style={{ padding: "6px 10px" }}
                    >
                      ❌ Remove
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
