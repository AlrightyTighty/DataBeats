import { useEffect, useState } from "react";
import Topnav from "../Components/Topnav";
import { useParams } from "react-router";
import styles from "./Stream.module.css"

const Stream = () => {
  const [songInfo, setSongInfo] = useState(null);
  const [songData, setSongData] = useState(null);

  const { id } = useParams();

  useEffect(() => {
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

      setSongInfo(await songInfoResponse.json());
      setSongData(await songDataResponse.json());
    })();

    return () => controller.abort("Remount");
  }, []);

  let audioBlob = null;

  if (songData != null) {
    console.log(songData.fileData);
    console.log(Uint8Array.fromBase64(songData.fileData));
    audioBlob = new Blob(Uint8Array.fromBase64(songData.fileData), { type: "audio/mpeg" });
    URL.createObjectURL(audioBlob);
  }

  return (
    <>
      <Topnav />
      <main>
        <div id={styles['song-info']}>
          {/*<img src={}/>*/}
            {songData && <audio controls src={`data:audio/mpeg;base64,${songData.fileData}`}></audio>}
        </div>
        
      </main>
      
    </>
  );
};

export default Stream;
