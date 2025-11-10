import React, { useRef, useState } from "react";
import styles from "./CreatePlaylist.module.css";
import Topnav from "../Components/Topnav";
import playlistArtPlaceholder from "../assets/graphics/albumartplaceholder.png";
import API from "../lib/api";

const CreatePlaylist = () => {
  const [playlistCreatorIDs, setPlaylistCreatorIDs] = useState([]);
  const trackInfo = useRef([]);
  const playlistInfo = useRef({
    playlistTitle: "",
    playlistArtFileId: null,
    playlistDescription: "",
    creatorIds: [],
  });

  const [playlistArtURL, setPlaylistArtURL] = useState(null);
  const [uploadError, setUploadError] = useState("");
  const [createError, setCreateError] = useState("");
  const [creating, setCreating] = useState(false);

  const onIdFieldChange = (event, ids, setIds) => {
    const id = event.target.value;
    if (id[id.length - 1] === ",") {
      ids.push(id.replace(/\D/g, ""));
      setIds(ids.slice());
      event.target.value = "";
    }
  };

  const editPlaylistInfo = (property, event) => {
    playlistInfo.current[property] = event.target.value;
  };

  const uploadPlaylistArt = async (event) => {
    setUploadError("");
    const file = event.target.files[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.set("file", file);

      const response = await fetch(`${API}/api/playlist/picture`, {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      if (!response.ok) {
        const txt = await response.text();
        throw new Error(txt || `Upload failed (${response.status})`);
      }
      const responseJson = await response.json();
      const picId = responseJson.playlistPictureFileId ?? responseJson.PlaylistPictureFileId;
      playlistInfo.current.playlistArtFileId = picId;
      if (picId) {
        setPlaylistArtURL(`${API}/api/playlist/picture/view/${picId}`);
      }
    } catch (err) {
      setUploadError(err.message);
    }
  };

  const changePlaylistArtPicture = (event) => {
    setPlaylistArtURL(URL.createObjectURL(event.target.files[0]));
  };

  const uploadPlaylist = async () => {
  setCreateError("");
    if (creating) return;
    const info = playlistInfo.current;
    if (!info.playlistTitle.trim()) {
      setCreateError("Playlist title is required.");
      return;
    }
    setCreating(true);
    try {
      const response = await fetch(`${API}/api/playlist`, {
        method: "POST",
        credentials: "include",
        body: JSON.stringify({
          PlaylistName: info.playlistTitle,
          PlaylistPictureId: info.playlistArtFileId || 0,
          PlaylistDescription: info.playlistDescription,
          Access: "private",
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        const txt = await response.text();
        throw new Error(txt || `Create failed (${response.status})`);
      }
  
    } catch (err) {
      setCreateError(err.message);
    } finally {
      setCreating(false);
    }
  };

  return (
    <>
      <Topnav />
      <main id={styles["main"]}>
        <h1 className={styles["h1"]} style={{ margin: "0.25em 0" }}>
          Create Playlist
        </h1>
        <h2 className={styles["h2"]} style={{ margin: "0.25em 0" }}>
          Fill out all the fields to create your playlist
        </h2>

        <div id={styles["playlist-info"]}>
          <h1 className={styles["h1"]} style={{ margin: 0 }}>
            Playlist Details
          </h1>
          <h3>Playlist Art</h3>
          <div id={styles["playlist-art-select"]}>
            <img id={styles["playlist-art-image"]} src={playlistArtURL ?? playlistArtPlaceholder} alt="Playlist art preview" />
            <input
              type="file"
              accept="image/png"
              id={styles["playlist-art-file-input"]}
              onChange={async (event) => {
                changePlaylistArtPicture(event);
                await uploadPlaylistArt(event);
              }}
            />
            {uploadError && <div className={styles.error}>{uploadError}</div>}
          </div>

          <h3>Playlist Title</h3>
          <input onChange={(event) => editPlaylistInfo("playlistTitle", event)} type="text" placeholder="Playlist Name" className={styles["playlist-text-input"]} />

          <h3>Playlist Description</h3>
          <textarea className={styles["lyric-area"]} onChange={(event) => editPlaylistInfo("playlistDescription", event)} />
        </div>

        <button onClick={uploadPlaylist}>
          Submit
        </button>
      </main>
    </>
  );
};

export default CreatePlaylist;
