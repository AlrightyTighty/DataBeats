import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import useMe from "./UseMe";
import styles from "./UserMenu.module.css";

const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:5062";

export default function UserMenu() {
  const { me } = useMe();
  const [avatarSrc, setAvatarSrc] = useState(null);
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const containerRef = useRef(null);

  useEffect(() => {
    if (!me) {
      setAvatarSrc(null);
      return;
    }

    const inlineData = me.profilePictureImage ?? me.ProfilePictureImage;
    const inlineExt = me.fileExtension ?? me.FileExtension;
    if (inlineData && inlineExt) {
      setAvatarSrc(`data:image/${inlineExt};base64,${inlineData}`);
      return;
    }

    const fileId =
      me.profilePictureFileId ??
      me.ProfilePictureFileId ??
      me.profilePictureFileID ??
      null;

    if (!fileId) {
      setAvatarSrc(null);
      return;
    }

    let dead = false;
    (async () => {
      try {
        const res = await fetch(`${API}/api/images/profile-picture/${fileId}`);
        if (!res.ok) {
          if (!dead) setAvatarSrc(null);
          return;
        }
        const data = await res.json();
        const fileData = data.fileData ?? data.FileData;
        const fileExt = data.fileExtension ?? data.FileExtension ?? "png";
        if (!fileData) {
          if (!dead) setAvatarSrc(null);
          return;
        }
        if (!dead) {
          setAvatarSrc(`data:image/${fileExt};base64,${fileData}`);
        }
      } catch {
        if (!dead) setAvatarSrc(null);
      }
    })();

    return () => {
      dead = true;
    };
  }, [me]);

  useEffect(() => {
    function handleClick(e) {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function showMessage(text) {
    setMessage(text);
    setTimeout(() => setMessage(""), 3000);
  }

  const userId = me?.userId ?? me?.UserId ?? null;
  const musicianId = me?.musicianId ?? me?.MusicianId ?? null;

  async function handleMusician() {
    if (!userId) {
      navigate("/login");
      return;
    }
    if (musicianId) {
      navigate(`/musician-dashboard/${musicianId}`);
      return;
    }
    showMessage("No musician account. Go to Settings to create one.");
  }

  async function handleAdmin() {
    if (!userId) {
      navigate("/login");
      return;
    }
    try {
      const r = await fetch(`${API}/api/admin/stats`, {
        headers: { "X-UserId": String(userId) },
      });
      if (r.ok) {
        navigate("/admin");
      } else {
        showMessage("You may not have access to admin.");
      }
    } catch {
      showMessage("Unable to check admin access.");
    }
  }

  function handleSettings() {
    navigate("/settings");
  }

  function handleLogout() {
    navigate("/logout");
  }

  return (
    <div className={styles.wrapper} ref={containerRef}>
      <button
        type="button"
        className={styles.avatarButton}
        onClick={() => setOpen((v) => !v)}
      >
        {avatarSrc ? (
          <img src={avatarSrc} alt="Profile" className={styles.avatar} />
        ) : (
          <div className={styles.avatarFallback} />
        )}
      </button>

      {open && (
        <div className={styles.menu}>
          <button type="button" onClick={handleMusician}>
            Musician
          </button>
          <button type="button" onClick={handleAdmin}>
            Admin
          </button>
          <button type="button" onClick={handleSettings}>
            Settings
          </button>
          <button type="button" onClick={handleLogout}>
            Log Out
          </button>
        </div>
      )}

      {message && <div className={styles.toast}>{message}</div>}
    </div>
  );
}
