import React, { useRef, useState } from "react";
import styles from "./CreatePlaylist.module.css";
import Topnav from "../Components/Topnav";
import playlistArtPlaceholder from "../assets/graphics/albumartplaceholder.png";

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
    const file = event.target.files[0];
    const formData = new FormData();
    formData.set("file", file);

    const response = await fetch("http://localhost:5062/api/playlist/picture", {
      method: "POST",
      body: formData,
      credentials: "include",
    });

    const responseJson = await response.json();
    console.log(responseJson);

    playlistInfo.current.playlistArtFileId = responseJson.playlistPictureFileId;
  };

  const changePlaylistArtPicture = (event) => {
    setPlaylistArtURL(URL.createObjectURL(event.target.files[0]));
  };

  const uploadPlaylist = async () => {
    const createPlaylistInfo = playlistInfo.current;
    createPlaylistInfo.creatorIds = playlistCreatorIDs;

    console.log({
      PlaylistName: createPlaylistInfo.playlistTitle,
      PlaylistPictureId: createPlaylistInfo.playlistArtFileId,
      PlaylistDescription: createPlaylistInfo.playlistDescription,
      Access: "private",
    });

    const response = await fetch("http://localhost:5062/api/playlist", {
      method: "POST",
      credentials: "include",
      body: JSON.stringify({
        PlaylistName: createPlaylistInfo.playlistTitle,
        PlaylistPictureId: createPlaylistInfo.playlistArtFileId,
        PlaylistDescription: createPlaylistInfo.playlistDescription,
        Access: "private",
      }),
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
            <img id={styles["playlist-art-image"]} src={playlistArtURL ?? playlistArtPlaceholder} />
            <input
              type="file"
              id={styles["playlist-art-file-input"]}
              onChange={async (event) => {
                uploadPlaylistArt(event);
                changePlaylistArtPicture(event);
              }}
            />
          </div>

          <h3>Playlist Title</h3>
          <input onChange={(event) => editPlaylistInfo("playlistTitle", event)} type="text" placeholder="Playlist Name" className={styles["playlist-text-input"]} />

          <h3>Playlist Description</h3>
          <textarea className={styles["lyric-area"]} onChange={(event) => editPlaylistInfo("playlistDescription", event)} />
        </div>

        <button onClick={uploadPlaylist}>Submit</button>
      </main>
    </>
  );
};

export default CreatePlaylist;
