import { useState } from "react";
import styles from "./AddUserModal.module.css";

export default function AddUserModal({ isOpen, onClose, onAdd }) {
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  async function submit() {
    if (!username.trim()) {
      setError("Enter a username.");
      setStatus("");
      return;
    }

    try {
      setSubmitting(true);
      setError("");
      setStatus("");

      await onAdd(username.trim());

      setStatus("User added");
      setTimeout(() => setStatus(""), 3000);
    } catch (e) {
      const msg = String(e?.message || "");

      if (msg.toLowerCase().includes("already a collaborator")) {
        setStatus("User is already a collaborator.");
        setError("");
      } else if (msg.toLowerCase().includes("not found")) {
        setError("User not found.");
        setStatus("");
      } else {
        setError(msg || "Something went wrong while adding the user.");
        setStatus("");
      }
    } finally {
  
      setSubmitting(false);
    }
  }

  function handleClose() {
    setError("");
    setStatus("");
    setUsername("");
    onClose();
  }

  return (
    <div className={styles.overlay} onClick={handleClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h3 className={styles.title}>Add user to playlist</h3>
          <button className={styles.closeBtn} onClick={handleClose}>
            ✕
          </button>
        </div>

        <div className={styles.inputRow}>
          <input
            className={styles.textInput}
            placeholder="Username"
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
    
              setError("");
              setStatus("");
            }}
            disabled={submitting}
          />
        </div>

        {/* show error or success */}
        {error && <div className={styles.error}>Error: {error}</div>}
        {!error && status && <div className={styles.status}>{status}</div>}

        <div className={styles.actions}>
          <button
            className={styles.cancelBtn}
            onClick={handleClose}
            disabled={submitting}
          >
            Cancel
          </button>
          <button
            className={styles.addBtn}
            onClick={submit}
            disabled={submitting}
          >
            {submitting ? "Adding..." : "Add User"}
          </button>
        </div>
      </div>
    </div>
  );
}
