import React, { useEffect, useState } from "react";
import { useParams } from "react-router";
import Topnav from "../Components/Topnav";
import styles from "./Artist.module.css";

const API = "http://localhost:5062";

export default function Artist() {
  const { id } = useParams();
  const [artist, setArtist] = useState(null);
  const [topSongs, setTopSongs] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [events, setEvents] = useState([]);

  useEffect(() => {
    (async () => {
      const res = await fetch(`${API}/api/musician/${id}`);
      if (res.ok) setArtist(await res.json());
    })();
  }, [id]);

  useEffect(() => {
    setTopSongs([
      { songId: 1, songName: "Track One", duration: "3:21", streams: 12034 },
      { songId: 2, songName: "Track Two", duration: "2:58", streams: 9876 },
      { songId: 3, songName: "Track Three", duration: "4:11", streams: 8501 },
      { songId: 4, songName: "Track Four", duration: "2:44", streams: 7920 },
      { songId: 5, songName: "Track Five", duration: "3:05", streams: 7312 },
    ]);
    setAlbums([
      { albumId: 101, title: "First Light", meta: "2025 • 10 songs" },
      { albumId: 102, title: "Midnight Drive", meta: "2024 • 4 songs" },
    ]);
    setEvents([
      { eventId: 1, title: "Summer Beats", artistName: "Artist", date: "2025" },
      { eventId: 2, title: "Live in LA", artistName: "Artist", date: "2024" },
    ]);
  }, [id]);

  return (
    <>
      <Topnav />
      <main className={styles.page}>
        {/* Artist Header */}
        <section className={styles.artistHeader}>
          <div className={styles.artistImage}></div>
          <div className={styles.artistDetails}>
            <h1>{artist?.musicianName || "Artist Name"}</h1>
            <p>
              Followers: {artist?.followerCount || 0} • Monthly listeners:{" "}
              {artist?.monthlyListenerCount || 0}
            </p>
          </div>
        </section>

        {/* About Me + Top Songs */}
        <section className={styles.aboutAndSongs}>
          <div className={styles.aboutBox}>
            <h2>About Me</h2>
            <p>{artist?.bio || "Artist bio description"}</p>
          </div>

          <div className={styles.songsBox}>
            <h2>Top 5 Songs</h2>
            <div className={styles.songList}>
              {topSongs.map((s) => (
                <div key={s.songId} className={styles.songRow}>
                  <span>{s.songName}</span>
                  <span>{s.duration}</span>
                  <span>{s.streams.toLocaleString()} plays</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Albums */}
        <section className={styles.albumsSection}>
          <div className={styles.sectionHeader}>
            <h2>Albums</h2>
            <span className={styles.viewAll}>View All</span>
          </div>
          <div className={styles.albumGrid}>
            {albums.map((a) => (
              <div key={a.albumId} className={styles.albumCard}>
                <div className={styles.albumCover}></div>
                <h3>{a.title}</h3>
                <p>{a.meta}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Events */}
        <section className={styles.eventsSection}>
          <div className={styles.sectionHeader}>
            <h2>Events</h2>
            <span className={styles.viewAll}>View All</span>
          </div>
          <div className={styles.eventGrid}>
            {events.map((e) => (
              <div key={e.eventId} className={styles.eventCard}>
                <div className={styles.eventImage}></div>
                <h3>{e.title}</h3>
                <p>{e.artistName}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}