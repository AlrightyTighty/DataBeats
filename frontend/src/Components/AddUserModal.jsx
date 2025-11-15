import { useState } from "react";
import styles from "./AddUserModal.module.css";

export default function AddUserModal({ isOpen, onClose, onAdd, onRemove, collaborators = [], ownerName = "" }) {
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [removingUserId, setRemovingUserId] = useState(null);

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

  async function handleRemove(userId) {
    if (!onRemove || removingUserId) return;
    
    try {
      setRemovingUserId(userId);
      await onRemove(userId);
    } catch (err) {
      setError(String(err?.message || "Failed to remove collaborator"));
    } finally {
      setRemovingUserId(null);
    }
  }

  return (
    <div className={styles.overlay} onClick={handleClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h3 className={styles.title}>Manage Collaborators</h3>
          <button className={styles.closeBtn} onClick={handleClose}>
            ✕
          </button>
        </div>

        <div className={styles.inputRow}>
          <input
            className={styles.textInput}
            placeholder="Enter username to add"
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
              setError("");
              setStatus("");
            }}
            disabled={submitting}
          />
          <button
            className={styles.addBtnInline}
            onClick={submit}
            disabled={submitting}
          >
            {submitting ? "Adding..." : "Add"}
          </button>
        </div>

        {/* show error or success */}
        {error && <div className={styles.error}>Error: {error}</div>}
        {!error && status && <div className={styles.status}>{status}</div>}

        {/* List of current collaborators */}
        <div className={styles.collaboratorsList}>
          <h4 className={styles.listTitle}>Current Collaborators</h4>
          {collaborators.length === 0 ? (
            <div className={styles.emptyText}>No collaborators yet</div>
          ) : (
            <div className={styles.list}>
              {collaborators.map((collab) => (
                <div key={collab.userId} className={styles.collabRow}>
                  <div className={styles.collabInfo}>
                    <span className={styles.collabName}>
                      {collab.displayName || `User ${collab.userId}`}
                    </span>
                  </div>
                  <button
                    className={styles.removeBtn}
                    onClick={() => handleRemove(collab.userId)}
                    disabled={removingUserId === collab.userId}
                  >
                    {removingUserId === collab.userId ? "Removing..." : "Remove"}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {ownerName && (
          <div className={styles.ownerInfo}>
            Owner: <strong>{ownerName}</strong>
          </div>
        )}
      </div>
    </div>
  );
}
