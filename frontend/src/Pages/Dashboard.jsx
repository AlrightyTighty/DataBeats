import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import Topnav from "../Components/Topnav";
import { PlaylistCard } from "../Components/PlaylistCard";
import EventCard from "../Components/EventCard";
import API from "../lib/api.js";
import styles from "./Dashboard.module.css";

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

        if (!res.ok) {
          navigate("/login");
          return;
        }

        const me = await res.json();
        if (!me?.userId) {
          navigate("/login");
          return;
        }

        setUserId(me.userId);
      } catch (err) {
        console.error("Auth check failed:", err);
        navigate("/login");
      }
    })();
  }, [navigate]);

  useEffect(() => {
    if (!userId) return;

    (async () => {
      try {
        const headers = new Headers();
        headers.append("X-UserId", userId.toString());

        const [resPlaylists, resEvents] = await Promise.all([fetch(`${API}/api/playlist/me`, { credentials: "include" }), fetch(`${API}/api/event`)]);

        const playlistResponse = resPlaylists.ok ? await resPlaylists.json() : {};
        const eventsResponse = resEvents.ok ? await resEvents.json() : [];

        const owned = playlistResponse.OwnedPlaylists ?? [];
        const contrib = playlistResponse.ContributorPlaylists ?? [];
        const combined = [...owned, ...contrib].slice(0, 5);

        setPlaylists(combined);
        setEvents(eventsResponse.slice(0, 5));
      } catch (err) {
        console.error("Error loading dashboard:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [userId]);

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

        {/* Playlist Section */}
        <section className={styles.section}>
          <div className={styles.sectionHead}>
            <h2>Playlists</h2>
            <span className={styles.viewAll} onClick={() => navigate("/playlists")}>
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
                <div key={p.playlistId || p.PlaylistId} onClick={() => navigate(`/playlist/${p.PlaylistId}`)}>
                  <PlaylistCard playlist={p} />
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Events Section */}
        <section className={styles.section}>
          <div className={styles.sectionHead}>
            <h2>Events</h2>
            <span className={styles.viewAll} onClick={() => navigate("/events")}>
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
                <EventCard key={e.eventId} event={e} />
              ))}
            </div>
          )}
        </section>
      </div>
    </>
  );
}
