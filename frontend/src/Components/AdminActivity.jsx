import { useEffect, useRef, useState } from "react";
import styles from "./AdminActivity.module.css";
import API from "../lib/api";

const getActionColor = (action) => {
  if (!action) return "#8b5cf6";
  switch (action.toLowerCase()) {
    case "delete":
      return "#f59e0b";
    case "manage":
      return "#3b82f6";
    case "reviews":
      return "#10b981";
    case "ban":
      return "#ef4444";
    case "unban":
      return "#10b981";
    default:
      return "#8b5cf6";
  }
};

const formatTimestamp = (timestamp) => {
  if (!timestamp) return "No date";
  const date = new Date(timestamp);

  // Check for invalid dates or dates in year 0001 (default DateTime value)
  if (isNaN(date.getTime()) || date.getFullYear() < 1900) {
    return "No date";
  }

  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? "s" : ""} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
};

export function AdminActivity() {
  const [activity, setActivity] = useState([]);
  const [expandedActivity, setExpandedActivity] = useState(null);
  const loaded = useRef(false);

  useEffect(() => {
    if (loaded.current) return;

    loaded.current = true;

    (async () => {
      const response = await fetch(`${API}/api/admin/actions`, {
        method: "GET",
        credentials: "include",
      });

      setActivity(await response.json());
    })();
    loaded.current = false;
  }, []);

  const handleActivityClick = (actId) => {
    setExpandedActivity(expandedActivity === actId ? null : actId);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Recent Admin Activity</h2>
        <span className={styles.count}>{activity.length} activities</span>
      </div>

      <div className={styles.activityList}>
        {activity.map((act, index) => {
          const uniqueKey = `${act.adminId}-${act.targetId}-${act.timeStamp || index}`;
          const isExpanded = expandedActivity === uniqueKey;
          const actionColor = getActionColor(act.action);

          return (
            <div
              key={uniqueKey}
              className={styles.activityItem}
              onClick={() => handleActivityClick(uniqueKey)}
            >
              <div className={styles.activityRow}>
                <div className={styles.indicator} style={{ backgroundColor: actionColor }}></div>
                <div className={styles.content}>
                  <div className={styles.mainInfo}>
                    <span className={styles.admin}>{act.adminName}</span>
                    <span className={styles.action}>{act.action}</span>
                    <span className={styles.target}>{act.targetEntity} #{act.targetId}</span>
                  </div>
                  <span className={styles.timestamp}>{formatTimestamp(act.timeStamp)}</span>
                </div>
              </div>
              {isExpanded && act.comment && (
                <div className={styles.commentSection}>
                  <div className={styles.commentLabel}>Comment:</div>
                  <div className={styles.commentText}>{act.comment}</div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
