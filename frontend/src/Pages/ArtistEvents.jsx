import { useEffect, useState } from "react";
import { useParams } from "react-router";
import Topnav from "../Components/Topnav";
import styles from "./ArtistEvents.module.css";

const API = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:5062";

export default function ArtistEvents() {
  const { id } = useParams();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API}/api/event/artist/${id}`);
        if (res.ok) {
          const data = await res.json();
          setEvents(data);
        } else {
          setEvents([]);
        }
      } catch (err) {
        console.error("Error loading artist events:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  return (
    <>
      <Topnav />
      <div className={styles.page}>
        <div className={styles.container}>
          <h1>Events by Artist</h1>

          {loading ? (
            <p className={styles.centerText}>Loading...</p>
          ) : events.length === 0 ? (
            <p className={styles.centerText}>No events found for this artist.</p>
          ) : (
            <div className={styles.grid}>
              {events.map((e) => (
                <a
                  key={e.eventId}
                  href={`/event/${e.eventId}`}
                  className={styles.card}
                >
                  {e.eventPictureFileId ? (
                    <img
                      src={`${API}/api/file/view/${e.eventPictureFileId}`}
                      alt={e.title}
                      className={styles.img}
                    />
                  ) : (
                    <div className={styles.placeholder} />
                  )}

                  <div className={styles.info}>
                    <h3>{e.title}</h3>
                    {e.musicianName && (
                      <p className={styles.artist}>{e.musicianName}</p>
                    )}
                    <p className={styles.date}>
                      {new Date(e.eventTime).toLocaleDateString(undefined, {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                    <p className={styles.price}>
                      {e.ticketPrice && e.ticketPrice > 0
                        ? `$${e.ticketPrice.toFixed(2)}`
                        : "Free"}
                    </p>
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
