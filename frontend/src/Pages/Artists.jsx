import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import Topnav from "../Components/Topnav";
import ContextMenu from "../Components/ContextMenu";
import useContextMenu from "../hooks/useContextMenu";
import ContextMenuButton from "../Components/ContextMenuButton";
import useAuthentication from "../hooks/useAuthentication";
import API from "../lib/api";
import styles from "./Artists.module.css";
import verifiedBadge from "../assets/graphics/musician_verification.png";

export default function Artists() {
  const navigate = useNavigate();
  const [artists, setArtists] = useState([]);
  const [avatarMap, setAvatarMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const [filter, setFilter] = useState('all'); // 'all', 'verified'
  const [sortBy, setSortBy] = useState('name'); // 'name', 'followers', 'monthly'
  const userInfo = useAuthentication();
  const [contextMenuRef, contextMenu, setContextMenu] = useContextMenu();

  useEffect(() => {
    (async () => {
      try {
        setErr(null);
        setLoading(true);

        const res = await fetch(`${API}/api/musician/all`);
        if (!res.ok) {
          throw new Error(`GET /api/musician/all failed (${res.status})`);
        }

        const data = await res.json();
        const list = Array.isArray(data) ? data : [];
        
        // Debug: log the data to see IsVerified field
        console.log('Artists data:', list);
        if (list.length > 0) {
          console.log('First artist IsVerified field:', list[0].IsVerified);
          console.log('Sample artist:', list[0]);
        }

        setArtists(list);

        const entries = await Promise.all(
          list.map(async (m) => {
            const picId =
              m.profilePictureFileId ?? m.ProfilePictureFileId ?? null;
            const id = m.musicianId ?? m.MusicianId;
            if (!id || !picId) return null;

            try {
              const imgRes = await fetch(
                `${API}/api/images/profile-picture/${picId}`
              );
              if (!imgRes.ok) return null;

              const imgData = await imgRes.json();
              const fileData = imgData.fileData ?? imgData.FileData;
              const fileExt =
                imgData.fileExtension ?? imgData.FileExtension ?? "png";
              if (!fileData) return null;

              return {
                id,
                src: `data:image/${fileExt};base64,${fileData}`,
              };
            } catch {
              return null;
            }
          })
        );

        const map = {};
        for (const entry of entries) {
          if (!entry) continue;
          map[entry.id] = entry.src;
        }
        setAvatarMap(map);
      } catch (e) {
        setErr(e.message || String(e));
        setArtists([]);
        setAvatarMap({});
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Filtering and sorting logic
  let filteredArtists = artists;
  
  // Apply filters
  if (filter === 'verified') {
    console.log('Filtering for verified artists. Total artists:', filteredArtists.length);
    filteredArtists.forEach(m => {
      console.log(`Artist ${m.MusicianName}: IsVerified = ${m.IsVerified}, isVerified = ${m.isVerified}, type: ${typeof m.IsVerified}`);
    });
    filteredArtists = filteredArtists.filter(m => m.IsVerified === true || m.isVerified === true);
    console.log('After filtering, verified artists:', filteredArtists.length);
  }
  
  // Apply sorting
  filteredArtists.sort((a, b) => {
    if (sortBy === 'followers') {
      const followersA = Number(a.FollowerCount ?? a.followerCount ?? 0);
      const followersB = Number(b.FollowerCount ?? b.followerCount ?? 0);
      return followersB - followersA; // Descending order
    } else if (sortBy === 'monthly') {
      const monthlyA = Number(a.MonthlyListenerCount ?? a.monthlyListenerCount ?? 0);
      const monthlyB = Number(b.MonthlyListenerCount ?? b.monthlyListenerCount ?? 0);
      return monthlyB - monthlyA; // Descending order
    } else {
      // Sort by name (default)
      const na = (a.musicianName ?? a.MusicianName ?? "").toLowerCase();
      const nb = (b.musicianName ?? b.MusicianName ?? "").toLowerCase();
      return na.localeCompare(nb);
    }
  });

  return (
    <>
      <ContextMenu ref={contextMenuRef} items={contextMenu.items} functions={contextMenu.functions} x={contextMenu.x} y={contextMenu.y} visible={contextMenu.visible} />
      <Topnav />
      <div className={styles.page}>
        <div className={styles.container}>
          <div style={{display:'flex',alignItems:'center',flexWrap:'wrap',marginBottom:20,gap:12,justifyContent:'space-between'}}>
            <h1 className={styles.title} style={{margin:0}}>Browse Artists</h1>
            <div style={{display:'flex',gap:8,alignItems:'center'}}>
              <button 
                onClick={()=>setFilter('all')} 
                style={{padding:'6px 14px',borderRadius:8,border:'none',background:filter==='all'?'#2563eb':'#e5e7eb',color:filter==='all'?'#fff':'#222',fontWeight:600,cursor:'pointer'}}
              >
                All Artists
              </button>
              <button 
                onClick={()=>setFilter('verified')} 
                style={{padding:'6px 14px',borderRadius:8,border:'none',background:filter==='verified'?'#2563eb':'#e5e7eb',color:filter==='verified'?'#fff':'#222',fontWeight:600,cursor:'pointer'}}
              >
                Verified Only
              </button>
              <button 
                onClick={()=>setSortBy('followers')} 
                style={{padding:'6px 14px',borderRadius:8,border:'none',background:sortBy==='followers'?'#10b981':'#e5e7eb',color:sortBy==='followers'?'#fff':'#222',fontWeight:600,cursor:'pointer'}}
              >
                Sort by Followers
              </button>
              <button 
                onClick={()=>setSortBy('monthly')} 
                style={{padding:'6px 14px',borderRadius:8,border:'none',background:sortBy==='monthly'?'#10b981':'#e5e7eb',color:sortBy==='monthly'?'#fff':'#222',fontWeight:600,cursor:'pointer'}}
              >
                Sort by Monthly Listeners
              </button>
            </div>
          </div>
          <div style={{marginBottom:12,fontSize:13,color:'#374151'}}>
            Showing {filteredArtists.length} artist{filteredArtists.length===1?'':'s'}{filter==='verified' ? ' (verified only)' : ' (all)'}
            {sortBy === 'followers' ? ' - sorted by followers' : sortBy === 'monthly' ? ' - sorted by monthly listeners' : ''}
          </div>

          {err && <div className={styles.error}>{err}</div>}

          {loading ? (
            <p className={styles.status}>Loading artists...</p>
          ) : filteredArtists.length === 0 ? (
            <p className={styles.status}>No artists found{filter === 'verified' ? ' (try showing all artists)' : ''}.</p>
          ) : (
            <div className={styles.grid}>
              {filteredArtists.map((m) => {
                const id = m.musicianId ?? m.MusicianId;
                const name = m.musicianName ?? m.MusicianName ?? "Unknown";
                const handle = `@${name}`;

                const followersRaw = m.FollowerCount ?? m.followerCount ?? 0;
                const monthlyRaw = m.MonthlyListenerCount ?? m.monthlyListenerCount ?? 0;

                const followers = Number(followersRaw);
                const monthly = Number(monthlyRaw);

                const avatarSrc = avatarMap[id] ?? null;

                // Context menu for artist
                const artistContextItems = [];
                const artistContextFunctions = [];
                
                if (userInfo && userInfo.musicianId !== id) {
                  artistContextItems.push("Report Artist");
                  artistContextFunctions.push(() => {
                    navigate(`/report?id=${id}&type=ARTIST`);
                  });
                }

                return (
                  <button
                    key={id}
                    type="button"
                    className={styles.card}
                    onClick={() => navigate(`/artist/${id}`)}
                    title={name}
                    style={{ position: 'relative' }}
                  >
                    {userInfo && artistContextItems.length > 0 && (
                      <ContextMenuButton 
                        right="10px" 
                        top="10px" 
                        functions={artistContextFunctions} 
                        items={artistContextItems} 
                        setContextMenu={setContextMenu} 
                      />
                    )}
                    {avatarSrc ? (
                      <img
                        src={avatarSrc}
                        alt={name}
                        className={styles.avatar}
                        loading="lazy"
                      />
                    ) : (
                      <div className={styles.avatarPlaceholder} />
                    )}

                    <div className={styles.text}>
                      <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                        <h3 className={styles.name}>{handle}</h3>
                        {(m.IsVerified === true || m.IsVerified === "true" || m.isVerified === true) && (
                          <img 
                            src={verifiedBadge} 
                            alt="Verified" 
                            style={{width: '30px', height: '30px'}}
                          />
                        )}
                      </div>
                      <p className={styles.statsLine}>
                        {followers.toLocaleString()} followers •{" "}
                        {monthly.toLocaleString()} monthly listeners
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
