import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router";
import Topnav from "../Components/Topnav";
import useMe from "../Components/UseMe";
import styles from "./AdminReport.module.css";

const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:5062";

function formatIsoDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (!isNaN(d.getTime())) {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }
  return String(iso).split("T")[0] || String(iso);
}

function val(row, ...keys) {
  for (const k of keys) {
    if (row && row[k] !== undefined && row[k] !== null) return row[k];
  }
  return null;
}

function csvEscape(value) {
  if (value === null || value === undefined) return "";
  const str = String(value);
  if (str.includes('"') || str.includes(",") || str.includes("\n")) {
    return '"' + str.replace(/"/g, '""') + '"';
  }
  return str;
}

function normalizeReport(data = {}) {
  return {
    users: data.users ?? {},
    musicians: data.musicians ?? {},
    playlists: data.playlists ?? {},
    albums: data.albums ?? {},
    events: data.events ?? {},
    songs: data.songs ?? {},
    from: data.from ?? null,
    to: data.to ?? null,
  };
}

const ENTITY_COLUMNS = {
  users: [
    { key: "username", label: "Username" },
    { key: "timeCreated", label: "Created", fmt: formatIsoDate },
    { key: "timeDeleted", label: "Deleted", fmt: formatIsoDate },
    { key: "isDeleted", label: "IsDeleted", fmt: (v) => (v ? "Yes" : "No") },
  ],
  musicians: [
    { key: "username", label: "Username" },
    { key: "musicianName", label: "Musician" },
    { key: "timestampCreated", label: "Created", fmt: formatIsoDate },
    { key: "timestampDeleted", label: "Deleted", fmt: formatIsoDate },
    { key: "followerCount", label: "Followers", fmt: (v) => v ?? 0 },
    { key: "isDeleted", label: "IsDeleted", fmt: (v) => (v ? "Yes" : "No") },
  ],
  playlists: [
    { key: "playlistName", label: "Title" },
    { key: "username", label: "Username" },
    { key: "timestampCreated", label: "Created", fmt: formatIsoDate },
    { key: "timestampDeleted", label: "Deleted", fmt: formatIsoDate },
    { key: "isDeleted", label: "IsDeleted", fmt: (v) => (v ? "Yes" : "No") },
  ],
  albums: [
    { key: "albumTitle", label: "Title" },
    { key: "musicianName", label: "Musician" },
    { key: "timestampCreated", label: "Created", fmt: formatIsoDate },
    { key: "timestampDeleted", label: "Deleted", fmt: formatIsoDate },
    { key: "releaseDate", label: "Release Date", fmt: formatIsoDate },
    { key: "numSongs", label: "# Songs", fmt: (v) => v ?? 0 },
    { key: "isDeleted", label: "IsDeleted", fmt: (v) => (v ? "Yes" : "No") },
  ],
  events: [
    { key: "title", label: "Title" },
    { key: "musicianName", label: "Musician" },
    { key: "timestampCreated", label: "Created", fmt: formatIsoDate },
    { key: "timestampDeleted", label: "Deleted", fmt: formatIsoDate },
    { key: "eventTime", label: "Event Time", fmt: formatIsoDate },
    { key: "isDeleted", label: "IsDeleted", fmt: (v) => (v ? "Yes" : "No") },
  ],
  songs: [
    { key: "songName", label: "Title" },
    { key: "albumTitle", label: "Album" },
    { key: "musicianName", label: "Musician" },
    { key: "timestampCreated", label: "Created", fmt: formatIsoDate },
    { key: "timestampDeleted", label: "Deleted", fmt: formatIsoDate },
    { key: "streams", label: "Streams", fmt: (v) => v ?? 0 },
    { key: "isDeleted", label: "IsDeleted", fmt: (v) => (v ? "Yes" : "No") },
  ],
};

// summary cards
function SummaryCard({ title, data }) {
  if (!data) return null;

  const total =
    data.totalUsers ??
    data.totalMusicians ??
    data.totalPlaylists ??
    data.totalAlbums ??
    data.totalEvents ??
    data.totalSongs ??
    0;

  const active =
    data.activeUsers ??
    data.activeMusicians ??
    data.activePlaylists ??
    data.activeAlbums ??
    data.activeEvents ??
    data.activeSongs ??
    0;

  const deleted =
    data.deletedUsers ??
    data.deletedMusicians ??
    data.deletedPlaylists ??
    data.deletedAlbums ??
    data.deletedEvents ??
    data.deletedSongs ??
    0;

  const newInRange =
    data.newUsersInRange ??
    data.newMusiciansInRange ??
    data.newPlaylistsInRange ??
    data.newAlbumsInRange ??
    data.newEventsInRange ??
    data.newSongsInRange ??
    0;

  const deletedInRange =
    data.deletedUsersInRange ??
    data.deletedMusiciansInRange ??
    data.deletedPlaylistsInRange ??
    data.deletedAlbumsInRange ??
    data.deletedEventsInRange ??
    data.deletedSongsInRange ??
    0;

  return (
    <div className={styles.card}>
      <h2 className={styles.cardTitle}>{title}</h2>
      <div className={styles.cardRow}>
        <span>Total</span>
        <span>{total}</span>
      </div>
      <div className={styles.cardRow}>
        <span>Active</span>
        <span>{active}</span>
      </div>
      <div className={styles.cardRow}>
        <span>Deleted</span>
        <span>{deleted}</span>
      </div>
      <div className={styles.cardRow}>
        <span>New in range</span>
        <span>{newInRange}</span>
      </div>
      <div className={styles.cardRow}>
        <span>Deleted in range</span>
        <span>{deletedInRange}</span>
      </div>
    </div>
  );
}

export default function AdminReport() {
  const navigate = useNavigate();
  const { me, loading: authLoading } = useMe();
  const userId = me?.userId ?? me?.UserId ?? null;

  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [entity, setEntity] = useState("users");
  const [rows, setRows] = useState([]);
  const [rowsLoading, setRowsLoading] = useState(false);
  const [rowsError, setRowsError] = useState("");
  const [rowSearch, setRowSearch] = useState("");
  const [sortMode, setSortMode] = useState("none");

  const [userQuery, setUserQuery] = useState("");
  const [userReport, setUserReport] = useState(null);
  const [userLoading, setUserLoading] = useState(false);
  const [userError, setUserError] = useState("");

  useEffect(() => {
    if (!authLoading && !me) {
      navigate("/login");
    }
  }, [authLoading, me, navigate]);

  const fetchAdminSummary = useCallback(
    async (overrideFrom, overrideTo) => {
      if (!userId) {
        setError("You must be logged in to view this report.");
        return;
      }

      setLoading(true);
      setError("");

      const controller = new AbortController();
      try {
        const params = new URLSearchParams();
        if (overrideFrom) params.append("from", overrideFrom);
        if (overrideTo) params.append("to", overrideTo);

        const url =
          params.toString().length > 0
            ? `${API}/api/admin/report?${params.toString()}`
            : `${API}/api/admin/report`;

        const res = await fetch(url, {
          headers: {
            "X-UserId": String(userId),
          },
          credentials: "include",
          signal: controller.signal,
        });

        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || `Request failed with status ${res.status}`);
        }

        const data = await res.json();
        setReport(normalizeReport(data));

        if (!from && data.from) setFrom(String(data.from).split("T")[0]);
        if (!to && data.to) setTo(String(data.to).split("T")[0]);
      } catch (e) {
        if (e.name === "AbortError") return;
        setError(e.message || "Failed to load report.");
      } finally {
        setLoading(false);
      }

      return () => controller.abort();
    },
    [userId, from, to]
  );

  useEffect(() => {
    if (userId) {
      fetchAdminSummary();
    }
  }, [userId, fetchAdminSummary]);

  const fetchEntityRows = useCallback(
    async (entityKey, overrideFrom, overrideTo, search) => {
      if (!userId) return;

      setRowsLoading(true);
      setRowsError("");
      setRows([]);

      const controller = new AbortController();
      try {
        const params = new URLSearchParams();
        if (overrideFrom) params.append("from", overrideFrom);
        if (overrideTo) params.append("to", overrideTo);
        if (search) params.append("search", search);

        const url =
          params.toString().length > 0
            ? `${API}/api/admin/report/${entityKey}?${params.toString()}`
            : `${API}/api/admin/report/${entityKey}`;

        const res = await fetch(url, {
          headers: {
            "X-UserId": String(userId),
          },
          credentials: "include",
          signal: controller.signal,
        });

        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || `Request failed with status ${res.status}`);
        }

        const data = await res.json();
        setRows(Array.isArray(data) ? data : []);
      } catch (err) {
        if (err.name === "AbortError") return;
        setRowsError(err.message || "Failed to load rows.");
      } finally {
        setRowsLoading(false);
      }

      return () => controller.abort();
    },
    [userId]
  );

  useEffect(() => {
    if (userId) {
      fetchEntityRows(entity, from, to, rowSearch);
    }
  }, [userId, entity, from, to, rowSearch, fetchEntityRows]);

  function onApply(e) {
    e.preventDefault();
    fetchAdminSummary(from, to);
    fetchEntityRows(entity, from, to, rowSearch);
  }

  async function onLoadUserActivity(e) {
    e.preventDefault();
    setUserReport(null);
    setUserError("");

    const trimmed = userQuery.trim();
    if (!trimmed) {
      setUserError("Please enter a username.");
      return;
    }

    if (!userId) {
      setUserError("You must be logged in as admin.");
      return;
    }

    setUserLoading(true);
    const controller = new AbortController();
    try {
      const params = new URLSearchParams();
      params.append("username", trimmed);
      if (from) params.append("from", from);
      if (to) params.append("to", to);

      const url = `${API}/api/admin/report/users/activity?${params.toString()}`;

      const res = await fetch(url, {
        headers: {
          "X-UserId": String(userId),
        },
        credentials: "include",
        signal: controller.signal,
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Request failed with status ${res.status}`);
      }

      const data = await res.json();
      setUserReport(data);
    } catch (err) {
      if (err.name === "AbortError") return;
      setUserError(err.message || "Failed to load user activity.");
    } finally {
      setUserLoading(false);
    }

    return () => controller.abort();
  }

  // sorting
  const lowerSearch = rowSearch.toLowerCase();
  const filteredRows = rows.filter((row) => {
    if (!lowerSearch) return true;
    const meta = ENTITY_COLUMNS[entity] ?? [];
    const hay =
      (val(row, "username") ?? "") +
      " " +
      (val(row, "musicianName") ?? "") +
      " " +
      (val(row, "playlistName") ?? "") +
      " " +
      (val(row, "albumTitle") ?? "") +
      " " +
      (val(row, "title") ?? "") +
      " " +
      (val(row, "songName") ?? "");
    return hay.toLowerCase().includes(lowerSearch);
  });

  const sortedRows = [...filteredRows];
  if (sortMode !== "none") {
    sortedRows.sort((a, b) => {
      if (sortMode === "date-asc" || sortMode === "date-desc") {
        const aDate = val(a, "timeCreated", "timestampCreated");
        const bDate = val(b, "timeCreated", "timestampCreated");
        const tA = aDate ? new Date(aDate).getTime() : 0;
        const tB = bDate ? new Date(bDate).getTime() : 0;
        return sortMode === "date-asc" ? tA - tB : tB - tA;
      }
      if (sortMode === "deleted-asc" || sortMode === "deleted-desc") {
        const aDate = val(a, "timeDeleted", "timestampDeleted");
        const bDate = val(b, "timeDeleted", "timestampDeleted");
        const tA = aDate ? new Date(aDate).getTime() : 0;
        const tB = bDate ? new Date(bDate).getTime() : 0;
        return sortMode === "deleted-asc" ? tA - tB : tB - tA;
      }
      if (sortMode === "name-asc" || sortMode === "name-desc") {
        const nA = (
          val(
            a,
            "username",
            "musicianName",
            "playlistName",
            "albumTitle",
            "title",
            "songName"
          ) || ""
        ).toLowerCase();
        const nB = (
          val(
            b,
            "username",
            "musicianName",
            "playlistName",
            "albumTitle",
            "title",
            "songName"
          ) || ""
        ).toLowerCase();
        if (nA < nB) return sortMode === "name-asc" ? -1 : 1;
        if (nA > nB) return sortMode === "name-asc" ? 1 : -1;
        return 0;
      }
      return 0;
    });
  }

  function renderTableHeader() {
    const cols = ENTITY_COLUMNS[entity] ?? [];
    if (cols.length === 0) return null;
    return (
      <tr>
        {cols.map((c) => (
          <th key={c.key}>{c.label}</th>
        ))}
      </tr>
    );
  }

  function renderTableBody() {
    if (sortedRows.length === 0) {
      return (
        <tr>
          <td colSpan={20} style={{ textAlign: "center", padding: "12px 0" }}>
            No rows found.
          </td>
        </tr>
      );
    }

    const cols = ENTITY_COLUMNS[entity] ?? [];

    return sortedRows.map((row, index) => (
      <tr key={index}>
        {cols.map((c) => {
          const raw = val(row, c.key);
          const cell = c.fmt ? c.fmt(raw) : raw ?? "";
          return <td key={c.key}>{cell}</td>;
        })}
      </tr>
    ));
  }

  // export csv
  const onExportCsv = useCallback(() => {
    if (sortedRows.length === 0) return;

    const cols = ENTITY_COLUMNS[entity] ?? [];
    const headers = cols.map((c) => c.label);
    const rowsData = sortedRows.map((r) =>
      cols
        .map((c) => {
          const raw = val(r, c.key);
          const v = c.fmt ? c.fmt(raw) : raw;
          return csvEscape(v);
        })
        .join(",")
    );

    const lines = [headers.map(csvEscape).join(","), ...rowsData];
    const csvContent = lines.join("\n");

    const safeFrom =
      from || (report?.from ? report.from.split("T")[0] : "from");
    const safeTo = to || (report?.to ? report.to.split("T")[0] : "to");
    const fileName = `admin-${entity}-${safeFrom}-${safeTo}.csv`;

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [sortedRows, entity, from, to, report]);

  if (authLoading) {
    return (
      <div className={styles.page}>
        <Topnav />
        <div className={styles.inner}>
          <div className={styles.status}>Checking login…</div>
        </div>
      </div>
    );
  }

  if (!userId && !authLoading) {
    return (
      <div className={styles.page}>
        <Topnav />
        <div className={styles.inner}>
          <div className={styles.error}>
            You must be logged in to view this report.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <Topnav />
      <div className={styles.inner}>
        <div className={styles.headerRow}>
          <div>
            <h1 className={styles.title}>DataBeats Activity Report</h1>
            <p className={styles.subTitle}>
              Overview of users, musicians, playlists, albums, events and songs.
            </p>
          </div>

          <form className={styles.filters} onSubmit={onApply}>
            <div className={styles.filterField}>
              <label htmlFor="from">From</label>
              <input
                id="from"
                type="date"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
              />
            </div>
            <div className={styles.filterField}>
              <label htmlFor="to">To</label>
              <input
                id="to"
                type="date"
                value={to}
                onChange={(e) => setTo(e.target.value)}
              />
            </div>
            <button
              type="submit"
              className={styles.applyButton}
              disabled={loading}
            >
              Apply
            </button>
          </form>
        </div>

        {loading && <div className={styles.status}>Loading report…</div>}
        {error && <div className={styles.error}>{error}</div>}

        {report && !loading && !error && (
          <>
            <div className={styles.rangeInfo}>
              <span>
                Range:{" "}
                {report.from
                  ? formatIsoDate(report.from)
                  : from || "last 30 days"}{" "}
                →{report.to ? formatIsoDate(report.to) : to || "now"}
              </span>
            </div>

            <div className={styles.grid}>
              <SummaryCard title="Users" data={report.users} />
              <SummaryCard title="Musicians" data={report.musicians} />
              <SummaryCard title="Playlists" data={report.playlists} />
              <SummaryCard title="Albums" data={report.albums} />
              <SummaryCard title="Events" data={report.events} />
              <SummaryCard title="Songs" data={report.songs} />
            </div>

            <div style={{ marginTop: 24 }}>
              <div className={styles.rowsToolbar}>
                <div className={styles.filterField}>
                  <label htmlFor="entitySelect">Table</label>
                  <select
                    id="entitySelect"
                    value={entity}
                    onChange={(e) => setEntity(e.target.value)}
                  >
                    <option value="users">Users</option>
                    <option value="musicians">Musicians</option>
                    <option value="playlists">Playlists</option>
                    <option value="albums">Albums</option>
                    <option value="events">Events</option>
                    <option value="songs">Songs</option>
                  </select>
                </div>

                <div className={styles.filterField}>
                  <label htmlFor="rowSearch">Search rows</label>
                  <input
                    id="rowSearch"
                    type="text"
                    placeholder="Search by name/title…"
                    value={rowSearch}
                    onChange={(e) => setRowSearch(e.target.value)}
                  />
                </div>

                <div className={styles.filterField}>
                  <label htmlFor="sortMode">Sort</label>
                  <select
                    id="sortMode"
                    value={sortMode}
                    onChange={(e) => setSortMode(e.target.value)}
                  >
                    <option value="none">None</option>
                    <option value="date-asc">Date: Old → New</option>
                    <option value="date-desc">Date: New → Old</option>
                    <option value="deleted-asc">Deleted: Old → New</option>
                    <option value="deleted-desc">Deleted: New → Old</option>
                    <option value="name-asc">Name: A → Z</option>
                    <option value="name-desc">Name: Z → A</option>
                  </select>
                </div>

                <button
                  type="button"
                  className={styles.applyButton}
                  onClick={onExportCsv}
                  disabled={sortedRows.length === 0}
                >
                  Export CSV
                </button>
              </div>

              {rowsLoading && (
                <div className={styles.status}>Loading rows…</div>
              )}
              {rowsError && <div className={styles.error}>{rowsError}</div>}

              <div className={styles.tableWrapper}>
                <table className={styles.table}>
                  <thead>{renderTableHeader()}</thead>
                  <tbody>{renderTableBody()}</tbody>
                </table>
              </div>
            </div>

            <div style={{ marginTop: 24 }}>
              <h2 className={styles.title} style={{ fontSize: 20 }}>
                User Activity
              </h2>
              <p className={styles.subTitle}>
                Look up account info for a specific username within this date
                range.
              </p>

              <form
                onSubmit={onLoadUserActivity}
                className={styles.filters}
                style={{ marginTop: 10, marginBottom: 10 }}
              >
                <div className={styles.filterField}>
                  <label htmlFor="userIdInput">Username</label>
                  <input
                    id="userIdInput"
                    type="text"
                    value={userQuery}
                    onChange={(e) => setUserQuery(e.target.value)}
                    placeholder="Enter username…"
                  />
                </div>
                <button
                  type="submit"
                  className={styles.applyButton}
                  disabled={userLoading}
                >
                  Load Activity
                </button>
              </form>

              {userLoading && (
                <div className={styles.status}>Loading user activity…</div>
              )}
              {userError && <div className={styles.error}>{userError}</div>}

              {userReport && !userLoading && !userError && (
                <div className={styles.card} style={{ marginTop: 8 }}>
                  <h3 className={styles.cardTitle}>User Activity</h3>
                  <div className={styles.cardRow}>
                    <span>Username</span>
                    <span>{userReport.username ?? "—"}</span>
                  </div>
                  <div className={styles.cardRow}>
                    <span>Created</span>
                    <span>
                      {userReport.timeCreated
                        ? formatIsoDate(userReport.timeCreated)
                        : "—"}
                    </span>
                  </div>
                  <div className={styles.cardRow}>
                    <span>Deleted</span>
                    <span>
                      {userReport.timeDeleted
                        ? formatIsoDate(userReport.timeDeleted)
                        : "Active"}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
