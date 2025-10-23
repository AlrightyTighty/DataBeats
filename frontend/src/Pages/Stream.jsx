import { useEffect, useRef, useState } from "react";
import Topnav from "../Components/Topnav";
import { useParams } from "react-router";
import styles from "./Stream.module.css";

import albumart_test from "../assets/albumart.png";

import playButton from "../assets/graphics/play button.png";
import pauseButton from "../assets/graphics/pause button.png";

const Stream = () => {
  const [songInfo, setSongInfo] = useState(null);
  const [songData, setSongData] = useState(null);
  const [albumCover, setAlbumCover] = useState(null);

  const [paused, setPaused] = useState(true);

  const audioRef = useRef(null);

  const { id } = useParams();

  const [progressPercent, setProgressPercent] = useState(0);

  const ranRef = useRef(false);

  useEffect(() => {
    if (ranRef.current) return;

    ranRef.current = true;
    console.log("erm...");
    const controller = new AbortController();
    (async () => {
      const songDataResponse = await fetch(`http://localhost:5062/api/stream/${id}`, {
        method: "PATCH",
        credentials: "include",
        signal: controller.signal,
      });

      const songInfoResponse = await fetch(`http://localhost:5062/api/song/${id}`, {
        method: "GET",
        signal: controller.signal,
      });

      console.log("made it through both requests");

      if (!songInfoResponse.ok || !songDataResponse.ok) return;

      const songInfo = await songInfoResponse.json();
      const songData = await songDataResponse.json();

      setSongInfo(songInfo);
      setSongData(songData);

      const albumArtResponse = await fetch(`http://localhost:5062/api/art/${songInfo.albumArtId}`);

      setAlbumCover((await albumArtResponse.json()).fileData);
    })();
  }, []);

  let audioBlob = null;

  if (songData != null) {
    //    console.log(songData.fileData);
    //    console.log(Uint8Array.fromBase64(songData.fileData));
    //   audioBlob = new Blob(Uint8Array.fromBase64(songData.fileData), { type: "audio/mpeg" });
    //  URL.createObjectURL(audioBlob);
  }

  // console.log(songInfo);

  const onPlayButtonPressed = async () => {
    const audioElement = audioRef.current;
    if (!audioRef) return;
    console.log("clicked and has audio");

    if (paused) await audioElement.play();
    else await audioElement.pause();
    setPaused(!paused);
  };

  const updateProgress = () => {
    const audio = audioRef.current;
    if (!audio) return;
    const percent = (audio.currentTime / audio.duration) * 100;
    setProgressPercent(isNaN(percent) ? 0 : percent);
  };

  return (
    <>
      <main id={styles["main"]}>
        {songData && (
          <div id={styles["song-info"]}>
            <img id={styles["album-art"]} src={`data:image/png;base64,${albumCover}`} />
            <div id={styles["song-right"]}>
              <div id={styles["song-right-text"]}>
                <h1 id={styles["song-title"]}>{songInfo.songName}</h1>
                <p className={styles["song-text-info-item"]}>From the album: {songInfo.albumName}</p>
                <p className={styles["song-text-info-item"]}>Artist: {songInfo.artistNames[0]}</p>
                <p className={styles["song-text-info-item"]}>Duration: {songInfo.duration}</p>
              </div>
              <div id={styles["player-controls"]}>
                <button onClick={onPlayButtonPressed} id={styles["play-button"]}>
                  <img style={{ display: paused ? "block" : "none" }} src={playButton} />
                  <img style={{ display: !paused ? "block" : "none" }} src={pauseButton} />
                </button>
                <div id={styles["play-bar"]}>
                  <div style={{ height: "100%", width: `${progressPercent}%` }} />
                </div>
              </div>
            </div>
            <audio autoPlay onTimeUpdate={updateProgress} onPause={() => setPaused(true)} onPlay={() => setPaused(false)} ref={audioRef} src={`data:audio/mpeg;base64,${songData.fileData}`}></audio>
          </div>
        )}
      </main>
    </>
  );
};

export default Stream;
