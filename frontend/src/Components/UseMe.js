import { useEffect, useState } from "react";

const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:5062";

export default function useMe() {
  const [me, setMe] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let dead = false;
    (async () => {
      try {
        const r = await fetch(`${API}/api/me`, { credentials: "include" });
        if (!r.ok) {
          if (!dead) {
            setMe(null);
            setLoading(false);
          }
          return;
        }
        const data = await r.json();
        if (!dead) {
          setMe(data);
          setLoading(false);
        }
      } catch {
        if (!dead) {
          setMe(null);
          setLoading(false);
        }
      }
    })();

    return () => {
      dead = true;
    };
  }, []);

  return { me, loading };
}
