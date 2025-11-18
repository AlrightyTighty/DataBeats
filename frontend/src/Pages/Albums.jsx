import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import Topnav from "../Components/Topnav";
import styles from "./NewReleases.module.css";

const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:5062";

export default function Albums() {
  const navigate = useNavigate();
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const [sortBy, setSortBy] = useState('release'); // 'release', 'songs', 'name'

  useEffect(() => {
    (async () => {
      try {
        setErr(null);
        setLoading(true);

        const res = await fetch(`${API}/api/album`);
        if (!res.ok) {
          throw new Error(`GET /api/album failed (${res.status})`);
        }

        const data = await res.json();
        const list = Array.isArray(data) ? data : [];

        setAlbums(list);
      } catch (e) {
        setErr(e.message || String(e));
        setAlbums([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Apply sorting
  const sortedAlbums = [...albums].sort((a, b) => {
    if (sortBy === 'songs') {
      const songsA = Number(a.NumSongs ?? a.numSongs ?? 0);
      const songsB = Number(b.NumSongs ?? b.numSongs ?? 0);
      return songsB - songsA; // Descending order
    } else if (sortBy === 'name') {
      const nameA = (a.albumTitle ?? a.AlbumTitle ?? "").toLowerCase();
      const nameB = (b.albumTitle ?? b.AlbumTitle ?? "").toLowerCase();
      return nameA.localeCompare(nameB);
    } else {
      // Sort by release date (default)
      const ra = a.releaseDate ?? a.ReleaseDate ?? a.timestampReleased ?? a.TimestampReleased ?? null;
      const rb = b.releaseDate ?? b.ReleaseDate ?? b.timestampReleased ?? b.TimestampReleased ?? null;
      return new Date(rb) - new Date(ra);
    }
  });

  return (
    <>
      <Topnav />
      <div className={styles.page}>
        <div className={styles.container}>
          <div style={{display:'flex',alignItems:'center',flexWrap:'wrap',marginBottom:20,gap:12,justifyContent:'space-between'}}>
            <h1 style={{margin:0}}>Albums</h1>
            <div style={{display:'flex',gap:8,alignItems:'center'}}>
              <button 
                onClick={()=>setSortBy('release')} 
                style={{padding:'6px 14px',borderRadius:8,border:'none',background:sortBy==='release'?'#10b981':'#e5e7eb',color:sortBy==='release'?'#fff':'#222',fontWeight:600,cursor:'pointer'}}
              >
                Sort by Release Date
              </button>
              <button 
                onClick={()=>setSortBy('songs')} 
                style={{padding:'6px 14px',borderRadius:8,border:'none',background:sortBy==='songs'?'#10b981':'#e5e7eb',color:sortBy==='songs'?'#fff':'#222',fontWeight:600,cursor:'pointer'}}
              >
                Sort by Song Count
              </button>
              <button 
                onClick={()=>setSortBy('name')} 
                style={{padding:'6px 14px',borderRadius:8,border:'none',background:sortBy==='name'?'#10b981':'#e5e7eb',color:sortBy==='name'?'#fff':'#222',fontWeight:600,cursor:'pointer'}}
              >
                Sort A-Z
              </button>
            </div>
          </div>
          <div style={{marginBottom:12,fontSize:13,color:'#374151'}}>
            Showing {sortedAlbums.length} album{sortedAlbums.length===1?'':'s'}
            {sortBy === 'release' ? ' - sorted by release date' : sortBy === 'songs' ? ' - sorted by song count' : ' - sorted alphabetically'}
          </div>

          {err && <div style={{ opacity: 0.85 }}>{err}</div>}

          {loading ? (
            <p>Loading...</p>
          ) : sortedAlbums.length === 0 ? (
            <p>No Albums found.</p>
          ) : (
            <div className={styles.grid}>
              {sortedAlbums.map((a) => {
                const albumId = a.albumId ?? a.AlbumId;
                const albumTitle = a.albumTitle ?? a.AlbumTitle;

                const coverId =
                  a.albumOrSongArtFileId ?? a.AlbumOrSongArtFileId ?? null;
                const coverSrc = coverId
                  ? `${API}/api/art/view/${coverId}`
                  : null;

                const rawDate =
                  a.releaseDate ??
                  a.ReleaseDate ??
                  a.timestampReleased ??
                  a.TimestampReleased ??
                  null;

                const dateStr = rawDate
                  ? new Date(rawDate).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })
                  : "—";

                const rawArtists = a.artists ?? a.Artists ?? [];
                const artistLine =
                  Array.isArray(rawArtists) && rawArtists.length > 0
                    ? rawArtists
                        .map((x) => x.artistName ?? x.ArtistName)
                        .join(", ")
                    : "Unknown Artist";

                const songCount = a.NumSongs ?? a.numSongs ?? 0;
                const songText = songCount === 1 ? "1 song" : `${songCount} songs`;

                return (
                  <button
                    key={albumId}
                    type="button"
                    className={styles.card}
                    title={albumTitle}
                    onClick={() => navigate(`/album/${albumId}`)}
                  >
                    {coverSrc ? (
                      <img
                        src={coverSrc}
                        alt={albumTitle}
                        className={styles.cover}
                        loading="lazy"
                      />
                    ) : (
                      <div className={styles.cover} />
                    )}

                    <div className={styles.text}>
                      <h3>{albumTitle}</h3>
                      <p>
                        {artistLine} • {dateStr} • {songText}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
