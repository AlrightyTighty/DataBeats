const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5062";

import API from "./api";

export async function toggleLike(songId) {
  const response = await fetch(`${API}/api/likes/${songId}/toggle`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to toggle like: ${response.statusText}`);
  }

  return await response.json();
}

// Fetch like status for a batch of songIds for the current user
// Returns a Set of liked songIds for easy lookups
export async function getLikeStatuses(songIds) {
  if (!Array.isArray(songIds) || songIds.length === 0) return new Set();
  const qs = encodeURIComponent(songIds.join(","));
  const response = await fetch(`${API}/api/likes/status?songIds=${qs}`, {
    method: "GET",
    credentials: "include",
  });
  if (!response.ok) {
    return new Set();
  }
  const data = await response.json();
  const likedIds = new Set((data?.likes || []).map((x) => x.songId));
  return likedIds;
}
