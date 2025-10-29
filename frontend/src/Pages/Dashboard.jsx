import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import Topnav from "../Components/Topnav";
import styles from "./Dashboard.module.css";

const API = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:5062";

export default function Dashboard() {
  const [recentSongs, setRecentSongs] = useState([]);
  const [genres, setGenres] = useState(["Pop", "Rock", "R&B"]);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API}/api/song/recent`);
        if (res.ok) setRecentSongs(await res.json());
        else {
          setRecentSongs([
            { songId: 1, title: "Light Waves", artist: "Ava Gray", genre: "Pop" },
            { songId: 2, title: "Night Rider", artist: "Eli Stone", genre: "Rock" },
            { songId: 3, title: "Echo Heart", artist: "Nova Ray", genre: "R&B" },
          ]);
        }
      } catch (e) {
        console.error(e);
      }
    })();
  }, []);

  const handlePlay = (id) => navigate(`/stream/${id}`);

  return (
    <>
      <Topnav />
      <div className={styles.page}>
        {/* Main Buttons Row */}
        <div className={styles.taskbar}>
          <button onClick={() => navigate("/new")} className={styles.btn}>
            <div className={styles.btnHighlight}></div>
            <span>New</span>
          </button>

          <button onClick={() => navigate("/playlists")} className={styles.btn}>
            <div className={styles.btnHighlight}></div>
            <span>Playlist</span>
          </button>

          <button onClick={() => navigate("/following/1")} className={styles.btn}>
            <div className={styles.btnHighlight}></div>
            <span>Artist</span>
          </button>

          <button onClick={() => navigate("/album/1")} className={styles.btn}>
            <div className={styles.btnHighlight}></div>
            <span>Album</span>
          </button>

          <button onClick={() => navigate("/events")} className={styles.btn}>
            <div className={styles.btnHighlight}></div>
            <span>Event</span>
          </button>
        </div>

        {/* Recommended / Genres */}
        {genres.map((g, index) => (
          <section key={index} className={styles.genreSection}>
            <div className={styles.sectionHead}>
              <h2>{g}</h2>
              <a href="/new" className={styles.viewAll}>View All</a>
            </div>

            <div className={styles.songGrid}>
              {recentSongs
                .filter((s) => s.genre === g)
                .slice(0, 5)
                .map((s) => (
                  <div key={s.songId} className={styles.songCard}>
                    <div className={styles.cover}></div>
                    <div className={styles.songText}>
                      <h3>{s.title}</h3>
                      <p>{s.artist}</p>
                    </div>
                    <button onClick={() => handlePlay(s.songId)} className={styles.playBtn}>
                      ▶
                    </button>
                  </div>
                ))}
            </div>
          </section>
        ))}
      </div>
    </>
  );
}


/*import { useEffect, useState } from "react";
import Topnav from "../Components/Topnav";
import styles from "./Dashboard.module.css";

const API = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:5062";
const CURRENT_USER_ID = 1;

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const resUser = await fetch(`${API}/api/user/${CURRENT_USER_ID}`);
        if (resUser.ok) setUser(await resUser.json());

        const resAlbums = await fetch(`${API}/api/album/new`);
        if (resAlbums.ok) setAlbums(await resAlbums.json());
      } catch (err) {
        console.error("Error loading dashboard:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <>
      <Topnav />
      <div className={styles.page}>
        <div className={styles.wrap}>
          <div className={styles.hero}>
            <h1 className={styles.h1}>
              Welcome back{user ? `, ${user.username}` : ""}!
            </h1>

            <div className={styles.quick}>
              <a className={styles.card} href="/new">New</a>
              <a className={styles.card} href="/playlists">Playlists</a>
              <a className={styles.card} href="/events">Events</a>
              <a className={styles.card} href="/search?query=top">Discover</a>
            </div>
          </div>

          <div className={styles.section}>
            <div className={styles.sectionHead}>
              <div className={styles.sectionTitle}>Recommended Genres</div>
              <a className={styles.link} href="/search?query=genres">View all</a>
            </div>
            <div className={styles.grid4}>
              {["Pop", "Rock", "Hip-Hop", "R&B", "Indie", "EDM"].slice(0, 4).map((g) => (
                <a key={g} className={styles.tile} href={`/search?query=${encodeURIComponent(g)}`}>
                  {g}
                </a>
              ))}
            </div>
          </div>

          <div className={styles.section}>
            <div className={styles.sectionHead}>
              <div className={styles.sectionTitle}>New Releases</div>
              <a className={styles.link} href="/new">View all</a>
            </div>

            {loading ? (
              <p>Loading...</p>
            ) : albums.length === 0 ? (
              <p>No new releases yet.</p>
            ) : (
              <div className={styles.scroller}>
                {albums.slice(0, 10).map((a) => (
                  <a key={a.albumId} href={`/album/${a.albumId}`} className={styles.albumCard}>
                    {a.albumOrSongArtFileId ? (
                      <img
                        src={`${API}/api/file/view/${a.albumOrSongArtFileId}`}
                        alt={a.albumTitle}
                        className={styles.art}
                      />
                    ) : (
                      <div className={styles.art}></div>
                    )}
                    <div className={styles.caption}>
                      {a.albumTitle}
                      <br />
                      <span className={styles.artist}>
                        {(a.artists && a.artists.join(", ")) || "Unknown Artist"}
                      </span>
                    </div>
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
*/