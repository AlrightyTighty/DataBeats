import React, { useEffect, useState } from "react";
import { Link } from "react-router";
import styles from "./ReportResult.module.css";
import Topnav from "../Components/Topnav";

export default function ReportResult() {
  const [report, setReport] = useState(null);

  useEffect(() => {
    const data = localStorage.getItem("reportData");
    if (data) setReport(JSON.parse(data));
  }, []);

  if (!report) {
    return (
      <>
        <Topnav />
        <div className={styles.container}>
          <header className={styles.pageHeader}>
            <h1 className={styles.title}>Report Results</h1>
            <div className={styles.headerButtons}>
              <Link className={styles.navButton} to="/admin/generate-report">
                Generate New Report
              </Link>
              <Link className={styles.navButton} to="/admin">
                Back to Admin
              </Link>
            </div>
          </header>
          <main className={styles.main}>
            <p>No report data found. Please generate a report first.</p>
          </main>
        </div>
      </>
    );
  }

  const { genreReport, artistReport, albumReport } = report;

  return (
    <>
      <Topnav />
      <div className={styles.container}>
        <header className={styles.pageHeader}>
          <h1 className={styles.title}>Popularity Report Results</h1>
          <div className={styles.headerButtons}>
            <Link className={styles.navButton} to="/admin/generate-report">
              Generate New Report
            </Link>
            <Link className={styles.navButton} to="/admin">
              Back to Admin
            </Link>
          </div>
        </header>

        <main className={styles.main}>
        <section className={styles.section}>
          <h2>Top Genres</h2>
          <div className={styles.list}>
            {genreReport.map((g, i) => (
              <div key={i} className={styles.item}>
                <span className={styles.name}>{g.genreName}</span>
                <span className={styles.streams}>{g.streams} streams</span>
              </div>
            ))}
          </div>
        </section>

        <section className={styles.section}>
          <h2>Top Artists</h2>
          <div className={styles.list}>
            {artistReport.map((a, i) => (
              <div key={i} className={styles.item}>
                <div className={styles.name}>{a.musicianName}</div>
                <div className={styles.details}>
                  <span>{a.streams} streams</span>
                  <span className={styles.genres}>{a.genres.join(", ")}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className={styles.section}>
          <h2>Top Albums</h2>
          <div className={styles.list}>
            {albumReport.map((a, i) => (
              <div key={i} className={styles.item}>
                <div className={styles.name}>{a.albumName}</div>
                <div className={styles.details}>
                  <span>{a.streams} streams</span>
                  <span className={styles.genres}>{a.genres.join(", ")}</span>
                  <span className={styles.artists}>{a.artists.join(", ")}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
      </div>
    </>
  );
}
