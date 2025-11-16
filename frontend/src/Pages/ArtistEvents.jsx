import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router";
import Topnav from "../Components/Topnav";
import styles from "./ArtistEvents.module.css";
import "./Events.css";

const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:5062";

export default function ArtistEvents() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        setErr(null);
        setLoading(true);
        const res = await fetch(`${API}/api/event/by-musician/${id}`);
        if (!res.ok) {
          if (res.status === 404) {
            setEvents([]);
            setErr("No events found for this artist.");
          } else {
            throw new Error(
              `GET /api/event/by-musician/${id} failed (${res.status})`
            );
          }
        } else {
          const data = await res.json();
          const list = Array.isArray(data) ? data : [];
          list.sort((a, b) => new Date(b.eventTime) - new Date(a.eventTime));
          setEvents(list);
        }
      } catch (e) {
        setErr(e.message || String(e));
        setEvents([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  useEffect(() => {
    //use to load page rightly
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "instant",
    });
  }, []);

  const artistDisplay = useMemo(() => {
    for (const e of events) {
      if (e.musicianName) return e.musicianName;
      if (e.musician?.musicianName) return e.musician.musicianName;
      if (e.musician?.MusicianName) return e.musician.MusicianName;
    }
    return "Artist";
  }, [events]);

  return (
    <>
      <Topnav />
      <div className={styles.page}>
        <div className={styles.container}>
          {/*title*/}
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
                const inlineImg = e.imageBase64
                  ? `data:image/${e.imageFileExtension || "jpeg"};base64,${
                      e.imageBase64
                    }`
                  : null;
                const viewUrl = e.eventPictureFileId
                  ? `${API}/api/event/file/view/${e.eventPictureFileId}`
                  : null;
                const imgSrc = inlineImg || viewUrl;

                const dateStr = e.eventTime
                  ? new Date(e.eventTime).toLocaleDateString(undefined, {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })
                  : "—";

                const timeStr = e.eventTime
                  ? new Date(e.eventTime).toLocaleTimeString(undefined, {
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: true,
                    })
                  : "";

                const priceStr = `$${Number(e.ticketPrice ?? 0).toFixed(2)}`;

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
                        {imgSrc ? (
                          <img src={imgSrc} alt={e.title} loading="lazy" />
                        ) : (
                          <img
                            alt={e.title}
                            loading="lazy"
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
                        <div className="event-title">{e.title}</div>
                        <div className="event-artist">
                          {e.musicianName ?? e.MusicianName ?? artistDisplay}
                        </div>
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
