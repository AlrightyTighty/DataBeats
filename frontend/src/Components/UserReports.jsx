import { useState, useRef, useEffect } from "react";
import styles from "./UserReports.module.css";
import API from "../lib/api";

const reportsData = [
  {
    id: 3421,
    reporter: "@concerned_user",
    reported: "@toxic_user_123",
    reason: "Harassment",
    description: "User sending threatening messages in DMs",
    status: "pending",
    timestamp: "5 minutes ago",
    priority: "high",
  },
  {
    id: 3420,
    reporter: "@community_mod",
    reported: "Post #45892",
    reason: "Spam",
    description: "Promotional content violating guidelines",
    status: "pending",
    timestamp: "12 minutes ago",
    priority: "medium",
  },
  {
    id: 3419,
    reporter: "@flag_account",
    reported: "@fake_profile_99",
    reason: "Impersonation",
    description: "Pretending to be a verified celebrity",
    status: "reviewing",
    timestamp: "34 minutes ago",
    priority: "high",
  },
  {
    id: 3418,
    reporter: "@user_safety",
    reported: "Comment #78234",
    reason: "Inappropriate Content",
    description: "NSFW content without proper tagging",
    status: "pending",
    timestamp: "1 hour ago",
    priority: "medium",
  },
  {
    id: 3417,
    reporter: "@watchdog_42",
    reported: "@bot_account_x",
    reason: "Spam",
    description: "Automated spam bot posting ads",
    status: "reviewing",
    timestamp: "2 hours ago",
    priority: "low",
  },
  {
    id: 3416,
    reporter: "@safe_space",
    reported: "@hater_1234",
    reason: "Hate Speech",
    description: "Discriminatory language in comments",
    status: "pending",
    timestamp: "3 hours ago",
    priority: "high",
  },
];

const getStatusStyle = (status) => {
  switch (status) {
    case "pending":
      return { bg: "#78350f", color: "#fbbf24" };
    case "reviewing":
      return { bg: "#1e3a8a", color: "#60a5fa" };
    case "resolved":
      return { bg: "#065f46", color: "#34d399" };
    default:
      return { bg: "#374151", color: "#9ca3af" };
  }
};

const getReasonStyle = (priority) => {
  switch (priority.toUpperCase()) {
    case "INAPPROPRIATE":
      return { bg: "#7f1d1d", color: "#f87171" };
    case "DMCA":
      return { bg: "#78350f", color: "#fb923c" };
    case "HARASSMENT":
      return { bg: "#374151", color: "#9ca3af" };
    default:
      return { bg: "#374151", color: "#9ca3af" };
  }
};

export function UserReports() {
  const [selectedReport, setSelectedReport] = useState(null);

  const [reports, setReports] = useState([]);
  const loaded = useRef(false);

  useEffect(() => {
    if (loaded.current) return;

    loaded.current = true;

    (async () => {
      const response = await fetch(`${API}/api/admin/reports`, {
        method: "GET",
        credentials: "include",
      });

      setReports(
        (await response.json()).map((report) => {
          return {
            id: report.complaintId,
            description: report.userComment,
            reporter: report.userId,
            entityType: report.complaintType,
            reason: report.complaintReason,
            timeStamp: report.timeCreated,
            reported: report.complaintTargetId,
          };
        })
      );
    })();
    loaded.current = false;
  }, []);

  const resolveReport = async (reportId) => {};

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>User Reports</h2>
        <span className={styles.count}>{reports.length} pending</span>
      </div>

      <div className={styles.reportsList}>
        {reports.map((report) => {
          const statusStyle = getStatusStyle(report.status);
          const reasonStyle = getReasonStyle(report.reason);

          return (
            <div key={report.id} className={styles.reportItem} onClick={() => setSelectedReport(report.id === selectedReport ? null : report.id)}>
              <div className={styles.reportHeader}>
                <div className={styles.reportMeta}>
                  <span className={styles.reportId}>#{report.id}</span>
                  <span
                    className={styles.priority}
                    style={{
                      backgroundColor: reasonStyle.bg,
                      color: reasonStyle.color,
                    }}
                  >
                    {report.reason}
                  </span>
                  <button onClick={() => {}}>Resolve</button>
                  <span
                    className={styles.status}
                    style={{
                      backgroundColor: reasonStyle.bg,
                      color: reasonStyle.color,
                    }}
                  >
                    {report.type}
                  </span>
                </div>
              </div>

              <div className={styles.reportContent}>
                <div className={styles.reportReason}>{report.reason}</div>
                <div className={styles.reportTargets}>
                  <span className={styles.label}>Reporter: User</span>
                  <span className={styles.username}>{report.reporter}</span>
                  <span className={styles.separator}>→</span>
                  <span className={styles.label}>Reported:</span>
                  <span className={styles.username}>{report.entityType + " " + report.reported}</span>
                </div>
                {selectedReport === report.id && <div className={styles.reportDescription}>{report.description}</div>}
              </div>

              <div className={styles.reportFooter}>
                <span className={styles.timestamp}>{report.timestamp}</span>
                {selectedReport !== report.id && <button className={styles.viewButton}>View Details</button>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
