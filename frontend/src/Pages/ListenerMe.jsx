import {useEffect,useState} from"react";
import Topnav from"../Components/Topnav";
import styles from"./ListenerProfile.module.css";
const API=import.meta.env.VITE_API_BASE_URL||"http://127.0.0.1:5062";
export default function ListenerMe(){
  const[me,setMe]=useState(null);
  useEffect(()=>{(async()=>{const r=await fetch(`${API}/api/user/1`);if(r.ok)setMe(await r.json());})();},[]);
  return(<>
    <Topnav/>
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.left}>
          <div className={styles.avatar}/>
          <div>
            <h1>{me?.username||"My Profile"}</h1>
            <p>{me?.email||"-"}</p>
            <div className={styles.actions}>
              <a href="/settings" className={styles.btn}>Edit Settings</a>
              <a href={`/followers/${me?.userId||0}`} className={styles.btnSec}>Followers</a>
              <a href={`/following/${me?.userId||0}`} className={styles.btnSec}>Following</a>
            </div>
          </div>
        </div>
        <div className={styles.right}>
          <div className={styles.card}>
            <h2>Top Songs</h2>
            {[1,2,3,4,5].map(i=>(
              <div key={i} className={styles.songRow}>
                <span>Song {i}</span>
                <button onClick={()=>location.assign(`/stream/${i}`)}>▶</button>
              </div>
            ))}
          </div>
          <div className={styles.card}>
            <h2>Quick Links</h2>
            <div className={styles.pills}>
              <a href="/new">New Releases</a>
              <a href="/playlists">Playlists</a>
              <a href="/events">Events</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </>);
}
