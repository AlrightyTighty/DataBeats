// src/lib/playlistPageApi.js
const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:5062";

async function jsonOrText(res) {
  const ct = res.headers.get("content-type") || "";
  return ct.includes("application/json") ? res.json() : res.text();
}

function normalizeErr(body) {
  if (typeof body === "string") return body;
  return body?.error || body?.message || JSON.stringify(body);
}

export async function getPlaylistPage(playlistId) {
  const res = await fetch(`${API}/api/playlistpage/${playlistId}`, {
    credentials: "include",
  });
  if (!res.ok) throw new Error(normalizeErr(await jsonOrText(res)));
  return res.json();
}

export async function addSongToPlaylist(playlistId, songId) {
  const res = await fetch(`${API}/api/playlistpage/${playlistId}/songs`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ songId }),
  });
  if (!res.ok) throw new Error(normalizeErr(await jsonOrText(res)));
  return res.json();
}

export async function removeSongFromPlaylist(playlistId, songId) {
  const res = await fetch(`${API}/api/playlistpage/${playlistId}/songs/${songId}`, {
    method: "DELETE",
    credentials: "include",
  });
  if (!res.ok) throw new Error(normalizeErr(await jsonOrText(res)));
  return res.json();
}

export async function addCollaboratorToPlaylist(playlistId, username) {
  const res = await fetch(`${API}/api/playlistpage/${playlistId}/collaborators`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ username }),
  });
  if (!res.ok) throw new Error(normalizeErr(await jsonOrText(res)));
  return res.json();
}
