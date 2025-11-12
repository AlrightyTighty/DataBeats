import React, { useState } from "react";
import styles from "./Playbar.module.css";
import { FaPlay, FaPause, FaStepBackward, FaStepForward, FaRedoAlt, FaMusic } from "react-icons/fa";

const Playbar = ({ songId, playlistId, albumId }) => {
  // --- Test Data ---
  const testSong = {
    title: "Lost Stars",
    artist: "Adam Levine",
    albumArt: "https://i.scdn.co/image/ab67616d0000b273b7bb9cbcf4d76e9c664b5e7d",
  };

  // --- Local State ---
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLooping, setIsLooping] = useState(false);
  const [volume, setVolume] = useState(50);

  const togglePlay = () => setIsPlaying((prev) => !prev);
  const toggleLoop = () => setIsLooping((prev) => !prev);

  return (
    <div className={styles.playbar}>
      {/* Left: Song Info */}
      <div className={styles.songInfo}>
        <img src={testSong.albumArt} alt="Album Art" className={styles.albumArt} />
        <div className={styles.textInfo}>
          <div className={styles.songTitle}>{testSong.title}</div>
          <div className={styles.artistName}>{testSong.artist}</div>
        </div>
      </div>

      {/* Center: Controls */}
      <div className={styles.controls}>
        <button className={styles.controlButton}><FaStepBackward /></button>
        <button className={styles.controlButton} onClick={togglePlay}>
          {isPlaying ? <FaPause /> : <FaPlay />}
        </button>
        <button className={styles.controlButton}><FaStepForward /></button>
        <button
          className={`${styles.controlButton} ${isLooping ? styles.active : ""}`}
          onClick={toggleLoop}
        >
          <FaRedoAlt />
        </button>
      </div>

      {/* Right: Lyrics + Volume */}
      <div className={styles.rightControls}>
        <button className={styles.lyricsButton}><FaMusic /></button>
        <input
          type="range"
          min="0"
          max="100"
          value={volume}
          className={styles.volumeSlider}
          onChange={(e) => setVolume(e.target.value)}
        />
      </div>
    </div>
  );
};

export default Playbar;
