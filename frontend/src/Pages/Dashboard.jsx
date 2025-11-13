import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import Topnav from "../Components/Topnav";
import { PlaylistCard } from "../Components/PlaylistCard";
import EventCard from "../Components/EventCard";
import API from "../lib/api";
import useMe from "../Components/UseMe";
import styles from "./Dashboard.module.css";

export default function Dashboard() {
  const navigate = useNavigate();
  const { me, loading: authLoading } = useMe();
  const userId = useMemo(() => me?.userId ?? me?.UserId ?? null, [me]);

  const [playlists, setPlaylists] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!userId) return;
    (async () => {
      try {
        setLoading(true);
        const [resPlaylists, resEvents] = await Promise.all([
          fetch(`${API}/api/playlist/me`, { credentials: "include" }),
          fetch(`${API}/api/event`, { credentials: "include" }),
        ]);

        const playlistResponse = resPlaylists.ok
          ? await resPlaylists.json()
          : {};
        const eventsResponse = resEvents.ok ? await resEvents.json() : [];

        const owned =
          playlistResponse.ownedPlaylists ??
          playlistResponse.OwnedPlaylists ??
          [];
        const contrib =
          playlistResponse.contributorPlaylists ??
          playlistResponse.ContributorPlaylists ??
          [];
        const combined = [...owned, ...contrib].slice(0, 5);

        setPlaylists(combined);
        setEvents(
          (Array.isArray(eventsResponse) ? eventsResponse : []).slice(0, 5)
        );
      } catch (err) {
        console.error("Error loading dashboard:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [authLoading, userId]);

  return (
    <>
      <Topnav />
      <div className={styles.page}>
        <div className={styles.taskbar}>
          <button onClick={() => navigate("/new")} className={styles.btn}>
            <div className={styles.btnHighlight}></div>
            <span>New</span>
          </button>

          <button onClick={() => navigate("/playlists")} className={styles.btn}>
            <div className={styles.btnHighlight}></div>
            <span>Playlist</span>
          </button>

          <button
            onClick={() => {
              if (!userId) return;
              const musicianId = me?.musicianId ?? me?.MusicianId ?? null;
              if (musicianId) {
                navigate(`/musician/${musicianId}`);
              } else {
                navigate(`/artists`);
              }
            }}
            disabled={!userId}
            className={styles.btn}
          >
            <div className={styles.btnHighlight}></div>
            <span>Like</span>
          </button>

          <button onClick={() => navigate("/playlists")} className={styles.btn}>
            <div className={styles.btnHighlight}></div>
            <span>Album</span>
          </button>

          <button onClick={() => navigate("/events")} className={styles.btn}>
            <div className={styles.btnHighlight}></div>
            <span>Event</span>
          </button>

          <button onClick={() => navigate("/history")} className={styles.btn}>
            <div className={styles.btnHighlight}></div>
            <span>History</span>
          </button>
        </div>

        <section className={styles.section}>
          <div className={styles.sectionHead}>
            <h2>Playlists</h2>
            <span
              className={styles.viewAll}
              onClick={() => navigate("/playlists")}
            >
              View All
            </span>
          </div>
          {loading ? (
            <p>Loading playlists...</p>
          ) : playlists.length === 0 ? (
            <p>No playlists found.</p>
          ) : (
            <div className={styles.cardGrid}>
              {playlists.map((p) => {
                const id = p.playlistId ?? p.PlaylistId;
                return (
                  <div key={id} onClick={() => navigate(`/playlist/${id}`)}>
                    <PlaylistCard playlist={p} />
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHead}>
            <h2>Events</h2>
            <span
              className={styles.viewAll}
              onClick={() => navigate("/events")}
            >
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
                <EventCard key={e.eventId ?? e.EventId} event={e} />
              ))}
            </div>
          )}
        </section>
      </div>
    </>
  );
}
