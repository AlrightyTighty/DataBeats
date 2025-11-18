import React, { useState } from "react";
import { useNavigate, Link } from "react-router";
import styles from "./GenerateReport.module.css";
import API from "../lib/api";
import Topnav from "../Components/Topnav";
import { useModal } from "../contexts/ModalContext";

export default function GenerateReport() {
  const navigate = useNavigate();
  const [from, setFrom] = useState("");
  const [until, setUntil] = useState("");
  const [minAlbumStreams, setMinAlbumStreams] = useState("");
  const [minGenreStreams, setMinGenreStreams] = useState("");
  const [minArtistStreams, setMinArtistStreams] = useState("");

  const { showAlert } = useModal();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const params = new URLSearchParams();
    if (from) params.append("from", from);
    if (until) params.append("until", until);
    if (minAlbumStreams) params.append("minAlbumStreams", minAlbumStreams);
    if (minGenreStreams) params.append("minGenreStreams", minGenreStreams);
    if (minArtistStreams) params.append("minArtistStreams", minArtistStreams);

    try {
      console.log(API);
      const response = await fetch(
        `${API}/api/admin/generateReport?${params}`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      if (!response.ok) {
        showAlert("Failed to generate report");
        return;
      }

      const data = await response.json();
      // store in localStorage for next page
      localStorage.setItem("reportData", JSON.stringify(data));
      navigate("/admin/report-result");
    } catch (err) {
      console.error(err);
      showAlert("Error", "Error generating report");
    }
  };

  return (
    <>
      <Topnav />
      <div className={styles.container}>
        <header className={styles.pageHeader}>
          <h1 className={styles.title}>Generate Popularity Report</h1>
          <Link className={styles.backButton} to="/admin">
            Back to Admin
          </Link>
        </header>

        <main className={styles.main}>
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.fieldGroup}>
              <label>From Date:</label>
              <input
                type="date"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
              />
            </div>

            <div className={styles.fieldGroup}>
              <label>Until Date:</label>
              <input
                type="date"
                value={until}
                onChange={(e) => setUntil(e.target.value)}
              />
            </div>

            <div className={styles.fieldGroup}>
              <label>Min Album Streams:</label>
              <input
                type="number"
                value={minAlbumStreams}
                onChange={(e) => setMinAlbumStreams(e.target.value)}
              />
            </div>

            <div className={styles.fieldGroup}>
              <label>Min Genre Streams:</label>
              <input
                type="number"
                value={minGenreStreams}
                onChange={(e) => setMinGenreStreams(e.target.value)}
              />
            </div>

            <div className={styles.fieldGroup}>
              <label>Min Artist Streams:</label>
              <input
                type="number"
                value={minArtistStreams}
                onChange={(e) => setMinArtistStreams(e.target.value)}
                required
              />
            </div>

            <button type="submit" className={styles.submitButton}>
              Generate Report
            </button>
          </form>
        </main>
      </div>
    </>
  );
}
