import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router";
import Topnav from "../Components/Topnav";
import styles from "./History.module.css";

const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:5062";

const presets = [
  { key: "7d", label: "Last 7 days", range: () => [daysAgo(7), new Date()] },
  { key: "30d", label: "Last 30 days", range: () => [daysAgo(30), new Date()] },
  { key: "90d", label: "Last 90 days", range: () => [daysAgo(90), new Date()] },
  { key: "all", label: "All time", range: () => [null, null] },
  { key: "custom", label: "Custom", range: () => [null, null] },
];

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

function parseYmd(s) {
  const [y, m, d] = s.split("-").map(Number);
  return { y, m, d };
}

function dateLabel(ymd) {
  if (!ymd) return "";
  const { y, m, d } = parseYmd(ymd);
  return new Date(Date.UTC(y, m - 1, d + 1)).toLocaleDateString();
}

function isoStartOfDayUTC(ymd) {
  if (!ymd) return null;
  const { y, m, d } = parseYmd(ymd);
  return new Date(Date.UTC(y, m - 1, d, 0, 0, 0, 0)).toISOString();
}

function isoEndOfDayUTC(ymd) {
  if (!ymd) return null;
  const { y, m, d } = parseYmd(ymd);
  return new Date(Date.UTC(y, m - 1, d, 23, 59, 59, 999)).toISOString();
}

function fmtTime(ts) {
  const d = new Date(ts);
  return d.toLocaleString();
}

function durToSec(s) {
  if (!s) return 0;
  const parts = s.split(":").map(Number);
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  return Number(s) || 0;
}

export default function History() {
  const [sp, setSp] = useSearchParams();
  const [query, setQuery] = useState(sp.get("q") || "");
  const [preset, setPreset] = useState(sp.get("preset") || "30d");
  const [from, setFrom] = useState(sp.get("from") || "");
  const [to, setTo] = useState(sp.get("to") || "");
  const [page, setPage] = useState(parseInt(sp.get("page") || "1", 10));
  const [pageSize, setPageSize] = useState(parseInt(sp.get("ps") || "25", 10));
  const [sortBy, setSortBy] = useState(sp.get("sort") || "played");
  const [sortDir, setSortDir] = useState(sp.get("dir") || "desc");
  const [recent, setRecent] = useState({ items: [], total: 0, page: 1, pageSize: 25 });
  const [top, setTop] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingTop, setLoadingTop] = useState(false);
  const [err, setErr] = useState("");
  const [errTop, setErrTop] = useState("");
  const meId = useMemo(() => localStorage.getItem("x_user_id") || "1", []);
  const debTimer = useRef(null);

  useEffect(() => {
    const p = new URLSearchParams();
    if (query) p.set("q", query);
    if (preset) p.set("preset", preset);
    if (from) p.set("from", from);
    if (to) p.set("to", to);
    p.set("page", String(page));
    p.set("ps", String(pageSize));
    p.set("sort", sortBy);
    p.set("dir", sortDir);
    setSp(p, { replace: true });
  }, [query, preset, from, to, page, pageSize, sortBy, sortDir, setSp]);

  useEffect(() => {
    if (preset !== "custom") {
      const chosen = presets.find(x => x.key === preset) || presets[1];
      const [f, t] = chosen.range();
      setFrom(f ? f.toISOString().slice(0, 10) : "");
      setTo(t ? t.toISOString().slice(0, 10) : "");
    }
  }, [preset]);

  useEffect(() => {
    fetchRecent();
  }, [query, from, to, page, pageSize]);

  useEffect(() => {
    fetchTop();
  }, [query, from, to]);

  function fetchRecent() {
    setLoading(true);
    setErr("");
    const u = new URL(`${API}/api/history/recent`);
    if (query) u.searchParams.set("query", query);
    if (from) u.searchParams.set("from", isoStartOfDayUTC(from));
    if (to) u.searchParams.set("to", isoEndOfDayUTC(to));
    u.searchParams.set("page", String(page));
    u.searchParams.set("pageSize", String(pageSize));
    fetch(u, { headers: { "X-UserId": meId } })
      .then(r => (r.ok ? r.json() : r.text().then(t => Promise.reject(t))))
      .then(data => setRecent({
        items: data.items || [],
        total: data.total || 0,
        page: data.page || 1,
        pageSize: data.pageSize || pageSize
      }))
      .catch(e => setErr(String(e)))
      .finally(() => setLoading(false));
  }

  function fetchTop() {
    setLoadingTop(true);
    setErrTop("");
    const u = new URL(`${API}/api/history/top-songs`);
    if (query) u.searchParams.set("query", query);
    if (from) u.searchParams.set("from", isoStartOfDayUTC(from));
    if (to) u.searchParams.set("to", isoEndOfDayUTC(to));
    u.searchParams.set("limit", "20");
    fetch(u, { headers: { "X-UserId": meId } })
      .then(r => (r.ok ? r.json() : r.text().then(t => Promise.reject(t))))
      .then(data => setTop(data.items || []))
      .catch(e => setErrTop(String(e)))
      .finally(() => setLoadingTop(false));
  }

  function onSearchChange(v) {
    setQuery(v);
    if (debTimer.current) clearTimeout(debTimer.current);
    debTimer.current = setTimeout(() => setPage(1), 200);
  }

  function handlePlay(songId) {
    fetch(`${API}/api/history/record`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-UserId": meId },
      body: JSON.stringify({ SongId: songId }),
    }).finally(() => {
      location.href = `/song/${songId}`;
    });
  }

  const sortedItems = useMemo(() => {
    const arr = [...(recent.items || [])];
    const dir = sortDir === "asc" ? 1 : -1;
    return arr.sort((a, b) => {
      let av, bv;
      if (sortBy === "played") {
        av = new Date(a.playedAtUtc).getTime();
        bv = new Date(b.playedAtUtc).getTime();
      } else if (sortBy === "title") {
        av = (a.songName || "").toLowerCase();
        bv = (b.songName || "").toLowerCase();
      } else if (sortBy === "artist") {
        av = (a.artistName || "").toLowerCase();
        bv = (b.artistName || "").toLowerCase();
      } else if (sortBy === "album") {
        av = (a.albumTitle || "").toLowerCase();
        bv = (b.albumTitle || "").toLowerCase();
      } else if (sortBy === "duration") {
        av = durToSec(a.duration);
        bv = durToSec(b.duration);
      } else {
        av = new Date(a.playedAtUtc).getTime();
        bv = new Date(b.playedAtUtc).getTime();
      }
      if (av < bv) return -1 * dir;
      if (av > bv) return  1 * dir;

      const at = new Date(a.playedAtUtc).getTime();
      const bt = new Date(b.playedAtUtc).getTime();
      if (at < bt) return -1 * dir;
      if (at > bt) return  1 * dir;
      return 0;
    });
  }, [recent.items, sortBy, sortDir]);

  function exportCSV() {
    const rows = [
      ["PlayedAtUtc", "SongId", "SongName", "ArtistId", "ArtistName", "AlbumId", "AlbumTitle", "Genres", "Duration"]
    ];
    sortedItems.forEach(r => {
      rows.push([
        r.playedAtUtc,
        r.songId,
        r.songName || "",
        r.artistId ?? "",
        r.artistName || "",
        r.albumId ?? "",
        r.albumTitle || "",
        Array.isArray(r.genres) ? r.genres.join("|") : "",
        r.duration || "",
      ]);
    });
    const csv = rows.map(cols =>
      cols.map(v => {
        const s = String(v ?? "");
        return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
      }).join(",")
    ).join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `listening-history_${from || "start"}_${to || "now"}.csv`;
    document.body.appendChild(a);
    a.click();
    URL.revokeObjectURL(url);
    a.remove();
  }

  function exportJSON() {
    const blob = new Blob([JSON.stringify(sortedItems, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `listening-history_${from || "start"}_${to || "now"}.json`;
    document.body.appendChild(a);
    a.click();
    URL.revokeObjectURL(url);
    a.remove();
  }

  const totalPages = Math.max(1, Math.ceil((recent.total || 0) / (recent.pageSize || pageSize)));

  return (
    <>
      <Topnav />
      <div className={styles.page}>
        <div className={styles.container}>

          {/*Header*/}
          <div className={styles.headerRow}>
            <div>
              <div className={styles.title}>Listening History</div>
              <div className={styles.subtitle}>
                {from ? dateLabel(from) : "Start"} – {to ? dateLabel(to) : "Now"}
              </div>
            </div>
          </div>

          {/*Main layout: table (left) + controls+top (right)*/}
          <div className={styles.layout}>
            {/*LEFT: table card*/}
            <div className={styles.card}>
              <div className={styles.tableHeader}>
                <div className={styles.tableTitle}>Plays</div>

                {/*Search + Apply + Export*/}
                <div className={styles.headerTools}>
                  <input
                    className={`${styles.input} ${styles.searchInput} ${styles.glow}`}
                    placeholder="Search by song, artist, or genre"
                    value={query}
                    onChange={e => onSearchChange(e.target.value)}
                  />
                  <button
                    className={`${styles.btn} ${styles.glowBtn}`}
                    onClick={() => { setPage(1); fetchRecent(); fetchTop(); }}
                  >
                    Apply
                  </button>
                  <button className={`${styles.btn} ${styles.glowBtn}`} onClick={exportCSV}>Export CSV</button>
                  <button className={`${styles.btn} ${styles.glowBtn}`} onClick={exportJSON}>Export JSON</button>
                </div>
              </div>

              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th className={styles.th}>Played</th>
                      <th className={styles.th}>Title</th>
                      <th className={styles.th}>Artist</th>
                      <th className={styles.th}>Album</th>
                      <th className={styles.th}>Genres</th>
                      <th className={styles.th}>Duration</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading && (
                      <tr className={styles.row}>
                        <td className={styles.td} colSpan={6}>
                          <span className={styles.loading}>Loading…</span>
                        </td>
                      </tr>
                    )}
                    {!loading && sortedItems.length === 0 && (
                      <tr className={styles.row}>
                        <td className={styles.td} colSpan={6}>No plays in this range.</td>
                      </tr>
                    )}
                    {!loading && sortedItems.map(r => (
                      <tr key={`${r.songId}-${r.playedAtUtc}`} className={styles.row}>
                        <td className={styles.td}>{fmtTime(r.playedAtUtc)}</td>
                        <td className={styles.td}>
                          <button className={styles.link} onClick={() => handlePlay(r.songId)}>{r.songName}</button>
                        </td>
                        <td className={styles.td}>
                          {r.artistId ? (
                            <Link className={styles.link} to={`/musician/${r.artistId}`}>
                              {r.artistName || "Artist"}
                            </Link>
                          ) : (r.artistName || "")}
                        </td>
                        <td className={styles.td}>
                          {r.albumId ? (
                            <Link className={styles.link} to={`/album/${r.albumId}`}>
                              {r.albumTitle || "Album"}
                            </Link>
                          ) : (r.albumTitle || "")}
                        </td>
                        <td className={styles.td}>
                          {r.genres && r.genres.length > 0
                            ? r.genres.map(g => <span className={styles.badge} key={g}>{g}</span>)
                            : ""}
                        </td>
                        <td className={styles.td}>{r.duration}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className={styles.pager}>
                <span className={styles.count}>{recent.total} total</span>
                <button
                  className={`${styles.btn} ${styles.glowBtn}`}
                  disabled={page <= 1}
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                >
                  Prev
                </button>
                <span className={styles.count}>Page {page} / {totalPages}</span>
                <button
                  className={`${styles.btn} ${styles.glowBtn}`}
                  disabled={page >= totalPages}
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                >
                  Next
                </button>
              </div>
            </div>

            {/*RIGHT: side column with controls + top songs*/}
            <div className={styles.sideCol}>
              {/*Controls card (dates, sort, rows/page)*/}
              <div className={styles.card}>
                <div className={styles.group}>
                  <div className={styles.groupTitle}>Modify dates</div>
                  <div className={styles.groupRow}>
                    <select
                      className={`${styles.select} ${styles.glow}`}
                      value={preset}
                      onChange={e => setPreset(e.target.value)}
                    >
                      {presets.map(p => <option key={p.key} value={p.key}>{p.label}</option>)}
                    </select>

                    <input
                      className={`${styles.input} ${preset === "custom" ? styles.hoverableDate : ""}`}
                      type="date"
                      disabled={preset !== "custom"}
                      value={from}
                      onChange={e => setFrom(e.target.value)}
                    />
                    <input
                      className={`${styles.input} ${preset === "custom" ? styles.hoverableDate : ""}`}
                      type="date"
                      disabled={preset !== "custom"}
                      value={to}
                      onChange={e => setTo(e.target.value)}
                    />
                  </div>
                </div>

                <div className={styles.group}>
                  <div className={styles.groupTitle}>Sort</div>
                  <div className={styles.groupHint}>Choose what you want to sort by</div>
                  <div className={styles.groupRow}>
                    <select
                      className={`${styles.select} ${styles.glow}`}
                      value={sortBy}
                      onChange={e => { setSortBy(e.target.value); setPage(1); }}
                    >
                      <option value="played">Played Date/Time</option>
                      <option value="title">Title</option>
                      <option value="artist">Artist</option>
                      <option value="album">Album</option>
                      <option value="duration">Duration</option>
                    </select>
                    <select
                      className={`${styles.select} ${styles.glow}`}
                      value={sortDir}
                      onChange={e => { setSortDir(e.target.value); setPage(1); }}
                    >
                      <option value="desc">Descending</option>
                      <option value="asc">Ascending</option>
                    </select>
                  </div>
                </div>

                <div className={styles.group}>
                  <div className={styles.groupTitle}>Rows per page</div>
                  <div className={styles.groupRow}>
                    <select
                      className={`${styles.select} ${styles.glow}`}   
                      value={pageSize}
                      onChange={e => {
                        setPageSize(parseInt(e.target.value, 10));
                        setPage(1);
                      }}
                    >
                      {[10, 25, 50, 100].map(n => (
                        <option key={n} value={n}>{n}/page</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/*Top songs card*/}
              <div className={styles.card}>
                <div className={styles.sidebarHeader}>
                  <div className={styles.subtitle}>Top Songs</div>
                  {errTop ? <span className={styles.err}>{errTop}</span> : null}
                </div>
                <div className={styles.topList}>
                  {loadingTop && <div className={styles.loading}>Loading…</div>}
                  {!loadingTop && top.length === 0 && <div className={styles.loading}>No data.</div>}
                  {!loadingTop && top.map((t, i) => (
                    <div key={t.songId} className={styles.topItem}>
                      <div className={styles.rank}>{i + 1}</div>
                      <div>
                        <button className={styles.link} onClick={() => handlePlay(t.songId)}>{t.songName}</button>
                        <div className={styles.topMeta}>
                          {t.artistId
                            ? <Link className={styles.link} to={`/musician/${t.artistId}`}>{t.artistName || "Artist"}</Link>
                            : (t.artistName || "")}
                          <span>•</span>
                          {t.albumId
                            ? <Link className={styles.link} to={`/album/${t.albumId}`}>{t.albumTitle || "Album"}</Link>
                            : (t.albumTitle || "")}
                          <span>•</span>
                          <span>{t.playCount} plays</span>
                        </div>
                      </div>
                      <div>{t.duration}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}