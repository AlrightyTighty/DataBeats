import React, { useEffect, useState } from "react";
import { Link } from "react-router";
import styles from "./ReportResult.module.css";
import Topnav from "../Components/Topnav";

import API from "../lib/api";

export default function ReportResult() {
  const [report, setReport] = useState(null);
  const [selectedFilter, setSelectedFilter] = useState(null); // {type: 'genre'|'artist'|'album', value: string}
  const [selectedSong, setSelectedSong] = useState(null); // string (song name)
  const [overviewData, setOverviewData] = useState(null);
  const [streamData, setStreamData] = useState(null);
  const [overviewPage, setOverviewPage] = useState(1);
  const [streamPage, setStreamPage] = useState(1);
  const [loadingOverview, setLoadingOverview] = useState(false);
  const [loadingStreams, setLoadingStreams] = useState(false);

  useEffect(() => {
    const data = localStorage.getItem("reportData");
    if (data) setReport(JSON.parse(data));
  }, []);

  // Fetch song overview when filter changes
  useEffect(() => {
    if (selectedFilter) {
      fetchSongOverview(selectedFilter, overviewPage);
    }
  }, [selectedFilter, overviewPage]);

  // Fetch song streams when selected song changes
  useEffect(() => {
    if (selectedSong) {
      fetchSongStreams(selectedSong, streamPage);
    }
  }, [selectedSong, streamPage]);

  const fetchSongOverview = async (filter, page) => {
    setLoadingOverview(true);
    try {
      const authToken = localStorage.getItem("authToken");
      const userId = localStorage.getItem("userId");

      let queryParam = "";
      if (filter.type === "artist") queryParam = `artistName=${encodeURIComponent(filter.value)}`;
      else if (filter.type === "album") queryParam = `albumName=${encodeURIComponent(filter.value)}`;
      else if (filter.type === "genre") queryParam = `genre=${encodeURIComponent(filter.value)}`;

      const response = await fetch(`${API}/api/admin/songReport?page=${page}&pageSize=50&${queryParam}`, {
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        setOverviewData(data);
      } else {
        console.error("Failed to fetch song overview");
      }
    } catch (error) {
      console.error("Error fetching song overview:", error);
    } finally {
      setLoadingOverview(false);
    }
  };

  const fetchSongStreams = async (songName, page) => {
    setLoadingStreams(true);
    try {
      const authToken = localStorage.getItem("authToken");
      const userId = localStorage.getItem("userId");

      const response = await fetch(`${API}/api/admin/songReport/${encodeURIComponent(songName)}?page=${page}&pageSize=50`, {
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        setStreamData(data);
      } else {
        console.error("Failed to fetch song streams");
      }
    } catch (error) {
      console.error("Error fetching song streams:", error);
    } finally {
      setLoadingStreams(false);
    }
  };

  const handleFilterClick = (type, value) => {
    if (selectedFilter?.type === type && selectedFilter?.value === value) {
      // Clicking same filter again clears it
      setSelectedFilter(null);
      setOverviewData(null);
      setOverviewPage(1);
    } else {
      setSelectedFilter({ type, value });
      setOverviewPage(1);
    }
  };

  const handleSongClick = (songName) => {
    if (selectedSong === songName) {
      setSelectedSong(null);
      setStreamData(null);
      setStreamPage(1);
    } else {
      setSelectedSong(songName);
      setStreamPage(1);
    }
  };

  const clearFilter = () => {
    setSelectedFilter(null);
    setOverviewData(null);
    setOverviewPage(1);
  };

  const clearSongStreams = () => {
    setSelectedSong(null);
    setStreamData(null);
    setStreamPage(1);
  };

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

  const { genreReport, artistReport, albumReport, songReport } = report;

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
          {/* Grid of scrollable sections */}
          <div className={styles.reportGrid}>
            {/* Top Genres */}
            <section className={styles.scrollableSection}>
              <h2 className={styles.sectionTitle}>Top Genres</h2>
              <div className={styles.scrollableList}>
                {genreReport.map((g, i) => (
                  <div
                    key={i}
                    className={`${styles.clickableItem} ${selectedFilter?.type === "genre" && selectedFilter?.value === g.genreName ? styles.activeFilter : ""}`}
                    onClick={() => handleFilterClick("genre", g.genreName)}
                  >
                    <span className={styles.name}>{g.genreName}</span>
                    <span className={styles.streams}>{g.streams} streams</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Top Artists */}
            <section className={styles.scrollableSection}>
              <h2 className={styles.sectionTitle}>Top Artists</h2>
              <div className={styles.scrollableList}>
                {artistReport.map((a, i) => (
                  <div
                    key={i}
                    className={`${styles.clickableItem} ${selectedFilter?.type === "artist" && selectedFilter?.value === a.musicianName ? styles.activeFilter : ""}`}
                    onClick={() => handleFilterClick("artist", a.musicianName)}
                  >
                    <div className={styles.itemHeader}>
                      <span className={styles.name}>{a.musicianName}</span>
                      <span className={styles.streams}>{a.streams} streams</span>
                    </div>
                    <div className={styles.genres}>{a.genres.join(", ")}</div>
                  </div>
                ))}
              </div>
            </section>

            {/* Top Albums */}
            <section className={styles.scrollableSection}>
              <h2 className={styles.sectionTitle}>Top Albums</h2>
              <div className={styles.scrollableList}>
                {albumReport.map((a, i) => (
                  <div
                    key={i}
                    className={`${styles.clickableItem} ${selectedFilter?.type === "album" && selectedFilter?.value === a.albumName ? styles.activeFilter : ""}`}
                    onClick={() => handleFilterClick("album", a.albumName)}
                  >
                    <div className={styles.itemHeader}>
                      <span className={styles.name}>{a.albumName}</span>
                      <span className={styles.streams}>{a.streams} streams</span>
                    </div>
                    <div className={styles.details}>
                      <div className={styles.genres}>{a.genres.join(", ")}</div>
                      <div className={styles.artists}>{a.artists.join(", ")}</div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Top Songs */}
            <section className={styles.scrollableSection}>
              <h2 className={styles.sectionTitle}>Top Songs</h2>
              <div className={styles.scrollableList}>
                {songReport &&
                  songReport.map((s, i) => (
                    <div key={i} className={`${styles.clickableItem} ${selectedSong === s.songName ? styles.activeFilter : ""}`} onClick={() => handleSongClick(s.songName)}>
                      <div className={styles.itemHeader}>
                        <span className={styles.name}>{s.songName}</span>
                        <span className={styles.streams}>{s.streams} streams</span>
                      </div>
                      <div className={styles.details}>
                        <div className={styles.albumName}>{s.albumName}</div>
                        <div className={styles.artists}>{s.artists.join(", ")}</div>
                        <div className={styles.genres}>{s.genres.join(", ")}</div>
                      </div>
                    </div>
                  ))}
              </div>
            </section>
          </div>

          {/* Song Overview Table */}
          {overviewData && (
            <div className={styles.tableContainer}>
              <div className={styles.tableHeader}>
                <h2>Song Overview</h2>
                <div className={styles.filterBadge}>
                  Filtered by {selectedFilter.type}: <strong>{selectedFilter.value}</strong>
                  <button className={styles.clearButton} onClick={clearFilter}>
                    ×
                  </button>
                </div>
              </div>

              {loadingOverview ? (
                <div className={styles.loading}>Loading...</div>
              ) : (
                <>
                  <div className={styles.tableWrapper}>
                    <table className={styles.table}>
                      <thead>
                        <tr>
                          <th>Song Name</th>
                          <th>Album</th>
                          <th>Artists</th>
                          <th>Genres</th>
                          <th>Total Streams</th>
                        </tr>
                      </thead>
                      <tbody>
                        {overviewData.data.map((song) => (
                          <tr key={song.songId}>
                            <td>
                              <button className={styles.songLink} onClick={() => handleSongClick(song.songName)}>
                                {song.songName}
                              </button>
                            </td>
                            <td>{song.albumName || "N/A"}</td>
                            <td>{song.artists.join(", ")}</td>
                            <td>{song.genres.join(", ")}</td>
                            <td>{song.totalStreams}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className={styles.pagination}>
                    <button className={styles.pageButton} onClick={() => setOverviewPage(overviewPage - 1)} disabled={overviewPage === 1}>
                      Previous
                    </button>
                    <span className={styles.pageInfo}>
                      Page {overviewData.currentPage} of {overviewData.totalPages}
                    </span>
                    <button className={styles.pageButton} onClick={() => setOverviewPage(overviewPage + 1)} disabled={overviewPage === overviewData.totalPages}>
                      Next
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Song Streams Table */}
          {streamData && (
            <div className={styles.tableContainer}>
              <div className={styles.tableHeader}>
                <h2>Stream Details for: {selectedSong}</h2>
                <button className={styles.clearButton} onClick={clearSongStreams}>
                  ×
                </button>
              </div>

              {loadingStreams ? (
                <div className={styles.loading}>Loading...</div>
              ) : (
                <>
                  <div className={styles.tableWrapper}>
                    <table className={styles.table}>
                      <thead>
                        <tr>
                          <th>Username</th>
                          <th>Time Listened</th>
                          <th>Stream ID</th>
                        </tr>
                      </thead>
                      <tbody>
                        {streamData.data.map((stream) => (
                          <tr key={stream.streamId}>
                            <td>{stream.username}</td>
                            <td>{new Date(stream.timeListened).toLocaleString()}</td>
                            <td>{stream.streamId}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className={styles.pagination}>
                    <button className={styles.pageButton} onClick={() => setStreamPage(streamPage - 1)} disabled={streamPage === 1}>
                      Previous
                    </button>
                    <span className={styles.pageInfo}>
                      Page {streamData.currentPage} of {streamData.totalPages}
                    </span>
                    <button className={styles.pageButton} onClick={() => setStreamPage(streamPage + 1)} disabled={streamPage === streamData.totalPages}>
                      Next
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Empty states */}
          {!selectedFilter && !selectedSong && (
            <div className={styles.emptyState}>
              <p>Click on any genre, artist, album, or song above to view detailed reports</p>
            </div>
          )}
        </main>
      </div>
    </>
  );
}
