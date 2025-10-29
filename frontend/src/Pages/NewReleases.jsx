import { useEffect, useState } from "react";
import Topnav from "../Components/Topnav";
import styles from "./NewReleases.module.css";

const API = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:5062";

export default function NewReleases() {
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API}/api/album/new`);
        if (res.ok) {
          const data = await res.json();
          setAlbums(data);
        }
      } catch (err) {
        console.error("Error loading new releases:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <>
      <Topnav />
      <div className={styles.page}>
        <div className={styles.container}>
          <h1>New Releases</h1>

          {loading ? (
            <p>Loading...</p>
          ) : albums.length === 0 ? (
            <p>No new releases found.</p>
          ) : (
            <div className={styles.grid}>
              {albums.map((a) => (
                <a key={a.albumId} href={`/album/${a.albumId}`} className={styles.card}>
                  {a.albumOrSongArtFileId ? (
                    <img
                      src={`${API}/api/file/view/${a.albumOrSongArtFileId}`}
                      alt={a.albumTitle}
                      className={styles.cover}
                    />
                  ) : (
                    <div className={styles.cover}></div>
                  )}
                  <div className={styles.text}>
                    <h3>{a.albumTitle}</h3>
                    <p>
                      {(a.artists && a.artists.join(", ")) || "Unknown Artist"} •{" "}
                      {new Date(a.releaseDate).getFullYear()}
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
