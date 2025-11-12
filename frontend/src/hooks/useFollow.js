import { useCallback, useMemo, useState } from "react";

export default function useFollow({
  variant,            
  viewerId,          
  targetId,           
  initialStatus = "none",
  apiBase = "http://localhost:5062"
}) {
  const [status, setStatus] = useState(initialStatus);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);

  const label = useMemo(() => {
    if (variant === "artist") return status === "following" ? "Unfollow" : "Follow";
    if (status === "none") return "Follow";
    if (status === "pending") return "Request Sent";
    if (status === "following") return "Unfollow";
    if (status === "denied") return "Follow";
    return "Follow";
  }, [variant, status]);

  const follow = useCallback(async () => {
    setErr(null);
    if (loading) return;
    setLoading(true);
    try {
      if (variant === "artist") {
        const r = await fetch(`${apiBase}/api/musician/${targetId}/follow`, { method: "POST", credentials: "include" });
        if (!r.ok) throw new Error("Follow failed");
        setStatus("following");
      } else {
        const r = await fetch(`${apiBase}/api/friend`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ frienderId: viewerId, friendeeId: targetId })
        });
        if (!r.ok) throw new Error("Request failed");
        setStatus("pending");
      }
    } catch (e) {
      setErr(e);
    } finally {
      setLoading(false);
    }
  }, [variant, viewerId, targetId, apiBase, loading]);

  const unfollow = useCallback(async () => {
    setErr(null);
    if (loading) return;
    setLoading(true);
    try {
      if (variant === "artist") {
        await fetch(`${apiBase}/api/musician/${targetId}/unfollow`, { method: "POST", credentials: "include" });
        setStatus("none");
      } else {
        await fetch(`${apiBase}/api/friend/${viewerId}/${targetId}`, { method: "DELETE", credentials: "include" });
        setStatus("none");
      }
    } catch (e) {
      setErr(e);
    } finally {
      setLoading(false);
    }
  }, [variant, viewerId, targetId, apiBase, loading]);

  const cancelRequest = useCallback(async () => {
    setErr(null);
    if (loading) return;
    setLoading(true);
    try {
      await fetch(`${apiBase}/api/friend/${viewerId}/${targetId}`, { method: "DELETE", credentials: "include" });
      setStatus("none");
    } catch (e) {
      setErr(e);
    } finally {
      setLoading(false);
    }
  }, [viewerId, targetId, apiBase, loading]);

  const act = useCallback(() => {
    if (variant === "artist") return status === "following" ? unfollow() : follow();
    if (status === "none" || status === "denied") return follow();
    if (status === "pending") return cancelRequest();
    if (status === "following") return unfollow();
  }, [variant, status, follow, unfollow, cancelRequest]);

  const setDenied = useCallback(() => setStatus("denied"), []);
  const setAccepted = useCallback(() => setStatus("following"), []);

  return { status, label, loading, error: err, act, follow, unfollow, cancelRequest, setDenied, setAccepted, setStatus };
}