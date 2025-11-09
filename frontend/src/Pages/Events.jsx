import { useEffect, useState } from "react";
import { useLocation } from "react-router";
import bed from "../assets/graphics/test_image_bed.jpg"; // fallback if no image available
import "./Events.css";

const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:5062";

export default function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const [msg, setMsg] = useState(null);
  const location = useLocation();

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

  // If redirected here right after creating, show a banner and optimistically prepend
  useEffect(() => {
    const created = location.state?.justCreated;
    if (created) {
      setMsg("Event created ✅");
      setEvents(prev => [created, ...prev]);
      // clear state so refresh doesn't repeat banner
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  return (
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
          // Prefer inline base64 from your API, else use view endpoint, else local fallback
          const inlineImg = e.imageBase64
            ? `data:image/${e.imageFileExtension || "jpeg"};base64,${e.imageBase64}`
            : null;
          const viewUrl = e.eventPictureFileId ? `${API}/api/event/file/view/${e.eventPictureFileId}` : null;
          const imgSrc = inlineImg || viewUrl || bed;

          return (
            <div key={e.eventId} className="event-card">
              <div className="media">
                <img src={imgSrc} alt={e.title} loading="lazy" />
              </div>
              <div className="body">
                <div className="event-title">{e.title}</div>
                <div style={{ color: '#374151', fontSize: 14 }}>{e.musicianName ?? e.MusicianName}</div>
                <div className="event-meta">{new Date(e.eventTime).toLocaleString()}</div>
                <div className="event-price">${Number(e.ticketPrice ?? 0).toFixed(2)}</div>
                {e.eventDescription && <div className="event-card-desc">{e.eventDescription}</div>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
