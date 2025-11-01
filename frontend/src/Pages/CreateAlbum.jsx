import React, { useRef, useState } from "react";
import styles from "./CreateAlbum.module.css";
import Topnav from "../Components/Topnav";
import albumArtPlaceholder from "../assets/graphics/albumartplaceholder.png";
import API from "../lib/api";

const CreateAlbum = () => {
  const [albumArtistIDs, setAlbumArtistIDs] = useState([]);
  const [songKeys, setSongKeys] = useState([]);

  const songInfo = useRef([]);
  const albumInfo = useRef({ albumTitle: "", albumOrSongArtFileId: null, musisicanIds: [], musicianIdsPerSong: [], songs: [] });

  const [songArtistIds, setSongArtistIds] = useState([]);
  const [albumArtURL, setAlbumArtURL] = useState(null);

  const onIdFieldChange = (event, ids, setIds) => {
    const id = event.target.value;

    if (id[id.length - 1] == ",") {
      ids.push(id.replace(/\D/g, ""));
      setIds(ids.slice());
      event.target.value = "";
    }
  };

  const addSong = () => {
    songKeys.push(crypto.randomUUID());
    setSongKeys(songKeys.slice());
    songArtistIds.push(albumArtistIDs.slice());
    setSongArtistIds(songArtistIds.slice());
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

  const addSongArtistId = (index, event) => {
    const s = event.target.value;
    if (s[s.length - 1] != ",") return;
    const sToAdd = s.replace(/\D/g, "");
    if (sToAdd.length == 0) return;
    if (songArtistIds[index] == null) songArtistIds[index] = [];

    event.target.value = "";
    songArtistIds[index].push(parseInt(sToAdd));
    setSongArtistIds(songArtistIds.slice());
  };

  const removeSongArtistId = (index, idIndex) => {
    songArtistIds[index].splice(idIndex, 1);
    songArtistIds[index] = songArtistIds[index].slice();
    setSongArtistIds(songArtistIds.slice());
  };

  const uploadAlbum = async () => {
    const createAlbumInfo = albumInfo.current;
    createAlbumInfo.musicianIds = albumArtistIDs;
    createAlbumInfo.musicianIdsPerSong = songArtistIds;
    createAlbumInfo.songs = songInfo.current;

    console.log(createAlbumInfo);

    response = await fetch(`${API}/api/album`, {
      method: "POST",
      credentials: "include",
      body: JSON.stringify(createAlbumInfo),
      headers: {
        "Content-Type": "application/json",
      },
    });
    console.log(response.json());
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
            <img id={styles["album-art-image"]} src={albumArtURL ?? albumArtPlaceholder} />
            <input
              type="file"
              id={styles["album-art-file-input"]}
              onChange={async (event) => {
                uploadAlbumArt(event);
                changeAlbumArtPicture(event);
              }}
            />
          </div>
          <h3>Album Title</h3>
          <input onChange={(event) => editAlbumInfo("albumTitle", event)} type="text" placeholder="Album Name" class={styles["album-text-input"]} />
          <h3>Contributing Artists (separate by commas)</h3>
          <input onChange={(event) => onIdFieldChange(event, albumArtistIDs, setAlbumArtistIDs)} type="text" placeholder="Enter IDs" class={styles["album-text-input"]} />
          <div className={styles["artist-ids"]}>
            {albumArtistIDs.map((id, index) => {
              return (
                <div
                  onClick={() => {
                    albumArtistIDs.splice(index, 1);
                    setAlbumArtistIDs(albumArtistIDs.slice());
                  }}
                  key={id}
                >
                  {id}
                </div>
              );
            })}
          </div>
        </div>

        <div id={styles["songs-list"]}>
          <div id={styles["songs-list-header"]}>
            <button onClick={addSong}>+ Add Song </button>
          </div>
          {songKeys.length == 0 && (
            <div id={styles["no-song-info"]}>
              <img src={albumArtPlaceholder}></img>
              <h1>No songs have been added!</h1>
              <h2>Click the plus to start adding songs</h2>
            </div>
          )}
          {songKeys.length > 0 && (
            <div id={styles["songs-list-body"]}>
              {songKeys.map((key, index) => {
                return (
                  <div key={key} className={styles["songs-list-entry"]}>
                    <h2>Song Name</h2>
                    <input type="text" className={styles["song-text-input"]} onChange={(event) => updateSongName(index, event.target.value)} />
                    <h2>Lyrics</h2>
                    <textarea className={styles["lyric-area"]} style={{ width: "", height: "" }} onChange={(event) => updateSongLyrics(index, event.target.value)} />
                    <h2>Song File</h2>
                    <input type="file" className={styles["song-file-input"]} onChange={(event) => uploadSongFile(index, event)} />
                    <h2>Artist IDs</h2>
                    <input onChange={(event) => addSongArtistId(index, event)} type="text" className={styles["song-text-input"]} />
                    <div className={styles["artist-ids"]}>
                      {songArtistIds[index].map((id, innerIndex) => {
                        return (
                          <div
                            onClick={() => {
                              removeSongArtistId(index, innerIndex);
                            }}
                            key={id}
                          >
                            {id}
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
        <button onClick={uploadAlbum}>submit</button>
      </main>
    </>
  );
};

export default CreateAlbum;
