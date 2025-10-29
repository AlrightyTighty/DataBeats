import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import styles from "./ContentReportsChart.module.css";
import { useState, useRef, useEffect } from "react";

const chartData = [
  {
    date: "Oct 21",
    spam: 45,
    harassment: 23,
    inappropriate: 34,
    hateSpeech: 12,
    impersonation: 8,
  },
  {
    date: "Oct 22",
    spam: 52,
    harassment: 28,
    inappropriate: 41,
    hateSpeech: 15,
    impersonation: 11,
  },
  {
    date: "Oct 23",
    spam: 38,
    harassment: 31,
    inappropriate: 29,
    hateSpeech: 18,
    impersonation: 7,
  },
  {
    date: "Oct 24",
    spam: 61,
    harassment: 25,
    inappropriate: 38,
    hateSpeech: 14,
    impersonation: 13,
  },
  {
    date: "Oct 25",
    spam: 48,
    harassment: 35,
    inappropriate: 45,
    hateSpeech: 21,
    impersonation: 9,
  },
  {
    date: "Oct 26",
    spam: 55,
    harassment: 29,
    inappropriate: 36,
    hateSpeech: 16,
    impersonation: 12,
  },
  {
    date: "Oct 27",
    spam: 71,
    harassment: 42,
    inappropriate: 52,
    hateSpeech: 28,
    impersonation: 15,
  },
  {
    date: "Oct 28",
    spam: 64,
    harassment: 38,
    inappropriate: 47,
    hateSpeech: 24,
    impersonation: 11,
  },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className={styles.customTooltip}>
        <p className={styles.tooltipLabel}>{label}</p>
        {payload.map((entry, index) => (
          <div key={index} className={styles.tooltipItem}>
            <span className={styles.tooltipDot} style={{ backgroundColor: entry.color }}></span>
            <span className={styles.tooltipName}>{entry.name}:</span>
            <span className={styles.tooltipValue}>{entry.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export function ContentReportsChart() {
  const [reportsStats, setReportsStats] = useState([]);
  const loaded = useRef(false);

  useEffect(() => {
    if (loaded.current) return;

    loaded.current = true;

    (async () => {
      const response = await fetch("http://localhost:5062/api/admin/stats", {
        method: "GET",
        credentials: "include",
      });

      setReportsStats(await response.json());
    })();
    loaded.current = false;
  }, []);

  const chartData = reportsStats.map((day) => {
    return {
      date: day.header,
      spam: day.spam,
      harassment: day.harassment,
      dmca: day.dmca,
      inappropriate: day.inappropriate,
      impersonation: day.impersonation,
    };
  });

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>Content Reports Over Time</h2>
          <p className={styles.subtitle}>Last 7 days</p>
        </div>
      </div>

      {chartData != null && (
        <div className={styles.chartContainer}>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
              <XAxis dataKey="date" stroke="#6b7280" style={{ fontSize: "0.875rem" }} />
              <YAxis stroke="#6b7280" style={{ fontSize: "0.875rem" }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ paddingTop: "20px", fontSize: "0.875rem" }} iconType="line" />
              <Line type="monotone" dataKey="spam" stroke="#f59e0b" strokeWidth={2} dot={{ fill: "#f59e0b", r: 4 }} activeDot={{ r: 6 }} name="Spam" />
              <Line type="monotone" dataKey="harassment" stroke="#ef4444" strokeWidth={2} dot={{ fill: "#ef4444", r: 4 }} activeDot={{ r: 6 }} name="Harassment" />
              <Line type="monotone" dataKey="inappropriate" stroke="#8b5cf6" strokeWidth={2} dot={{ fill: "#8b5cf6", r: 4 }} activeDot={{ r: 6 }} name="Inappropriate" />
              <Line type="monotone" dataKey="dmca" stroke="#dc2626" strokeWidth={2} dot={{ fill: "#dc2626", r: 4 }} activeDot={{ r: 6 }} name="DMCA" />
              <Line type="monotone" dataKey="impersonation" stroke="#3b82f6" strokeWidth={2} dot={{ fill: "#3b82f6", r: 4 }} activeDot={{ r: 6 }} name="Impersonation" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
