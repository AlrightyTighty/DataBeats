import { useEffect, useState } from "react";
import { useParams } from "react-router";
import Topnav from "../Components/Topnav";
import styles from "./AlbumView.module.css";

const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:5062";

export default function AlbumView() {
  const { id } = useParams();
  const [album, setAlbum] = useState(null);
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const albumRes = await fetch(`${API}/api/album/${id}`);
        if (albumRes.ok) setAlbum(await albumRes.json());

        const songRes = await fetch(`${API}/api/album/${id}/songs`);
        if (songRes.ok) setSongs(await songRes.json());
      } catch (err) {
        console.error("Error loading album:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  async function handlePlayAll() {
    if (songs.length > 0) {
      location.assign(`/stream/${songs[0].songId}`);
    }
  }

  return (
    <>
      <Topnav />
      <div className={styles.page}>
        <div className={styles.container}>
          {loading ? (
            <p className={styles.centerText}>Loading album...</p>
          ) : !album ? (
            <p className={styles.centerText}>Album not found.</p>
          ) : (
            <>
              <div className={styles.top}>
                {album.albumOrSongArtFileId ? (
                  <img
                    src={`${API}/api/file/view/${album.albumOrSongArtFileId}`}
                    alt={album.albumTitle}
                    className={styles.cover}
                  />
                ) : (
                  <div className={styles.cover} />
                )}

                <div className={styles.info}>
                  <h1>{album.albumTitle}</h1>
                  <p>
                    {album.albumType} • {songs.length} song
                    {songs.length !== 1 ? "s" : ""}
                  </p>
                  <button className={styles.play} onClick={handlePlayAll}>
                    ▶ Play All
                  </button>
                </div>
              </div>

              <div className={styles.list}>
                {songs.length === 0 ? (
                  <p>No songs available in this album.</p>
                ) : (
                  songs.map((s, i) => (
                    <div key={s.songId} className={styles.row}>
                      <span>
                        {i + 1}. {s.songName}
                      </span>
                      <button
                        onClick={() => location.assign(`/stream/${s.songId}`)}
                      >
                        ▶
                      </button>
                    </div>
                  ))
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
