import { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router";
import Topnav from "../Components/Topnav";
import styles from "./ArtistEvents.module.css";
import "./Events.css";

const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:5062";

function formatEventDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return String(iso).split("T")[0] || String(iso);
  return d.toLocaleDateString(undefined, {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function formatEventTime(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

export default function ArtistEvents() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  const musicianId = useMemo(() => {
    const n = id ? Number(id) : null;
    return Number.isNaN(n) ? id : n;
  }, [id]);

  useEffect(() => {
    if (!musicianId) return;

    const controller = new AbortController();
    let alive = true;

    (async () => {
      setErr(null);
      setLoading(true);
      try {
        const res = await fetch(`${API}/api/event/by-musician/${musicianId}`, {
          credentials: "include",
          signal: controller.signal,
        });

        if (!res.ok) {
          if (res.status === 404) {
            if (alive) {
              setEvents([]);
              setErr("No events found for this artist.");
            }
          } else {
            const body = await res.text().catch(() => "");
            throw new Error(
              body ||
                `GET /api/event/by-musician/${musicianId} failed (${res.status})`
            );
          }
          return;
        }

        const data = await res.json();
        const list = Array.isArray(data) ? data : [];

        // sort newest to oldest
        list.sort((a, b) => {
          const ta = a && a.eventTime ? new Date(a.eventTime).getTime() : 0;
          const tb = b && b.eventTime ? new Date(b.eventTime).getTime() : 0;
          return tb - ta;
        });

        if (alive) setEvents(list);
      } catch (e) {
        if (e.name === "AbortError") {
          console.info("ArtistEvents fetch aborted for", musicianId);
          return;
        }
        console.error("Error loading events:", e);
        if (alive) {
          setErr(e.message || String(e));
          setEvents([]);
        }
      } finally {
        setTimeout(() => {
          if (alive) setLoading(false);
        }, 100);
      }
    })();

    return () => {
      alive = false;
      controller.abort();
    };
  }, [musicianId]);

  useEffect(() => {
    try {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    } catch {
      window.scrollTo(0, 0);
    }
  }, []);

  const artistDisplay = useMemo(() => {
    for (const e of events) {
      if (e.musicianName) return e.musicianName;
      if (e.MusicianName) return e.MusicianName;
    }
    return "Artist";
  }, [events]);

  const handleCardKeyDown = useCallback(
    (ev, eventId) => {
      const key = ev.key;
      if (key === "Enter" || key === " " || key === "Spacebar") {
        ev.preventDefault();
        navigate(`/event/${eventId}`);
      }
    },
    [navigate]
  );

  return (
    <>
      <Topnav />
      <div className={styles.page}>
        <div className={styles.container}>
          {/* title */}
          <h1 className={styles.title}>
            <button
              type="button"
              onClick={() => navigate(`/artist/${id}`)}
              title={`View ${artistDisplay} profile`}
              aria-label={`View ${artistDisplay} profile`}
              style={{
                appearance: "none",
                background: "none",
                border: "none",
                padding: 0,
                margin: 0,
                font: "inherit",
                color: "#79D4F7",
                cursor: "pointer",
                textDecoration: "underline",
                textUnderlineOffset: "4px",
              }}
            >
              {artistDisplay}
            </button>{" "}
            — Events
          </h1>

          {err && <div className={styles.centerText}>{err}</div>}

          {loading ? (
            <p className={styles.centerText}>Loading...</p>
          ) : events.length === 0 ? (
            <p className={styles.centerText}>No events found.</p>
          ) : (
            <div className="events-grid">
              {events.map((e) => {
                const eventId = e.eventId ?? e.EventId ?? e.id;
                const inlineImg = e.imageBase64
                  ? `data:image/${e.imageFileExtension || "jpeg"};base64,${
                      e.imageBase64
                    }`
                  : null;
                const viewUrl = e.eventPictureFileId
                  ? `${API}/api/event/file/view/${e.eventPictureFileId}`
                  : null;
                const imgSrc = inlineImg || viewUrl;

                const dateStr = formatEventDate(e.eventTime);
                const timeStr = formatEventTime(e.eventTime);
                const priceStr = `$${Number(e.ticketPrice ?? 0).toFixed(2)}`;

                const artistName =
                  e.musicianName ?? e.MusicianName ?? artistDisplay;
                const title = e.title ?? "Event";

                return (
                  <div
                    key={eventId ?? Math.random().toString(36).slice(2, 9)} // fallback key to avoid React warnings
                    className="event-card"
                    role="button"
                    tabIndex={0}
                    onClick={() => navigate(`/event/${eventId}`)}
                    onKeyDown={(ev) => handleCardKeyDown(ev, eventId)}
                    aria-label={`Open event ${title}`}
                  >
                    <div className="media">
                      <div className="media-inner">
                        {imgSrc ? (
                          <img src={imgSrc} alt={title} loading="lazy" />
                        ) : (
                          <div
                            aria-hidden
                            style={{
                              background: "#e5e7eb",
                              width: "100%",
                              height: "160px",
                              borderRadius: "12px",
                            }}
                          />
                        )}
                      </div>
                    </div>

                    <div className="event-card-content">
                      <div className="event-card-header">
                        <div className="event-title">{title}</div>
                        <div className="event-artist">{artistName}</div>
                      </div>

                      <div className="event-card-divider" />

                      <div className="event-card-footer">
                        <span className="event-meta">
                          {dateStr}
                          <br />
                          {timeStr}
                        </span>
                        <span className="event-price-badge">{priceStr}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
