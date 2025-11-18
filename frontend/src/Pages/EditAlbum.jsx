import React, { useRef, useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { FaTrash } from "react-icons/fa";
import styles from "./CreateAlbum.module.css";
import Topnav from "../Components/Topnav";
import albumArtPlaceholder from "../assets/graphics/albumartplaceholder.png";
import API from "../lib/api";
import useAuthentication from "../hooks/useAuthentication";
import { useModal } from "../contexts/ModalContext";

const EditAlbum = () => {
  const navigate = useNavigate();
  const { id: albumId } = useParams();
  const user = useAuthentication();

  // Current user's musician name
  const [currentMusicianName, setCurrentMusicianName] = useState(null);

  // Fetch current user's musician name
  useEffect(() => {
    if (!user || !user.musicianId) return;

    const fetchMusicianName = async () => {
      try {
        const response = await fetch(`${API}/api/musician/${user.musicianId}`);
        const data = await response.json();
        if (data && data.musicianName) {
          setCurrentMusicianName(data.musicianName);
        }
      } catch (err) {
        console.error("Failed to fetch musician name:", err);
      }
    };

    fetchMusicianName();
  }, [user]);

  // Album-level contributing musician names
  const [albumArtistNames, setAlbumArtistNames] = useState([]);

  // Song keys for rendering (includes both existing and new songs)
  const [songKeys, setSongKeys] = useState([]);

  // Track original song data from server
  const originalSongs = useRef([]);

  // Track which songs are original vs new
  const songMetadata = useRef([]); // array of { isNew: boolean, originalSongId?: number }

  // Mutable refs holding richer data not tied to renders
  const songInfo = useRef([]); // array of { songName, lyrics, songFileId }
  const albumInfo = useRef({
    albumTitle: "",
    albumOrSongArtFileId: null,
    musicianNames: [],
    musiciansPerSong: [],
    genresPerSong: [],
    songs: [],
  });

  // musicians per song (for UI state)
  const [musiciansPerSong, setMusiciansPerSong] = useState([]);

  // genres per song (for UI state)
  const [genresPerSong, setGenresPerSong] = useState([]);

  const [albumArtURL, setAlbumArtURL] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  const { showAlert, showConfirm, showModal } = useModal();

  // Load existing album data
  useEffect(() => {
    if (!user || !albumId) return;

    const fetchAlbumData = async () => {
      try {
        // Fetch album info
        const albumResponse = await fetch(
          `${API}/api/album/${albumId}?includeImageData=true`,
          {
            credentials: "include",
          }
        );
        const albumData = await albumResponse.json();

        // Fetch songs for the album
        const songsResponse = await fetch(`${API}/api/album/songs/${albumId}`, {
          credentials: "include",
        });
        const songsData = await songsResponse.json();

        // Check authorization
        if (user.musicianId !== albumData.createdBy) {
          navigate(`/album/${albumId}`, { replace: true });
          return;
        }

        // Populate album info
        albumInfo.current.albumTitle = albumData.albumTitle;
        albumInfo.current.albumOrSongArtFileId = albumData.albumOrSongArtFileId;
        setAlbumArtURL(`data:image/png;base64,${albumData.albumArtImage}`);

        // Populate album artists (filter out current user's name)
        const artistNames = albumData.artists
          .map((a) => a.artistName)
          .filter((name) => name !== currentMusicianName);
        setAlbumArtistNames(artistNames);

        // Populate songs
        const keys = [];
        const metadata = [];
        const songInfoArray = [];
        const musiciansArray = [];
        const genresArray = [];

        for (const song of songsData) {
          keys.push(crypto.randomUUID());
          metadata.push({ isNew: false, originalSongId: song.songId });
          songInfoArray.push({
            songName: song.songName,
            lyrics: song.lyrics || "",
            songFileId: song.songFileId,
          });
          // Filter out current user's name from per-song musicians
          const songMusicians = (song.artistNames || []).filter(
            (name) => name !== currentMusicianName
          );
          musiciansArray.push(songMusicians);
          genresArray.push(song.genres || []);
        }

        setSongKeys(keys);
        songMetadata.current = metadata;
        songInfo.current = songInfoArray;
        setMusiciansPerSong(musiciansArray);
        setGenresPerSong(genresArray);
        originalSongs.current = songsData;

        setIsLoading(false);
      } catch (error) {
        console.error("Failed to load album data:", error);
        setValidationError("Failed to load album data");
        setIsLoading(false);
      }
    };

    fetchAlbumData();
  }, [user, albumId, navigate, currentMusicianName]);

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
      // Prevent duplicates (check against existing names and current user's name)
      if (namesArray.includes(name) || name === currentMusicianName) {
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

    songMetadata.current.push({ isNew: true });

    // initialize musicians per-song with a shallow copy of album-level names
    musiciansPerSong.push(albumArtistNames.slice());
    setMusiciansPerSong(musiciansPerSong.slice());

    // initialize genres per-song empty
    genresPerSong.push([]);
    setGenresPerSong(genresPerSong.slice());
  };

  // Remove a song from the list
  const removeSong = (index) => {
    // Remove from all arrays
    songKeys.splice(index, 1);
    songMetadata.current.splice(index, 1);
    songInfo.current.splice(index, 1);
    musiciansPerSong.splice(index, 1);
    genresPerSong.splice(index, 1);

    // Update state
    setSongKeys(songKeys.slice());
    setMusiciansPerSong(musiciansPerSong.slice());
    setGenresPerSong(genresPerSong.slice());
  };

  const editAlbumInfo = (property, event) => {
    albumInfo.current[property] = event.target.value;
  };

  const uploadAlbumArt = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

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
    if (songInfo.current[index] == null)
      songInfo.current[index] = { songName: "", lyrics: "", songFileId: null };
    songInfo.current[index].songName = name;
  };

  const updateSongLyrics = (index, lyrics) => {
    if (songInfo.current[index] == null)
      songInfo.current[index] = { songName: "", lyrics: "", songFileId: null };
    songInfo.current[index].lyrics = lyrics;
  };

  const updateSongFileId = (index, songFileId) => {
    if (songInfo.current[index] == null)
      songInfo.current[index] = { songName: "", lyrics: "", songFileId: null };
    songInfo.current[index].songFileId = songFileId;
  };

  const uploadSongFile = async (index, event) => {
    const file = event.target.files[0];
    if (!file) return;

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
    // Prevent duplicates (check against existing names and current user's name)
    if (
      musiciansPerSong[index].includes(nameToAdd) ||
      nameToAdd === currentMusicianName
    ) {
      event.target.value = "";
      return;
    }
    musiciansPerSong[index].push(nameToAdd);
    setMusiciansPerSong(musiciansPerSong.slice());
    event.target.value = "";
  };

  const removeSongMusicianName = (index, nameIndex) => {
    if (!musiciansPerSong[index]) return;
    // Prevent removal of current user's name (though it shouldn't be in the array)
    if (musiciansPerSong[index][nameIndex] === currentMusicianName) return;
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
  const onAlbumNameFieldChange = (e) =>
    onNameFieldChange(e, albumArtistNames, setAlbumArtistNames);

  // remove album-level musician name
  const removeAlbumMusicianName = (index) => {
    // Prevent removal of current user's name (though it shouldn't be in the array)
    if (albumArtistNames[index] === currentMusicianName) return;
    albumArtistNames.splice(index, 1);
    setAlbumArtistNames(albumArtistNames.slice());
  };

  // Validate album before submission
  const validateAlbum = () => {
    // Check if album has a title
    if (!albumInfo.current.albumTitle || !albumInfo.current.albumTitle.trim()) {
      return "Album title is required";
    }

    // Check if there is at least one song
    if (songKeys.length === 0) {
      return "At least one song is required";
    }

    // Check if each song has at least one genre
    for (let i = 0; i < songKeys.length; i++) {
      const genres = genresPerSong[i] || [];
      if (genres.length === 0) {
        return `Song ${i + 1} must have at least one genre`;
      }
    }

    return null; // No errors
  };

  const updateAlbum = async () => {
    if (isSubmitting) return;

    // Validate album before submitting
    const error = validateAlbum();
    if (error) {
      setValidationError(error);
      return;
    }

    setValidationError("");
    setIsSubmitting(true);

    try {
      // Build the request payload
      const songsToRemove = [];
      const songsToAdd = [];
      const songsToEdit = [];

      // Find songs that were deleted (were in original but not in current list)
      const currentOriginalSongIds = new Set();
      songMetadata.current.forEach((meta, index) => {
        if (!meta.isNew) {
          currentOriginalSongIds.add(meta.originalSongId);
        }
      });

      originalSongs.current.forEach((song) => {
        if (!currentOriginalSongIds.has(song.songId)) {
          songsToRemove.push(song.songId);
        }
      });

      // Categorize current songs
      songMetadata.current.forEach((meta, index) => {
        const song = songInfo.current[index];
        const songDto = {
          SongName: song.songName,
          Lyrics: song.lyrics || "",
          SongFileId: song.songFileId,
          ArtistNames: musiciansPerSong[index] || [],
          Genres: genresPerSong[index] || [],
        };

        if (meta.isNew) {
          // New song
          songsToAdd.push(songDto);
        } else {
          // Existing song (edited)
          songsToEdit.push({
            SongId: meta.originalSongId,
            songInfo: songDto,
          });
        }
      });

      const editRequest = {
        AlbumTitle: albumInfo.current.albumTitle,
        AlbumOrSongArtFileId: albumInfo.current.albumOrSongArtFileId,
        ArtistNames: albumArtistNames,
        SongsToRemove: songsToRemove,
        SongsToAdd: songsToAdd,
        SongsToEdit: songsToEdit,
      };

      console.log("Sending edit request:", editRequest);

      const response = await fetch(`${API}/api/album/${albumId}`, {
        method: "PATCH",
        credentials: "include",
        body: JSON.stringify(editRequest),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const txt = await response.text();
        throw new Error(txt || `Edit failed (${response.status})`);
      }

      // Success - navigate to album page
      navigate(`/album/${albumId}`);
    } catch (err) {
      console.error(err);
      setValidationError(err.message || "Failed to update album");
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteAlbum = async () => {
    if (isDeleting || isSubmitting) return;

    showConfirm(
      "Are you sure you want to delete this album? This action cannot be undone.",
      "Delete Album",
      async () => {
        setIsDeleting(true);
        try {
          const response = await fetch(`${API}/api/album/${albumId}`, {
            method: "DELETE",
            credentials: "include",
          });

          if (!response.ok) {
            const txt = await response.text();
            throw new Error(txt || `Delete failed (${response.status})`);
          }

          // Success - navigate to dashboard or home
          navigate("/dashboard");
        } catch (err) {
          console.error(err);
          showAlert("Error", err.message || "Failed to delete album");
        } finally {
          setIsDeleting(false);
        }
      },
      () => {
        console.log("Cancelled");
      },
      { confirmText: "Delete", confirmVariant: "danger" }
    );
  };

  if (isLoading || !user) {
    return (
      <>
        <Topnav />
        <main id={styles["main"]}>
          <h1 className={styles["h1"]}>Loading...</h1>
        </main>
      </>
    );
  }

  return (
    <>
      <Topnav />
      <main id={styles["main"]}>
        <h1 className={styles["h1"]} style={{ margin: "0.25em 0" }}>
          Edit Album
        </h1>
        <h2 className={styles["h2"]} style={{ margin: "0.25em 0" }}>
          Update your album information
        </h2>

        <div id={styles["album-info"]}>
          <h1 className={styles["h1"]} style={{ margin: 0 }}>
            Album Details
          </h1>

          <h3>Album Art</h3>
          <div id={styles["album-art-select"]}>
            <img
              id={styles["album-art-image"]}
              src={albumArtURL ?? albumArtPlaceholder}
              alt="album art"
            />
            <input
              type="file"
              id={styles["album-art-file-input"]}
              onChange={async (event) => {
                changeAlbumArtPicture(event);
                await uploadAlbumArt(event);
              }}
              accept=".png"
            />
          </div>

          <h3>Album Title</h3>
          <input
            onChange={(event) => editAlbumInfo("albumTitle", event)}
            type="text"
            placeholder="Album Name"
            className={styles["album-text-input"]}
            defaultValue={albumInfo.current.albumTitle}
          />

          <h3>Contributing Musicians (separate by commas)</h3>
          <input
            onChange={onAlbumNameFieldChange}
            type="text"
            placeholder="Enter musician names, comma to add"
            className={styles["album-text-input"]}
          />
          <div className={styles["artist-ids"]}>
            {currentMusicianName && (
              <div className={styles["current-user-artist"]} key="current-user">
                {currentMusicianName}
              </div>
            )}
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
                const songData = songInfo.current[index] || {};

                return (
                  <div key={key} className={styles["songs-list-entry"]}>
                    <div className={styles["song-entry-header"]}>
                      <h2>Song {index + 1}</h2>
                      <button
                        className={styles["delete-song-button"]}
                        onClick={() => removeSong(index)}
                        aria-label="Delete song"
                      >
                        <FaTrash />
                      </button>
                    </div>

                    <h2>Song Name</h2>
                    <input
                      type="text"
                      className={styles["song-text-input"]}
                      defaultValue={songData.songName}
                      onChange={(event) =>
                        updateSongName(index, event.target.value)
                      }
                    />

                    <h2>Lyrics</h2>
                    <textarea
                      className={styles["lyric-area"]}
                      style={{ width: "", height: "" }}
                      defaultValue={songData.lyrics}
                      onChange={(event) =>
                        updateSongLyrics(index, event.target.value)
                      }
                    />

                    <h2>Song File</h2>
                    <input
                      accept=".mp3"
                      type="file"
                      className={styles["song-file-input"]}
                      onChange={(event) => uploadSongFile(index, event)}
                    />

                    <h2>Contributing Musicians (separate by commas)</h2>
                    <input
                      onChange={(event) => addSongMusicianName(index, event)}
                      type="text"
                      className={styles["song-text-input"]}
                      placeholder="Type a name, end with comma"
                    />
                    <div className={styles["artist-ids"]}>
                      {currentMusicianName && (
                        <div
                          className={styles["current-user-artist"]}
                          key={`song-${index}-current-user`}
                        >
                          {currentMusicianName}
                        </div>
                      )}
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
                    <input
                      onChange={(event) => addSongGenre(index, event)}
                      type="text"
                      className={styles["song-text-input"]}
                      placeholder="Type a genre, end with comma"
                    />
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

        <div
          style={{
            marginTop: "24px",
            display: "flex",
            gap: "12px",
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <button
            onClick={updateAlbum}
            disabled={isSubmitting || isDeleting}
            className={styles["submit-button"]}
            aria-disabled={isSubmitting}
          >
            {isSubmitting ? "Updating album..." : "Update Album"}
          </button>

          <button
            onClick={deleteAlbum}
            disabled={isSubmitting || isDeleting}
            className={styles["delete-album-button"]}
            aria-disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete Album"}
          </button>

          {(isSubmitting || isDeleting) && (
            <div className="loader" aria-hidden="true" />
          )}
        </div>

        {validationError && (
          <div
            className={styles["validation-error"]}
            style={{ marginTop: "12px", color: "#ff6b6b", fontSize: "14pt" }}
          >
            {validationError}
          </div>
        )}
      </main>
    </>
  );
};

export default EditAlbum;
