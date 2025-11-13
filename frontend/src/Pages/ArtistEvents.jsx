import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router";
import Topnav from "../Components/Topnav";
import styles from "./ArtistEvents.module.css";

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

  const artistDisplay = useMemo(() => {
    for (const e of events) {
      if (e.musicianName) return e.musicianName;
      if (e.musician?.musicianName) return e.musician.musicianName;
    }
    return "Artist";
  }, [events]);

  return (
    <>
      <Topnav />
      <div className={styles.page}>
        <div className={styles.container}>
          <h1 className={styles.title}>
            <button
              type="button"
              className={styles.artistLink}
              onClick={() => navigate(`/artist/${id}`)}
              title={`View ${artistDisplay} profile`}
              aria-label={`View ${artistDisplay} profile`}
            >
              {artistDisplay}
            </button>
            <span className={styles.sep}> — </span>
            <span>Events</span>
          </h1>

          {err && <div className={styles.centerText}>{err}</div>}

          {loading ? (
            <p className={styles.centerText}>Loading...</p>
          ) : events.length === 0 ? (
            <p className={styles.centerText}>No events found.</p>
          ) : (
            <div className={styles.grid}>
              {events.map((ev) => {
                const imgFromId = ev.eventPictureFileId
                  ? `${API}/api/event/file/view/${ev.eventPictureFileId}`
                  : null;
                const imgFromDto =
                  ev.imageBase64 && ev.imageFileExtension
                    ? `data:image/${ev.imageFileExtension};base64,${ev.imageBase64}`
                    : null;
                const coverSrc = imgFromId || imgFromDto;

                const dateStr = ev.eventTime
                  ? new Date(ev.eventTime).toLocaleString(undefined, {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    })
                  : "—";

                const priceStr =
                  typeof ev.ticketPrice === "number"
                    ? `$${ev.ticketPrice.toFixed(2)}`
                    : ev.ticketPrice ?? "—";

                const desc =
                  ev.eventDescription ||
                  ev.description ||
                  ev.EventDescription ||
                  "";

                return (
                  <button
                    key={ev.eventId}
                    type="button"
                    className={styles.card}
                    onClick={() => navigate(`/event/${ev.eventId}`)}
                    title={ev.title}
                  >
                    {coverSrc ? (
                      <img
                        src={coverSrc}
                        alt={ev.title}
                        className={styles.cover}
                        loading="lazy"
                      />
                    ) : (
                      <div className={styles.coverPlaceholder} />
                    )}

                    <div className={styles.body}>
                      <h3 className={styles.eventTitle}>{ev.title}</h3>

                      <div className={styles.meta}>
                        <span className={styles.date}>{dateStr}</span>
                        <span className={styles.dot}>•</span>
                        <span className={styles.price}>{priceStr}</span>
                      </div>

                      {desc && <p className={styles.desc}>{desc}</p>}
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
