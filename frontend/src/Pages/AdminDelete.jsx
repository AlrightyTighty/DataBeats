import { useState } from "react";
import styles from "./AdminDelete.module.css";
import { useSearchParams, useNavigate } from "react-router";
import Topnav from "../Components/Topnav";
import API from "../lib/api";
import { useModal } from "../contexts/ModalContext";

export default function AdminDelete() {
  const [reason, setReason] = useState("");
  const [resolveReports, setResolveReports] = useState(true);
  const { showAlert } = useModal();
  const [error, setError] = useState("");

  const [params] = useSearchParams();
  const navigate = useNavigate();

  const entityType = params.get("type");
  const entityId = params.get("id");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const deleteData = {
      EntityType: entityType,
      EntityId: entityId,
      Reason: reason,
      ResolveReports: resolveReports,
    };

    try {
      const response = await fetch(`${API}/api/admin/delete`, {
        method: "POST",
        credentials: "include",
        body: JSON.stringify(deleteData),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        console.log("Content deleted:", deleteData);
        showAlert("Deleted", "Content deleted successfully");
        navigate("/admin");
      } else {
        const errorData = await response.json();
        setError(
          errorData.message || "Failed to delete content. Please try again."
        );
      }
    } catch (err) {
      setError("An error occurred while deleting content. Please try again.");
      console.error("Delete error:", err);
    }
  };

  const handleReasonChange = (e) => {
    const value = e.target.value;
    if (value.length <= 500) {
      setReason(value);
    }
  };

  return (
    <>
      <Topnav />
      <div className={styles.container}>
        <div className={styles.formCard}>
          <h1 className={styles.title}>Delete Content</h1>
          <p className={styles.warning}>
            This action will permanently delete this content. Please provide a
            reason for the deletion.
          </p>

          <form onSubmit={handleSubmit}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Entity Type</label>
              <input
                type="text"
                value={entityType}
                disabled
                className={`${styles.input} ${styles.inputDisabled}`}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Deletion Reason *</label>
              <textarea
                value={reason}
                onChange={handleReasonChange}
                placeholder="Please provide a detailed reason for deleting this content..."
                className={styles.textarea}
                required
              />
              <div className={styles.charCount}>{reason.length} / 500</div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={resolveReports}
                  onChange={(e) => setResolveReports(e.target.checked)}
                  className={styles.checkbox}
                />
                Automatically resolve associated reports
              </label>
            </div>

            {error && <div className={styles.error}>{error}</div>}

            <button type="submit" className={styles.submitButton}>
              Confirm Deletion
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
