import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import Topnav from "../Components/Topnav";
import "./Events.css";

const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:5062";

export default function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const [msg, setMsg] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setErr(null);
        const res = await fetch(`${API}/api/event`, { headers: { "Cache-Control": "no-store" } });
        if (!res.ok) throw new Error(`GET /api/event failed (${res.status})`);
        const data = await res.json();
        setEvents(Array.isArray(data) ? data : []);
      } catch (e) {
        setErr(e.message || String(e));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    const created = location.state?.justCreated;
    if (created) {
      setMsg("Event created ✅");
      setEvents(prev => [created, ...prev]);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  return (
    <>
      <Topnav />

    <div className="events-page">
      <h1>Events</h1>

      {msg && (
        <div style={{
          background: "#1f3d28ff",
          color: "#0a5d2a",
          padding: "8px 12px",
          borderRadius: 8,
          marginBottom: 12,
          border: "1px solid #bfe5c9"
        }}>
          {msg}
        </div>
      )}

      {loading && <div>Loading events…</div>}
      {err && (
        <div style={{
          background: "#fdecec",
          color: "#8a1a1a",
          padding: "8px 12px",
          borderRadius: 8,
          marginBottom: 12,
          border: "1px solid #f2b8b8"
        }}>
          {err}
        </div>
      )}

      {!loading && !err && events.length === 0 && (
        <div style={{ opacity: 0.7 }}>No events yet. Create one!</div>
      )}

      <div className="events-grid">
        {events.map(e => {
          const inlineImg = e.imageBase64
            ? `data:image/${e.imageFileExtension || "jpeg"};base64,${e.imageBase64}`
            : null;
          const viewUrl = e.eventPictureFileId ? `${API}/api/event/file/view/${e.eventPictureFileId}` : null;
          const imgSrc = inlineImg || viewUrl || bed;
  //added pathway to /events/id
  return (
<div
  key={e.eventId}
  className="event-card"
  onClick={() => navigate(`/event/${e.eventId}`)}
  tabIndex={0}
  onKeyDown={(ev) => {
    if (ev.key === "Enter" || ev.key === " ") {
      navigate(`/event/${e.eventId}`);
    }
  }}
>
  <div className="media">
    <div className="media-inner">
      <img src={imgSrc} alt={e.title} loading="lazy" />
    </div>
  </div>

  <div className="event-card-content">
    <div className="event-card-header">
      <div className="event-title">{e.title}</div>
      <div className="event-artist">
        {e.musicianName ?? e.MusicianName}
      </div>
    </div>

    <div className="event-card-divider" /> {}

    <div className="event-card-footer">
      <span className="event-meta">
        {new Date(e.eventTime).toLocaleDateString(undefined, {
          month: "long",
          day: "numeric",
          year: "numeric",
        })}{" "}
        <br />
        {" "}
        {new Date(e.eventTime).toLocaleTimeString(undefined, {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        })}
      </span>
      <span className="event-price-badge">
        ${Number(e.ticketPrice ?? 0).toFixed(2)}
      </span>
    </div>
  </div>
</div>
    );

        })}
      </div>
    </div>
    </>
  );
}
