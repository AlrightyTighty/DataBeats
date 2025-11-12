import { useEffect, useState } from "react";
import API from "../lib/api";

export default function useMe({ redirectIfMissing = true } = {}) {
  const [me, setMe] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let dead = false;
    (async () => {
      try {
        const r = await fetch(`${API}/api/me`, { credentials: "include" });
        if (!r.ok) throw new Error("not-auth");
        const json = await r.json();
        if (!dead) setMe(json);
      } catch {
        if (redirectIfMissing) location.assign("/login");
      } finally {
        if (!dead) setLoading(false);
      }
    })();
    return () => { dead = true; };
  }, [redirectIfMissing]);

  return { me, loading };
}
