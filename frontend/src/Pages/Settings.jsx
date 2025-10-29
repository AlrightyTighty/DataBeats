import { useEffect, useState } from "react";
import Topnav from "../Components/Topnav";
import styles from "./Settings.module.css";

const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:5062";
const CURRENT_USER_ID = 1;

export default function Settings() {
  const [profile, setProfile] = useState({
    username: "",
    fname: "",
    lname: "",
    profilePictureFileId: null,
  });

  const [auth, setAuth] = useState({
    email: "",
    password: "",
  });

  const [preview, setPreview] = useState(null);
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    (async () => {
      const res = await fetch(`${API}/api/user/${CURRENT_USER_ID}`);
      if (res.ok) {
        const data = await res.json();
        setProfile({
          username: data.username || "",
          fname: data.fname || "",
          lname: data.lname || "",
          profilePictureFileId: data.profilePictureFileId || null,
        });
        if (data.profilePictureFileId)
          setPreview(`${API}/api/file/view/${data.profilePictureFileId}`);
      }

      const resAuth = await fetch(`${API}/api/authentication/${CURRENT_USER_ID}`);
      if (resAuth.ok) {
        const data = await resAuth.json();
        setAuth({
          email: data.email || "",
          password: "",
        });
      }
    })();
  }, []);

  async function uploadProfilePic() {
    if (!file) return null;
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch(`${API}/api/file/upload`, {
      method: "POST",
      body: formData,
    });
    if (res.ok) {
      const { fileId } = await res.json();
      return fileId;
    }
    return null;
  }

  async function saveProfile() {
    setMessage("");
    let newPicId = profile.profilePictureFileId;
    if (file) {
      const uploaded = await uploadProfilePic();
      if (uploaded) newPicId = uploaded;
    }

    const res = await fetch(`${API}/api/user/${CURRENT_USER_ID}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: profile.username,
        fname: profile.fname,
        lname: profile.lname,
        profilePictureFileId: newPicId,
      }),
    });

    setMessage(res.ok ? "Profile info updated." : "Error updating profile.");
  }

  async function saveAuth() {
    setMessage("");
    const res = await fetch(`${API}/api/authentication/${CURRENT_USER_ID}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: auth.email,
        password: auth.password,
      }),
    });

    setMessage(res.ok ? "Account info updated." : "Error updating account info.");
  }

  return (
    <>
      <Topnav />
      <div className={styles.page}>
        <div className={styles.container}>

          {/* Left side: Profile */}
          <div className={styles.left}>
            <h2>Profile Info</h2>

            <div className={styles.picWrap}>
              {preview ? (
                <img src={preview} className={styles.pic} alt="Profile" />
              ) : (
                <div className={styles.picPlaceholder}>No Image</div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  setFile(e.target.files[0]);
                  setPreview(URL.createObjectURL(e.target.files[0]));
                }}
              />
            </div>

            <label>
              First Name
              <input
                value={profile.fname}
                onChange={(e) => setProfile({ ...profile, fname: e.target.value })}
              />
            </label>

            <label>
              Last Name
              <input
                value={profile.lname}
                onChange={(e) => setProfile({ ...profile, lname: e.target.value })}
              />
            </label>

            <label>
              Display Name
              <input
                value={profile.username}
                onChange={(e) => setProfile({ ...profile, username: e.target.value })}
              />
            </label>

            <button className={styles.save} onClick={saveProfile}>
              Save Profile
            </button>
          </div>

          {/* Right side: Authentication */}
          <div className={styles.right}>
            <h2>Account (Authentication)</h2>
            <label>
              Email
              <input
                type="email"
                value={auth.email}
                onChange={(e) => setAuth({ ...auth, email: e.target.value })}
              />
            </label>

            <label>
              Password
              <input
                type="password"
                value={auth.password}
                onChange={(e) => setAuth({ ...auth, password: e.target.value })}
                placeholder="Enter new password"
              />
            </label>

            <button className={styles.save} onClick={saveAuth}>
              Save Account
            </button>

            {message && <p style={{ marginTop: "10px" }}>{message}</p>}
          </div>
        </div>
      </div>
    </>
  );
}
