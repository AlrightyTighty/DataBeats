import { useState, useEffect, useCallback } from "react";

const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:5062";

export default function useFollow({ viewerId, targetId, apiBase = API } = {}) {
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState("");

  const canFollow = !!viewerId && !!targetId && viewerId !== targetId;

  const refresh = useCallback(async () => {
    if (!canFollow) {
      setIsFollowing(false);
      setChecking(false);
      return;
    }

    try {
      setChecking(true);
      setError("");

      const res = await fetch(
        `${apiBase}/api/follow/is-following/${viewerId}/${targetId}`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      if (!res.ok) {
        setIsFollowing(false);
        return;
      }

      const data = await res.json();
      setIsFollowing(Boolean(data.isFollowing));
    } catch {
      setIsFollowing(false);
    } finally {
      setChecking(false);
    }
  }, [canFollow, viewerId, targetId, apiBase]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const follow = useCallback(async () => {
    if (!canFollow) return false;
    try {
      setLoading(true);
      setError("");

      const res = await fetch(`${apiBase}/api/follow/${viewerId}/${targetId}`, {
        method: "POST",
        credentials: "include",
      });

      if (!res.ok) {
        setError("Could not follow.");
        return false;
      }

      setIsFollowing(true);
      // Refresh the follow status to ensure consistency
      await refresh();
      return true;
    } catch {
      setError("Could not follow.");
      return false;
    } finally {
      setLoading(false);
    }
  }, [canFollow, viewerId, targetId, apiBase, refresh]);

  const unfollow = useCallback(async () => {
    if (!canFollow) return false;
    try {
      setLoading(true);
      setError("");

      const res = await fetch(`${apiBase}/api/follow/${viewerId}/${targetId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!res.ok) {
        setError("Could not unfollow.");
        return false;
      }

      setIsFollowing(false);
      // Refresh the follow status to ensure consistency
      await refresh();
      return true;
    } catch {
      setError("Could not unfollow.");
      return false;
    } finally {
      setLoading(false);
    }
  }, [canFollow, viewerId, targetId, apiBase, refresh]);

  const label =
    !canFollow || checking ? "" : isFollowing ? "Unfollow" : "Follow";

  const act = useCallback(async () => {
    if (!canFollow || checking) return;
    if (isFollowing) {
      await unfollow();
    } else {
      await follow();
    }
  }, [canFollow, checking, isFollowing, follow, unfollow]);

  return {
    isFollowing,
    label,
    act,
    loading,
    checking,
    error,
    canFollow,
    refresh,
  };
}
