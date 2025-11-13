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
