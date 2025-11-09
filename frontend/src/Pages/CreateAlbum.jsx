import React, { useRef, useState } from "react";
import { useNavigate } from "react-router";
import styles from "./CreateAlbum.module.css";
import Topnav from "../Components/Topnav";
import albumArtPlaceholder from "../assets/graphics/albumartplaceholder.png";
import API from "../lib/api";

const CreateAlbum = () => {
  const navigate = useNavigate();

  // Album-level contributing musician names (was albumArtistIDs)
  const [albumArtistNames, setAlbumArtistNames] = useState([]);

  // Song keys for rendering
  const [songKeys, setSongKeys] = useState([]);

  // Mutable refs holding richer data not tied to renders
  const songInfo = useRef([]); // array of { songName, lyrics, songFileId }
  const albumInfo = useRef({
    albumTitle: "",
    albumOrSongArtFileId: null,
    musicianNames: [], // album-level musician names
    musiciansPerSong: [], // array per song: array of musician names
    genresPerSong: [], // array per song: array of genre strings
    songs: [],
  });

  // musicians per song (for UI state)
  const [musiciansPerSong, setMusiciansPerSong] = useState([]);

  // genres per song (for UI state)
  const [genresPerSong, setGenresPerSong] = useState([]);

  const [albumArtURL, setAlbumArtURL] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Generic "comma-delimited entry" handler for names (album-level)
  const onNameFieldChange = (event, namesArray, setNames) => {
    const raw = event.target.value;
    if (!raw) return;
    if (raw[raw.length - 1] === ",") {
      const name = raw.slice(0, -1).trim();
      if (name.length === 0) {
        event.target.value = "";
        return;
      }
      namesArray.push(name);
      setNames(namesArray.slice());
      event.target.value = "";
    }
  };

  // Add a new empty song and initialize per-song arrays
  const addSong = () => {
    songKeys.push(crypto.randomUUID());
    setSongKeys(songKeys.slice());

    // initialize musicians per-song with a shallow copy of album-level names
    musiciansPerSong.push(albumArtistNames.slice());
    setMusiciansPerSong(musiciansPerSong.slice());

    // initialize genres per-song empty
    genresPerSong.push([]);
    setGenresPerSong(genresPerSong.slice());
  };

  const editAlbumInfo = (property, event) => {
    albumInfo.current[property] = event.target.value;
  };

  const uploadAlbumArt = async (event) => {
    const file = event.target.files[0];
    const formData = new FormData();
    formData.set("file", file);

    const response = await fetch(`${API}/api/art`, {
      method: "POST",
      body: formData,
      credentials: "include",
    });

    const responseJson = await response.json();
    console.log(responseJson);

    albumInfo.current.albumOrSongArtFileId = responseJson.albumOrSongArtFileId;
  };

  const changeAlbumArtPicture = (event) => {
    setAlbumArtURL(URL.createObjectURL(event.target.files[0]));
  };

  // Song fields updates
  const updateSongName = (index, name) => {
    if (songInfo.current[index] == null) songInfo.current[index] = { songName: "", lyrics: "", songFileId: null };
    songInfo.current[index].songName = name;
  };

  const updateSongLyrics = (index, lyrics) => {
    if (songInfo.current[index] == null) songInfo.current[index] = { songName: "", lyrics: "", songFileId: null };
    songInfo.current[index].lyrics = lyrics;
  };

  const updateSongFileId = (index, songFileId) => {
    if (songInfo.current[index] == null) songInfo.current[index] = { songName: "", lyrics: "", songFileId: null };
    songInfo.current[index].songFileId = songFileId;
  };

  const uploadSongFile = async (index, event) => {
    const file = event.target.files[0];
    const formData = new FormData();
    formData.set("file", file);

    const response = await fetch(`${API}/api/song/file`, {
      method: "POST",
      body: formData,
      credentials: "include",
    });

    const responseJson = await response.json();
    console.log(responseJson);
    updateSongFileId(index, responseJson.songFileId);
  };

  // Per-song musician name (comma-terminated) input
  const addSongMusicianName = (index, event) => {
    const s = event.target.value;
    if (!s) return;
    if (s[s.length - 1] !== ",") return;
    const nameToAdd = s.slice(0, -1).trim();
    if (nameToAdd.length === 0) {
      event.target.value = "";
      return;
    }
    if (musiciansPerSong[index] == null) musiciansPerSong[index] = [];
    musiciansPerSong[index].push(nameToAdd);
    setMusiciansPerSong(musiciansPerSong.slice());
    event.target.value = "";
  };

  const removeSongMusicianName = (index, nameIndex) => {
    if (!musiciansPerSong[index]) return;
    musiciansPerSong[index].splice(nameIndex, 1);
    musiciansPerSong[index] = musiciansPerSong[index].slice();
    setMusiciansPerSong(musiciansPerSong.slice());
  };

  // Per-song genre input (up to 3), comma-terminated
  const addSongGenre = (index, event) => {
    const s = event.target.value;
    if (!s) return;
    if (s[s.length - 1] !== ",") return;
    const genreToAdd = s.slice(0, -1).trim();
    if (genreToAdd.length === 0) {
      event.target.value = "";
      return;
    }
    if (genresPerSong[index] == null) genresPerSong[index] = [];
    // limit to 3 genres per song
    if (genresPerSong[index].length >= 3) {
      event.target.value = "";
      return;
    }
    genresPerSong[index].push(genreToAdd);
    setGenresPerSong(genresPerSong.slice());
    event.target.value = "";
  };

  const removeSongGenre = (index, genreIndex) => {
    if (!genresPerSong[index]) return;
    genresPerSong[index].splice(genreIndex, 1);
    genresPerSong[index] = genresPerSong[index].slice();
    setGenresPerSong(genresPerSong.slice());
  };

  // album-level name input handler wrapper
  const onAlbumNameFieldChange = (e) => onNameFieldChange(e, albumArtistNames, setAlbumArtistNames);

  // remove album-level musician name
  const removeAlbumMusicianName = (index) => {
    albumArtistNames.splice(index, 1);
    setAlbumArtistNames(albumArtistNames.slice());
  };

  // When submitting, pass:
  // createAlbumInfo.musicianNames (album-level),
  // createAlbumInfo.musiciansPerSong,
  // createAlbumInfo.genresPerSong,
  // songs from songInfo.current
  const uploadAlbum = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    const createAlbumInfo = albumInfo.current;
    createAlbumInfo.musicianNames = albumArtistNames.slice();
    createAlbumInfo.musicianNamesPerSong = musiciansPerSong.slice();
    createAlbumInfo.genresPerSong = genresPerSong.slice();
    createAlbumInfo.songs = songInfo.current;

    console.log("sending createAlbumInfo:", createAlbumInfo);

    try {
      const response = await fetch(`${API}/api/album`, {
        method: "POST",
        credentials: "include",
        body: JSON.stringify(createAlbumInfo),
        headers: {
          "Content-Type": "application/json",
        },
      });

      const responseJson = await response.json();
      // If request failed (non-2xx) or body doesn't include albumId -> failure
      if (!response.ok || !responseJson || !responseJson.albumId) {
        alert("album creation failed");
        setIsSubmitting(false);
        return;
      }

      // success -> route to album
      const albumId = responseJson.albumId;
      navigate(`/album/${albumId}`);
    } catch (err) {
      console.error(err);
      alert("album creation failed");
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Topnav />
      <main id={styles["main"]}>
        <h1 className={styles["h1"]} style={{ margin: "0.25em 0" }}>
          Create Album
        </h1>
        <h2 className={styles["h2"]} style={{ margin: "0.25em 0" }}>
          Fill out all the fields to create your album
        </h2>

        <div id={styles["album-info"]}>
          <h1 className={styles["h1"]} style={{ margin: 0 }}>
            Album Details
          </h1>

          <h3>Album Art</h3>
          <div id={styles["album-art-select"]}>
            <img id={styles["album-art-image"]} src={albumArtURL ?? albumArtPlaceholder} alt="album art" />
            <input
              type="file"
              id={styles["album-art-file-input"]}
              onChange={async (event) => {
                uploadAlbumArt(event);
                changeAlbumArtPicture(event);
              }}
              accept=".png"
            />
          </div>

          <h3>Album Title</h3>
          <input onChange={(event) => editAlbumInfo("albumTitle", event)} type="text" placeholder="Album Name" className={styles["album-text-input"]} />

          <h3>Contributing Musicians (separate by commas)</h3>
          <input onChange={onAlbumNameFieldChange} type="text" placeholder="Enter musician names, comma to add" className={styles["album-text-input"]} />
          <div className={styles["artist-ids"]}>
            {albumArtistNames.map((name, index) => {
              return (
                <div
                  onClick={() => {
                    removeAlbumMusicianName(index);
                  }}
                  key={`${name}-${index}`}
                >
                  {name}
                </div>
              );
            })}
          </div>
        </div>

        <div id={styles["songs-list"]}>
          <div id={styles["songs-list-header"]}>
            <button onClick={addSong}>+ Add Song </button>
          </div>

          {songKeys.length === 0 && (
            <div id={styles["no-song-info"]}>
              <img src={albumArtPlaceholder} alt="placeholder" />
              <h1>No songs have been added!</h1>
              <h2>Click the plus to start adding songs</h2>
            </div>
          )}

          {songKeys.length > 0 && (
            <div id={styles["songs-list-body"]}>
              {songKeys.map((key, index) => {
                const musiciansForThisSong = musiciansPerSong[index] ?? [];
                const genresForThisSong = genresPerSong[index] ?? [];

                return (
                  <div key={key} className={styles["songs-list-entry"]}>
                    <h2>Song Name</h2>
                    <input type="text" className={styles["song-text-input"]} onChange={(event) => updateSongName(index, event.target.value)} />

                    <h2>Lyrics</h2>
                    <textarea className={styles["lyric-area"]} style={{ width: "", height: "" }} onChange={(event) => updateSongLyrics(index, event.target.value)} />

                    <h2>Song File</h2>
                    <input accept=".mp3" type="file" className={styles["song-file-input"]} onChange={(event) => uploadSongFile(index, event)} />

                    <h2>Contributing Musicians (separate by commas)</h2>
                    <input onChange={(event) => addSongMusicianName(index, event)} type="text" className={styles["song-text-input"]} placeholder="Type a name, end with comma" />
                    <div className={styles["artist-ids"]}>
                      {musiciansForThisSong.map((mName, innerIndex) => {
                        return (
                          <div
                            onClick={() => {
                              removeSongMusicianName(index, innerIndex);
                            }}
                            key={`${mName}-${innerIndex}`}
                          >
                            {mName}
                          </div>
                        );
                      })}
                    </div>

                    <h2>Genres (max 3, separate by commas)</h2>
                    <input onChange={(event) => addSongGenre(index, event)} type="text" className={styles["song-text-input"]} placeholder="Type a genre, end with comma" />
                    <div className={styles["artist-ids"]}>
                      {genresForThisSong.map((g, gi) => {
                        return (
                          <div
                            onClick={() => {
                              removeSongGenre(index, gi);
                            }}
                            key={`${g}-${gi}`}
                          >
                            {g}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div style={{ marginTop: "24px", display: "flex", gap: "12px", alignItems: "center" }}>
          <button onClick={uploadAlbum} disabled={isSubmitting} className={styles["submit-button"]} aria-disabled={isSubmitting}>
            {isSubmitting ? "Creating album..." : "Submit"}
          </button>

          {/* global loader (your global css already has styling for `.loader`) */}
          {isSubmitting && <div className="loader" aria-hidden="true" />}
        </div>
      </main>
    </>
  );
};

export default CreateAlbum;
