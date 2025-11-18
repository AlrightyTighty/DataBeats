import { useEffect, useRef, useState } from "react";
import styles from "./AdminActivity.module.css";
import API from "../lib/api";

const getActionColor = (action) => {
  switch (action.toLowerCase()) {
    case "delete":
      return "#f59e0b";
    case "manage":
      return "#3b82f6";
    case "ban":
      return "#ef4444";
    case "unban":
      return "#10b981";
    default:
      return "#8b5cf6";
  }
};

const formatTimestamp = (timestamp) => {
  const date = new Date(timestamp);
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
        {activity.map((act) => {
          const isExpanded = expandedActivity === act.AdminId + act.TargetId + act.TimeStamp;
          const actionColor = getActionColor(act.Action);

          return (
            <div
              key={act.AdminId + act.TargetId + act.TimeStamp}
              className={styles.activityItem}
              onClick={() => handleActivityClick(act.AdminId + act.TargetId + act.TimeStamp)}
            >
              <div className={styles.activityRow}>
                <div className={styles.indicator} style={{ backgroundColor: actionColor }}></div>
                <div className={styles.content}>
                  <div className={styles.mainInfo}>
                    <span className={styles.admin}>{act.AdminName}</span>
                    <span className={styles.action}>{act.Action}</span>
                    <span className={styles.target}>{act.TargetEntity} #{act.TargetId}</span>
                  </div>
                  <span className={styles.timestamp}>{formatTimestamp(act.TimeStamp)}</span>
                </div>
              </div>
              {isExpanded && act.Comment && (
                <div className={styles.commentSection}>
                  <div className={styles.commentLabel}>Comment:</div>
                  <div className={styles.commentText}>{act.Comment}</div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
