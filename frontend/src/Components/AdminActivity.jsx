import { useEffect, useRef, useState } from "react";
import styles from "./AdminActivity.module.css";

const activityData = [
  {
    id: 1,
    admin: "Sarah Chen",
    action: "Banned user",
    target: "@toxic_user_123",
    timestamp: "2 minutes ago",
    type: "ban",
  },
  {
    id: 2,
    admin: "Michael Torres",
    action: "Deleted post",
    target: "Post #45892",
    timestamp: "15 minutes ago",
    type: "delete",
  },
  {
    id: 3,
    admin: "Sarah Chen",
    action: "Resolved report",
    target: "Report #3421",
    timestamp: "28 minutes ago",
    type: "resolve",
  },
  {
    id: 4,
    admin: "James Wilson",
    action: "Updated community guidelines",
    target: "Section 4.2",
    timestamp: "1 hour ago",
    type: "update",
  },
  {
    id: 5,
    admin: "Emily Rodriguez",
    action: "Warned user",
    target: "@spammer_99",
    timestamp: "1 hour ago",
    type: "warn",
  },
  {
    id: 6,
    admin: "Michael Torres",
    action: "Removed comment",
    target: "Comment #78234",
    timestamp: "2 hours ago",
    type: "delete",
  },
  {
    id: 7,
    admin: "Sarah Chen",
    action: "Unbanned user",
    target: "@reformed_user",
    timestamp: "3 hours ago",
    type: "unban",
  },
  {
    id: 8,
    admin: "James Wilson",
    action: "Created announcement",
    target: "System Maintenance",
    timestamp: "4 hours ago",
    type: "create",
  },
];

const getActionColor = (type) => {
  switch (type) {
    case "ban":
      return "#ef4444";
    case "delete":
      return "#f59e0b";
    case "resolve":
      return "#10b981";
    case "update":
      return "#3b82f6";
    case "warn":
      return "#f59e0b";
    case "unban":
      return "#10b981";
    case "create":
      return "#8b5cf6";
    default:
      return "#6b7280";
  }
};

export function AdminActivity() {
  const [activity, setActivity] = useState([]);
  const loaded = useRef(false);

  useEffect(() => {
    if (loaded.current) return;

    loaded.current = true;

    (async () => {
      const response = await fetch("http://localhost:5062/api/admin/actions", {
        method: "GET",
        credentials: "include",
      });

      setActivity(await response.json());
    })();
    loaded.current = false;
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Recent Admin Activity</h2>
        <span className={styles.count}>{activityData.length} activities</span>
      </div>

      <div className={styles.activityList}>
        {activityData.map((activity) => (
          <div key={activity.id} className={styles.activityItem}>
            <div className={styles.indicator} style={{ backgroundColor: getActionColor(activity.type) }}></div>
            <div className={styles.content}>
              <div className={styles.mainInfo}>
                <span className={styles.admin}>{activity.admin}</span>
                <span className={styles.action}>{activity.action}</span>
                <span className={styles.target}>{activity.target}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
