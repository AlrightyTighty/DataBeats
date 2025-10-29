import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import Topnav from "../Components/Topnav";
import styles from "./Dashboard.module.css";

const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:5062";

export default function Dashboard() {
  const navigate = useNavigate();
  const [userId, setUserId] = useState(null);
  const [playlists, setPlaylists] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API}/api/me`, {
          credentials: "include",
        });
        if (res.ok) {
          const data = await res.json();
          setUserId(data.userId);
        } // else navigate("/login");
      } catch (err) {
        console.error("Auth check failed:", err);
        // navigate("/login");
      }
    })();
  }, [navigate]);

  useEffect(() => {
    (async () => {
      try {
        const [resPlaylists, resEvents] = await Promise.all([fetch(`${API}/api/playlist/me`, { credentials: "include" }), fetch(`${API}/api/event`, { credentials: "include" })]);

        const playlistsData = resPlaylists.ok ? await resPlaylists.json() : [];
        const eventsData = resEvents.ok ? await resEvents.json() : [];

        setPlaylists(playlistsData.slice(0, 5));
        setEvents(eventsData.slice(0, 5));
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
        {/* Taskbar Buttons */}
        <div className={styles.taskbar}>
          <button onClick={() => navigate("/new")} className={styles.btn}>
            <div className={styles.btnHighlight}></div>
            <span>New</span>
          </button>

          <button onClick={() => navigate("/playlists")} className={styles.btn}>
            <div className={styles.btnHighlight}></div>
            <span>Playlist</span>
          </button>

          <button onClick={() => userId && navigate(`/following/${userId}`)} disabled={!userId} className={styles.btn}>
            <div className={styles.btnHighlight}></div>
            <span>Artist</span>
          </button>

          <button onClick={() => navigate("/playlists")} className={styles.btn}>
            <div className={styles.btnHighlight}></div>
            <span>Album</span>
          </button>

          <button onClick={() => navigate("/events")} className={styles.btn}>
            <div className={styles.btnHighlight}></div>
            <span>Event</span>
          </button>
        </div>

        {/* Playlist Section  */}
        <section className={styles.section}>
          <div className={styles.sectionHead}>
            <h2>Playlists</h2>
            <span onClick={() => navigate("/playlists")} className={styles.viewAll}>
              View All
            </span>
          </div>

          {loading ? (
            <p>Loading playlists...</p>
          ) : playlists.length === 0 ? (
            <p>No playlists found.</p>
          ) : (
            <div className={styles.cardGrid}>
              {playlists.map((p) => (
                <div key={p.playlistId} className={styles.card} onClick={() => navigate(`/playlist/${p.playlistId}`)}>
                  <div className={styles.cardImage}></div>
                  <h3>{p.playlistTitle}</h3>
                  <p>{p.playlistDescription || "No description"}</p>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Events Section */}
        <section className={styles.section}>
          <div className={styles.sectionHead}>
            <h2>Events</h2>
            <span onClick={() => navigate("/events")} className={styles.viewAll}>
              View All
            </span>
          </div>

          {loading ? (
            <p>Loading events...</p>
          ) : events.length === 0 ? (
            <p>No events available.</p>
          ) : (
            <div className={styles.cardGrid}>
              {events.map((e) => (
                <div key={e.eventId} className={styles.card} onClick={() => navigate(`/event/${e.eventId}`)}>
                  <div className={styles.cardImage}></div>
                  <h3>{e.eventTitle}</h3>
                  <p>{e.location || e.date || "No details"}</p>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </>
  );
}
