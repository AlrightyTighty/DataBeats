import React, { useState, useEffect, useRef } from "react";
import styles from "./Playbar.module.css";
import API from "../lib/api";

import {
  FaPlay,
  FaPause,
  FaStepBackward,
  FaStepForward,
  FaRedoAlt,
  FaMusic,
} from "react-icons/fa";

const Playbar = ({ playbarState }) => {
  const { songId, playlistId, albumId } = playbarState;

  const audioRef = useRef(null);

  const [songInfo, setSongInfo] = useState(null);
  const [songData, setSongData] = useState(null);
  const [albumCover, setAlbumCover] = useState(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isLooping, setIsLooping] = useState(false);
  const [volume, setVolume] = useState(50);
  const [progress, setProgress] = useState(0); // in seconds
  const [duration, setDuration] = useState(0); // in seconds

  useEffect(() => {
    const controller = new AbortController();

    (async () => {
      const songDataResponse = await fetch(`${API}/api/stream/${songId}`, {
        method: "PATCH",
        credentials: "include",
        signal: controller.signal,
      });

      const songInfoResponse = await fetch(`${API}/api/song/${songId}`, {
        method: "GET",
        signal: controller.signal,
      });

      if (!songInfoResponse.ok || !songDataResponse.ok) return;

      const songInfo = await songInfoResponse.json();
      const songData = await songDataResponse.json();

      setSongInfo(songInfo);
      setSongData(songData);

      const albumArtResponse = await fetch(
        `${API}/api/art/${songInfo.albumArtId}`
      );

      setAlbumCover((await albumArtResponse.json()).fileData);
    })();

    return () => {
      controller.abort();
      setSongInfo(null);
      setSongData(null);
      setAlbumCover(null);
      setIsPlaying(false);
      setProgress(0);
      setDuration(0);
    };
  }, [playbarState]);

  // --- Playback Controls ---
  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) audioRef.current.pause();
    else audioRef.current.play();
    setIsPlaying((prev) => !prev);
  };

  const toggleLoop = () => {
    if (!audioRef.current) return;
    audioRef.current.loop = !isLooping;
    setIsLooping((prev) => !prev);
  };

  const handleVolumeChange = (e) => {
    const vol = e.target.value;
    setVolume(vol);
    if (audioRef.current) audioRef.current.volume = vol / 100;
  };

  const handleProgressChange = (e) => {
    const time = e.target.value;
    setProgress(time);
    if (audioRef.current) audioRef.current.currentTime = time;
  };

  const formatTime = (sec) => {
    const minutes = Math.floor(sec / 60);
    const seconds = Math.floor(sec % 60)
      .toString()
      .padStart(2, "0");
    return `${minutes}:${seconds}`;
  };

  useEffect(() => {
    console.log("i'm effecting it ohhh i'm effecting it");
    if (!audioRef.current) return;

    console.log("doin da stuffs :3");
    const audio = audioRef.current;

    const updateProgress = () => {
      setProgress(audio.currentTime);
      setDuration(audio.duration || 0);
    };

    audio.addEventListener("timeupdate", updateProgress);
    audio.addEventListener("loadedmetadata", updateProgress);

    return () => {
      audio.removeEventListener("timeupdate", updateProgress);
      audio.removeEventListener("loadedmetadata", updateProgress);
    };
  }, [songData, audioRef.current]);

  return (
    <div className={styles.playbar}>
      {(songInfo && songData && albumCover && (
        <>
          {/* Left: Song Info */}
          <div className={styles.songInfo}>
            <img
              src={`data:image/png;base64,${albumCover}`}
              alt="Album Art"
              className={styles.albumArt}
            />
            <div className={styles.textInfo}>
              <div className={styles.songTitle}>{songInfo.songName}</div>
              <div className={styles.artistName}>
                {songInfo.artistNames.join(", ")}
              </div>
            </div>
          </div>

          {/* Center: Controls */}
          <div className={styles.controlsSection}>
            <div className={styles.controls}>
              <button className={styles.controlButton}>
                <FaStepBackward />
              </button>
              <button className={styles.controlButton} onClick={togglePlay}>
                {isPlaying ? <FaPause /> : <FaPlay />}
              </button>
              <button className={styles.controlButton}>
                <FaStepForward />
              </button>
              <button
                className={`${styles.controlButton} ${
                  isLooping ? styles.active : ""
                }`}
                onClick={toggleLoop}
              >
                <FaRedoAlt />
              </button>
            </div>

            {/* Progress Bar */}
            <div className={styles.progressContainer}>
              <span className={styles.time}>{formatTime(progress)}</span>
              <input
                type="range"
                min="0"
                max={duration || 0}
                value={progress}
                onChange={handleProgressChange}
                className={styles.progressBar}
              />
              <span className={styles.time}>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Right: Lyrics + Volume */}
          <div className={styles.rightControls}>
            <button className={styles.lyricsButton}>
              <FaMusic />
            </button>
            <input
              type="range"
              min="0"
              max="100"
              value={volume}
              className={styles.volumeSlider}
              onChange={handleVolumeChange}
            />
          </div>

          <audio
            ref={audioRef}
            autoPlay
            src={`data:audio/mpeg;base64,${songData.fileData}`}
          />
        </>
      )) || <div className="loader" />}
    </div>
  );
};

export default Playbar;
