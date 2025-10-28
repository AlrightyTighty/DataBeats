import { useState } from "react";
import styles from "./Report.module.css";

export default function Report() {
  const [comment, setComment] = useState("");
  const [reportReason, setReportReason] = useState("");

  // These would be filled in by the site itself
  const entityType = "post";
  const entityId = "12345";

  const handleSubmit = (e) => {
    e.preventDefault();

    const reportData = {
      entityType,
      entityId,
      reportReason,
      comment,
    };

    console.log("Report submitted:", reportData);
    alert("Report submitted successfully!");

    // Reset form
    setComment("");
    setReportReason("");
  };

  const handleCommentChange = (e) => {
    const value = e.target.value;
    if (value.length <= 500) {
      setComment(value);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.formCard}>
        <h1 className={styles.title}>Report Content</h1>

        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Entity Type</label>
            <input type="text" value={entityType} disabled className={`${styles.input} ${styles.inputDisabled}`} />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Entity ID</label>
            <input type="text" value={entityId} disabled className={`${styles.input} ${styles.inputDisabled}`} />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Report Reason *</label>
            <select value={reportReason} onChange={(e) => setReportReason(e.target.value)} required className={styles.select}>
              <option value="">Select a reason...</option>
              <option value="INAPPROPRIATE">Inappropriate</option>
              <option value="HARASSMENT">Harassment</option>
              <option value="DMCA">DMCA</option>
              <option value="SPAM">Spam</option>
              <option value="IMPERSONATION">Impersonation</option>
              <option value="OTHER">Other</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Additional Comments</label>
            <textarea value={comment} onChange={handleCommentChange} placeholder="Please provide additional details about your report..." className={styles.textarea} />
            <div className={styles.charCount}>{comment.length} / 500</div>
          </div>

          <button type="submit" className={styles.submitButton}>
            Submit Report
          </button>
        </form>
      </div>
    </div>
  );
}
