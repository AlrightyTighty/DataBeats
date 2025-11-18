import { useEffect, useMemo, useRef, useState } from "react";
import API from "../lib/api";
import styles from "./AddSongModal.module.css";
import albumArtPlaceholder from "../assets/graphics/albumartplaceholder.png";

export default function AddSongModal({ isOpen, onClose, onSelect, existingSongIds = [] }) {
  const [query, setQuery] = useState("");
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const debounceRef = useRef(null);
  const [artCache, setArtCache] = useState({});
  const [addingStatus, setAddingStatus] = useState({}); // { songId: 'adding' | 'added' | 'error' }
  const [statusMessages, setStatusMessages] = useState({}); // { songId: 'message' }

  const effectiveQuery = useMemo(() => query.trim(), [query]);


  useEffect(() => {
    if (!isOpen) return;
    (async () => {
      try {
        setLoading(true);
        setError("");
        const url = new URL(`${API}/api/song/list`);
        url.searchParams.set("limit", "5");
        const res = await fetch(url.toString(), { credentials: "include" });
        if (!res.ok) throw new Error(`Failed to load songs (${res.status})`);
        const data = await res.json();
        setSongs(Array.isArray(data) ? data : []);
      } catch (e) {
        setError(String(e.message || e));
      } finally {
        setLoading(false);
      }
    })();
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [isOpen]);

  
  useEffect(() => {
    if (!isOpen) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        setLoading(true);
        setError("");
        const url = new URL(`${API}/api/song/list`);
        if (effectiveQuery) url.searchParams.set("q", effectiveQuery);
        url.searchParams.set("limit", "5");
        const res = await fetch(url.toString(), { credentials: "include" });
        if (!res.ok) throw new Error(`Failed to load songs (${res.status})`);
        const data = await res.json();
        setSongs(Array.isArray(data) ? data : []);
      } catch (e) {
        setError(String(e.message || e));
      } finally {
        setLoading(false);
      }
    }, 300);
  }, [effectiveQuery, isOpen]);

  useEffect(() => {
    if (!isOpen || songs.length === 0) return;
    const uniqueIds = [...new Set(songs.map(s => s.albumArtId).filter(Boolean))];
    const toFetch = uniqueIds.filter(id => !artCache[id]);
    if (toFetch.length === 0) return;
    let cancelled = false;
    (async () => {
      const nextCache = { ...artCache };
      await Promise.all(toFetch.map(async id => {
        try {
          const res = await fetch(`${API}/api/art/${id}`);
          if (!res.ok) return;
          const data = await res.json();
          nextCache[id] = `data:image/${data.fileExtension};base64,${data.fileData}`;
        } catch { /* ignore */ }
      }));
      if (!cancelled) setArtCache(nextCache);
    })();
    return () => { cancelled = true; };
  }, [isOpen, songs, artCache]);

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h3 className={styles.title}>Add songs</h3>
          <button className={styles.closeBtn} onClick={onClose}>
            ✕
          </button>
        </div>

        <div className={styles.searchRow}>
          <input
            className={styles.searchInput}
            placeholder="Search songs..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        {error && <div className={styles.error}>Error: {error}</div>}

        <div className={styles.list}>
          {loading && <div className={styles.row}>Loading…</div>}
          {!loading && songs.length === 0 && (
            <div className={styles.row}>No results</div>
          )}
          {!loading && songs.map(s => {
            const imgSrc = s.albumArtId && artCache[s.albumArtId] ? artCache[s.albumArtId] : albumArtPlaceholder;
            const isAlreadyInPlaylist = existingSongIds.includes(s.songId);
            const status = addingStatus[s.songId];
            const statusMsg = statusMessages[s.songId];
            
            const handleAdd = async () => {
              if (isAlreadyInPlaylist) {
                setStatusMessages(prev => ({ ...prev, [s.songId]: "Song already added" }));
                setTimeout(() => {
                  setStatusMessages(prev => {
                    const next = { ...prev };
                    delete next[s.songId];
                    return next;
                  });
                }, 2000);
                return;
              }

              if (status === 'adding') return; // Prevent double-click

              setAddingStatus(prev => ({ ...prev, [s.songId]: 'adding' }));
              setStatusMessages(prev => ({ ...prev, [s.songId]: "Adding..." }));

              try {
                await onSelect?.(s);
                setAddingStatus(prev => ({ ...prev, [s.songId]: 'added' }));
                setStatusMessages(prev => ({ ...prev, [s.songId]: "Song Added ✓" }));
                
                // Clear status after 2 seconds
                setTimeout(() => {
                  setAddingStatus(prev => {
                    const next = { ...prev };
                    delete next[s.songId];
                    return next;
                  });
                  setStatusMessages(prev => {
                    const next = { ...prev };
                    delete next[s.songId];
                    return next;
                  });
                }, 2000);
              } catch (err) {
                setAddingStatus(prev => ({ ...prev, [s.songId]: 'error' }));
                const errorMsg = err?.message || String(err);
                setStatusMessages(prev => ({ 
                  ...prev, 
                  [s.songId]: errorMsg.includes("already") ? "Song already added" : "Error adding song" 
                }));
                
                // Clear error after 3 seconds
                setTimeout(() => {
                  setAddingStatus(prev => {
                    const next = { ...prev };
                    delete next[s.songId];
                    return next;
                  });
                  setStatusMessages(prev => {
                    const next = { ...prev };
                    delete next[s.songId];
                    return next;
                  });
                }, 3000);
              }
            };

            return (
              <button
                key={s.songId}
                className={`${styles.rowButton} ${status === 'added' ? styles.added : ''} ${isAlreadyInPlaylist ? styles.alreadyAdded : ''}`}
                onClick={handleAdd}
                disabled={status === 'adding'}
              >
                <div className={styles.rowLeft}>
                  <img src={imgSrc} alt="cover" className={styles.thumb} />
                  <div className={styles.colTitle}>
                    <div className={styles.songTitle}>{s.songName}</div>
                    <div className={styles.songSub}>
                      {(s.artistNames?.join(", ") || "Unknown Artist") + (s.albumName ? ` • ${s.albumName}` : "")}
                    </div>
                  </div>
                </div>
                <div className={styles.colRight}>
                  <span className={styles.duration}>{formatDuration(s.duration)}</span>
                  {statusMsg ? (
                    <span className={`${styles.statusMsg} ${status === 'added' ? styles.success : ''} ${isAlreadyInPlaylist || status === 'error' ? styles.errorMsg : ''}`}>
                      {statusMsg}
                    </span>
                  ) : (
                    <span className={styles.plus}>
                      {isAlreadyInPlaylist ? "Already Added" : "Add ➕"}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function formatDuration(dur) {
  if (!dur) return "";
  try {
    const parts = String(dur).split(":");
    const mm = parts.length >= 2 ? parts[1] : "00";
    const ss = parts.length >= 3 ? parts[2] : parts[1] ?? "00";
    return `${mm}:${ss}`;
  } catch {
    return String(dur);
  }
}
 