import React, { useState, useEffect, useRef } from "react";
import styles from "./Playbar.module.css";
import API from "../lib/api";
import { useNavigate } from "react-router";
import { usePlaybar } from "../contexts/PlaybarContext";

import { FaPlay, FaPause, FaStepBackward, FaStepForward, FaRedoAlt, FaInfoCircle, FaVolumeUp, FaVolumeMute } from "react-icons/fa";

const Playbar = () => {
  const { playbarState, setPlaybarState } = usePlaybar();
  const { songId, songList } = playbarState;

  const audioRef = useRef(null);
  const navigate = useNavigate();

  const [songInfo, setSongInfo] = useState(null);
  const [songData, setSongData] = useState(null);
  const [albumCover, setAlbumCover] = useState(null);

  const [isPlaying, setIsPlaying] = useState(true);
  const [isLooping, setIsLooping] = useState(false);
  const [volume, setVolume] = useState(50);
  const [isMuted, setIsMuted] = useState(false);
  const previousVolumeRef = useRef(50);

  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

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

      const albumArtResponse = await fetch(`${API}/api/art/${songInfo.albumArtId}`);

      setAlbumCover((await albumArtResponse.json()).fileData);
      setIsPlaying(true);
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

    // Automatically unmute when slider is moved
    if (isMuted && vol > 0) {
      setIsMuted(false);
    }
  };

  const toggleMute = () => {
    if (!audioRef.current) return;

    if (isMuted) {
      // Unmute: restore previous volume
      const restoredVolume = previousVolumeRef.current;
      setVolume(restoredVolume);
      audioRef.current.volume = restoredVolume / 100;
      setIsMuted(false);
    } else {
      // Mute: save current volume and set to 0
      previousVolumeRef.current = volume;
      setVolume(0);
      audioRef.current.volume = 0;
      setIsMuted(true);
    }
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

  const playNextSong = () => {
    if (!songList || songList.length === 0) return;

    // Find the current song index by comparing songId property
    const currentIndex = songList.findIndex(song => song.songId === songId);
    if (currentIndex === -1) return;

    // Get the next song object
    const nextIndex = (currentIndex + 1) % songList.length;
    const nextSong = songList[nextIndex];

    if (nextSong.songId === songId) {
      audioRef.current.currentTime = 0;
      return;
    }

    const newPlaybarState = Object.assign({}, playbarState);
    newPlaybarState.songId = nextSong.songId;

    setPlaybarState(newPlaybarState);
  };

  const playPrevSong = () => {
    if (!songList || songList.length === 0) return;

    // Find the current song index by comparing songId property
    const currentIndex = songList.findIndex(song => song.songId === songId);
    if (currentIndex === -1) return;

    // Get the previous song object (with proper negative modulo handling)
    const prevIndex = ((currentIndex - 1) % songList.length + songList.length) % songList.length;
    const prevSong = songList[prevIndex];

    if (prevSong.songId === songId) {
      audioRef.current.currentTime = 0;
      return;
    }

    const newPlaybarState = Object.assign({}, playbarState);
    newPlaybarState.songId = prevSong.songId;

    setPlaybarState(newPlaybarState);
  };

  const onSongEnd = () => {
    if (isLooping) {
      audioRef.current.currentTime = 0;
      return;
    }

    playNextSong();
  };

  return (
    <div className={styles.playbar}>
      {(songInfo && songData && albumCover && (
        <>
          <div className={styles.songInfo}>
            <img src={`data:image/png;base64,${albumCover}`} alt="Album Art" className={styles.albumArt} />
            <div className={styles.textInfo}>
              <div className={styles.songTitle}>{songInfo.songName}</div>
              <div className={styles.artistName}>{songInfo.artistNames.join(", ")}</div>
            </div>
          </div>

          <div className={styles.controlsSection}>
            <div className={styles.controls}>
              <button onClick={playPrevSong} className={styles.controlButton}>
                <FaStepBackward />
              </button>
              <button className={styles.controlButton} onClick={togglePlay}>
                {isPlaying ? <FaPause /> : <FaPlay />}
              </button>
              <button onClick={playNextSong} className={styles.controlButton}>
                <FaStepForward />
              </button>
              <button className={`${styles.controlButton} ${isLooping ? styles.active : ""}`} onClick={toggleLoop}>
                <FaRedoAlt />
              </button>
            </div>

            <div className={styles.progressContainer}>
              <span className={styles.time}>{formatTime(progress)}</span>
              <input type="range" min="0" max={duration || 0} value={progress} onChange={handleProgressChange} className={styles.progressBar} />
              <span className={styles.time}>{formatTime(duration)}</span>
            </div>
          </div>

          <div className={styles.rightControls}>
            <button className={styles.lyricsButton} onClick={() => navigate(`/songinfo/${songId}`)}>
              <FaInfoCircle />
            </button>
            <button className={styles.controlButton} onClick={toggleMute}>
              {isMuted ? <FaVolumeMute /> : <FaVolumeUp />}
            </button>
            <input type="range" min="0" max="100" value={volume} className={styles.volumeSlider} onChange={handleVolumeChange} />
          </div>
        </>
      )) || <div className="loader" />}
      <audio ref={audioRef} autoPlay src={songData ? `data:audio/mpeg;base64,${songData.fileData}` : null} onEnded={onSongEnd} />
    </div>
  );
};

export default Playbar;
