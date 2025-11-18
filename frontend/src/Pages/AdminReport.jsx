import { useEffect, useState, useCallback, useMemo } from "react";
import Topnav from "../Components/Topnav";
import useMe from "../Components/UseMe";
import styles from "./AdminReport.module.css";

const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:5062";

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

// format dates
function formatDateCell(raw) {
  if (!raw) return "";
  const str = String(raw);
  return str.includes("T") ? str.split("T")[0] : str;
}

export default function AdminReport() {
  const { me, loading: authLoading } = useMe();
  const userId = useMemo(() => me?.userId ?? me?.UserId ?? null, [me]);

  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // table (view) to show rows for
  const [entity, setEntity] = useState("users");
  const [rows, setRows] = useState([]);
  const [rowsLoading, setRowsLoading] = useState(false);
  const [rowsError, setRowsError] = useState("");
  const [rowSearch, setRowSearch] = useState("");
  const [sortMode, setSortMode] = useState("none"); // none, date-asc, date-desc, name-asc, name-desc

  // user activity
  const [userQuery, setUserQuery] = useState("");
  const [userReport, setUserReport] = useState(null);
  const [userLoading, setUserLoading] = useState(false);
  const [userError, setUserError] = useState("");

  const loadReport = useCallback(
    async (overrideFrom, overrideTo) => {
      if (!userId) {
        setError("You must be logged in to view this report.");
        return;
      }

      setLoading(true);
      setError("");

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
        });

        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || `Request failed with status ${res.status}`);
        }

        const data = await res.json();
        setReport(data);

        if (!from && data.from) {
          setFrom((data.from || "").split("T")[0]);
        }
        if (!to && data.to) {
          setTo((data.to || "").split("T")[0]);
        }
      } catch (e) {
        setError(e.message || "Failed to load report.");
      } finally {
        setLoading(false);
      }
    },
    [userId, from, to]
  );

  useEffect(() => {
    if (userId) {
      loadReport();
    }
  }, [userId, loadReport]);

  function onApply(e) {
    e.preventDefault();
    loadReport(from, to);
    loadRows(entity, from, to);
  }

  const loadRows = useCallback(
    async (entityKey, overrideFrom, overrideTo) => {
      if (!userId) return;

      setRowsLoading(true);
      setRowsError("");
      setRows([]);

      try {
        const params = new URLSearchParams();
        if (overrideFrom) params.append("from", overrideFrom);
        if (overrideTo) params.append("to", overrideTo);

        const url =
          params.toString().length > 0
            ? `${API}/api/admin/report/${entityKey}?${params.toString()}`
            : `${API}/api/admin/report/${entityKey}`;

        const res = await fetch(url, {
          headers: {
            "X-UserId": String(userId),
          },
        });

        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || `Request failed with status ${res.status}`);
        }

        const data = await res.json();
        setRows(Array.isArray(data) ? data : []);
      } catch (err) {
        setRowsError(err.message || "Failed to load rows.");
      } finally {
        setRowsLoading(false);
      }
    },
    [userId]
  );

  useEffect(() => {
    if (userId) {
      loadRows(entity, from, to);
    }
  }, [userId, entity, from, to, loadRows]);

  async function onLoadUserActivity(e) {
    e.preventDefault();
    setUserReport(null);
    setUserError("");

    const trimmed = userQuery.trim();
    if (!trimmed) {
      setUserError("Please enter a user id.");
      return;
    }

    if (!userId) {
      setUserError("You must be logged in as admin.");
      return;
    }

    setUserLoading(true);
    try {
      const params = new URLSearchParams();
      if (from) params.append("from", from);
      if (to) params.append("to", to);

      const url =
        params.toString().length > 0
          ? `${API}/api/admin/report/user/${trimmed}?${params.toString()}`
          : `${API}/api/admin/report/user/${trimmed}`;

      const res = await fetch(url, {
        headers: {
          "X-UserId": String(userId),
        },
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Request failed with status ${res.status}`);
      }

      const data = await res.json();
      setUserReport(data);
    } catch (err) {
      setUserError(err.message || "Failed to load user activity.");
    } finally {
      setUserLoading(false);
    }
  }

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

  //rows table header ===
  function renderTableHeader() {
    switch (entity) {
      case "users":
        return (
          <tr>
            <th>User ID</th>
            <th>Username</th>
            <th>Created</th>
            <th>Deleted</th>
            <th>Is Deleted</th>
          </tr>
        );
      case "musicians":
        return (
          <tr>
            <th>Musician ID</th>
            <th>User ID</th>
            <th>Name</th>
            <th>Created</th>
            <th>Deleted</th>
            <th>Followers</th>
            <th>Monthly Listeners</th>
            <th>Is Deleted</th>
          </tr>
        );
      case "playlists":
        return (
          <tr>
            <th>Playlist ID</th>
            <th>Name</th>
            <th>User ID</th>
            <th>Created</th>
            <th>Deleted</th>
            <th>Is Deleted</th>
          </tr>
        );
      case "albums":
        return (
          <tr>
            <th>Album ID</th>
            <th>Title</th>
            <th>Created By</th>
            <th>Created</th>
            <th>Deleted</th>
            <th>Release Date</th>
            <th># Songs</th>
            <th>Is Deleted</th>
          </tr>
        );
      case "events":
        return (
          <tr>
            <th>Event ID</th>
            <th>Title</th>
            <th>Musician ID</th>
            <th>Created</th>
            <th>Deleted</th>
            <th>Event Time</th>
            <th>Is Deleted</th>
          </tr>
        );
      case "songs":
        return (
          <tr>
            <th>Song ID</th>
            <th>Name</th>
            <th>Album ID</th>
            <th>Created By</th>
            <th>Created</th>
            <th>Deleted</th>
            <th>Streams</th>
            <th>Is Deleted</th>
          </tr>
        );
      default:
        return null;
    }
  }

  // search
  const lowerSearch = rowSearch.toLowerCase();
  const filteredRows = rows.filter((row) => {
    if (!lowerSearch) return true;

    let haystack = "";
    switch (entity) {
      case "users":
        haystack = `${val(row, "username") ?? ""} ${
          val(row, "userId", "user_Id") ?? ""
        }`;
        break;
      case "musicians":
        haystack = `${val(row, "musicianName", "musician_name") ?? ""} ${
          val(row, "musicianId", "musician_Id") ?? ""
        } ${val(row, "userId", "user_Id") ?? ""}`;
        break;
      case "playlists":
        haystack = `${val(row, "playlistName", "playlist_name") ?? ""} ${
          val(row, "playlistId", "playlist_id") ?? ""
        }`;
        break;
      case "albums":
        haystack = `${val(row, "albumTitle", "album_title") ?? ""} ${
          val(row, "albumId", "album_id") ?? ""
        }`;
        break;
      case "events":
        haystack = `${val(row, "title") ?? ""} ${
          val(row, "eventId", "event_id") ?? ""
        }`;
        break;
      case "songs":
        haystack = `${val(row, "songName", "song_name") ?? ""} ${
          val(row, "songId", "song_id") ?? ""
        }`;
        break;
      default:
        haystack = "";
    }

    return haystack.toLowerCase().includes(lowerSearch);
  });

  //sorting
  function getCreatedValue(row) {
    switch (entity) {
      case "users":
        return val(row, "timeCreated", "time_created");
      case "musicians":
      case "playlists":
      case "albums":
      case "events":
      case "songs":
        return val(row, "timestampCreated", "timestamp_created");
      default:
        return null;
    }
  }

  function getNameValue(row) {
    switch (entity) {
      case "users":
        return val(row, "username") ?? "";
      case "musicians":
        return val(row, "musicianName", "musician_name") ?? "";
      case "playlists":
        return val(row, "playlistName", "playlist_name") ?? "";
      case "albums":
        return val(row, "albumTitle", "album_title") ?? "";
      case "events":
        return val(row, "title") ?? "";
      case "songs":
        return val(row, "songName", "song_name") ?? "";
      default:
        return "";
    }
  }

  //sorting
  const sortedRows = [...filteredRows];
  if (sortMode !== "none") {
    sortedRows.sort((a, b) => {
      if (sortMode === "date-asc" || sortMode === "date-desc") {
        const dA = getCreatedValue(a);
        const dB = getCreatedValue(b);
        const tA = dA ? new Date(dA).getTime() : 0;
        const tB = dB ? new Date(dB).getTime() : 0;
        return sortMode === "date-asc" ? tA - tB : tB - tA;
      }

      if (sortMode === "name-asc" || sortMode === "name-desc") {
        const nA = getNameValue(a).toLowerCase();
        const nB = getNameValue(b).toLowerCase();
        if (nA < nB) return sortMode === "name-asc" ? -1 : 1;
        if (nA > nB) return sortMode === "name-asc" ? 1 : -1;
        return 0;
      }

      return 0;
    });
  }

  function renderTableBody() {
    if (sortedRows.length === 0) {
      return (
        <tr>
          <td colSpan={10} style={{ textAlign: "center", padding: "12px 0" }}>
            No rows found.
          </td>
        </tr>
      );
    }

    return sortedRows.map((row, index) => {
      switch (entity) {
        case "users":
          return (
            <tr key={index}>
              <td>{val(row, "userId", "user_Id")}</td>
              <td>{val(row, "username")}</td>
              <td>
                {formatDateCell(val(row, "timeCreated", "time_created")) || "—"}
              </td>
              <td>
                {formatDateCell(val(row, "timeDeleted", "time_deleted")) || "—"}
              </td>
              <td>{val(row, "isDeleted", "IsDeleted") ? "Yes" : "No"}</td>
            </tr>
          );
        case "musicians":
          return (
            <tr key={index}>
              <td>{val(row, "musicianId", "musician_Id")}</td>
              <td>{val(row, "userId", "user_Id")}</td>
              <td>{val(row, "musicianName", "musician_name")}</td>
              <td>
                {formatDateCell(
                  val(row, "timestampCreated", "timestamp_created")
                ) || "—"}
              </td>
              <td>
                {formatDateCell(
                  val(row, "timestampDeleted", "timestamp_deleted")
                ) || "—"}
              </td>
              <td>{val(row, "followerCount", "follower_count") ?? 0}</td>
              <td>
                {val(row, "monthlyListenerCount", "monthly_listener_count") ??
                  0}
              </td>
              <td>{val(row, "isDeleted", "IsDeleted") ? "Yes" : "No"}</td>
            </tr>
          );
        case "playlists":
          return (
            <tr key={index}>
              <td>{val(row, "playlistId", "playlist_id")}</td>
              <td>{val(row, "playlistName", "playlist_name")}</td>
              <td>{val(row, "userId", "user_id", "user_Id")}</td>
              <td>
                {formatDateCell(
                  val(row, "timestampCreated", "timestamp_created")
                ) || "—"}
              </td>
              <td>
                {formatDateCell(
                  val(row, "timestampDeleted", "timestamp_deleted")
                ) || "—"}
              </td>
              <td>{val(row, "isDeleted", "IsDeleted") ? "Yes" : "No"}</td>
            </tr>
          );
        case "albums":
          return (
            <tr key={index}>
              <td>{val(row, "albumId", "album_id")}</td>
              <td>{val(row, "albumTitle", "album_title")}</td>
              <td>{val(row, "createdBy", "created_by")}</td>
              <td>
                {formatDateCell(
                  val(row, "timestampCreated", "timestamp_created")
                ) || "—"}
              </td>
              <td>
                {formatDateCell(
                  val(row, "timestampDeleted", "timestamp_deleted")
                ) || "—"}
              </td>
              <td>
                {formatDateCell(val(row, "releaseDate", "release_date")) || "—"}
              </td>
              <td>{val(row, "numSongs", "num_songs") ?? 0}</td>
              <td>{val(row, "isDeleted", "IsDeleted") ? "Yes" : "No"}</td>
            </tr>
          );
        case "events":
          return (
            <tr key={index}>
              <td>{val(row, "eventId", "event_id")}</td>
              <td>{val(row, "title")}</td>
              <td>{val(row, "musicianId", "musician_id")}</td>
              <td>
                {formatDateCell(
                  val(row, "timestampCreated", "timestamp_created")
                ) || "—"}
              </td>
              <td>
                {formatDateCell(
                  val(row, "timestampDeleted", "timestamp_deleted")
                ) || "—"}
              </td>
              <td>
                {formatDateCell(val(row, "eventTime", "event_time")) || "—"}
              </td>
              <td>{val(row, "isDeleted", "IsDeleted") ? "Yes" : "No"}</td>
            </tr>
          );
        case "songs":
          return (
            <tr key={index}>
              <td>{val(row, "songId", "song_id")}</td>
              <td>{val(row, "songName", "song_name")}</td>
              <td>{val(row, "albumId", "album_id")}</td>
              <td>{val(row, "createdBy", "created_by")}</td>
              <td>
                {formatDateCell(
                  val(row, "timestampCreated", "timestamp_created")
                ) || "—"}
              </td>
              <td>
                {formatDateCell(
                  val(row, "timestampDeleted", "timestamp_deleted")
                ) || "—"}
              </td>
              <td>{val(row, "streams") ?? 0}</td>
              <td>{val(row, "isDeleted", "IsDeleted") ? "Yes" : "No"}</td>
            </tr>
          );
        default:
          return null;
      }
    });
  }

  //Export CSV
  function onExportCsv() {
    if (sortedRows.length === 0) {
      return;
    }

    let headers = [];
    let rowsData = [];

    switch (entity) {
      case "users":
        headers = [
          "UserId",
          "Username",
          "TimeCreated",
          "TimeDeleted",
          "IsDeleted",
        ];
        rowsData = sortedRows.map((r) => [
          val(r, "userId", "user_Id"),
          val(r, "username"),
          formatDateCell(val(r, "timeCreated", "time_created")),
          formatDateCell(val(r, "timeDeleted", "time_deleted")),
          val(r, "isDeleted", "IsDeleted") ? "Yes" : "No",
        ]);
        break;

      case "musicians":
        headers = [
          "MusicianId",
          "UserId",
          "MusicianName",
          "TimestampCreated",
          "TimestampDeleted",
          "FollowerCount",
          "MonthlyListenerCount",
          "IsDeleted",
        ];
        rowsData = sortedRows.map((r) => [
          val(r, "musicianId", "musician_Id"),
          val(r, "userId", "user_Id"),
          val(r, "musicianName", "musician_name"),
          formatDateCell(val(r, "timestampCreated", "timestamp_created")),
          formatDateCell(val(r, "timestampDeleted", "timestamp_deleted")),
          val(r, "followerCount", "follower_count") ?? 0,
          val(r, "monthlyListenerCount", "monthly_listener_count") ?? 0,
          val(r, "isDeleted", "IsDeleted") ? "Yes" : "No",
        ]);
        break;

      case "playlists":
        headers = [
          "PlaylistId",
          "PlaylistName",
          "UserId",
          "TimestampCreated",
          "TimestampDeleted",
          "IsDeleted",
        ];
        rowsData = sortedRows.map((r) => [
          val(r, "playlistId", "playlist_id"),
          val(r, "playlistName", "playlist_name"),
          val(r, "userId", "user_id", "user_Id"),
          formatDateCell(val(r, "timestampCreated", "timestamp_created")),
          formatDateCell(val(r, "timestampDeleted", "timestamp_deleted")),
          val(r, "isDeleted", "IsDeleted") ? "Yes" : "No",
        ]);
        break;

      case "albums":
        headers = [
          "AlbumId",
          "AlbumTitle",
          "CreatedBy",
          "TimestampCreated",
          "TimestampDeleted",
          "ReleaseDate",
          "NumSongs",
          "IsDeleted",
        ];
        rowsData = sortedRows.map((r) => [
          val(r, "albumId", "album_id"),
          val(r, "albumTitle", "album_title"),
          val(r, "createdBy", "created_by"),
          formatDateCell(val(r, "timestampCreated", "timestamp_created")),
          formatDateCell(val(r, "timestampDeleted", "timestamp_deleted")),
          formatDateCell(val(r, "releaseDate", "release_date")),
          val(r, "numSongs", "num_songs") ?? 0,
          val(r, "isDeleted", "IsDeleted") ? "Yes" : "No",
        ]);
        break;

      case "events":
        headers = [
          "EventId",
          "Title",
          "MusicianId",
          "TimestampCreated",
          "TimestampDeleted",
          "EventTime",
          "IsDeleted",
        ];
        rowsData = sortedRows.map((r) => [
          val(r, "eventId", "event_id"),
          val(r, "title"),
          val(r, "musicianId", "musician_id"),
          formatDateCell(val(r, "timestampCreated", "timestamp_created")),
          formatDateCell(val(r, "timestampDeleted", "timestamp_deleted")),
          formatDateCell(val(r, "eventTime", "event_time")),
          val(r, "isDeleted", "IsDeleted") ? "Yes" : "No",
        ]);
        break;

      case "songs":
        headers = [
          "SongId",
          "SongName",
          "AlbumId",
          "CreatedBy",
          "TimestampCreated",
          "TimestampDeleted",
          "Streams",
          "IsDeleted",
        ];
        rowsData = sortedRows.map((r) => [
          val(r, "songId", "song_id"),
          val(r, "songName", "song_name"),
          val(r, "albumId", "album_id"),
          val(r, "createdBy", "created_by"),
          formatDateCell(val(r, "timestampCreated", "timestamp_created")),
          formatDateCell(val(r, "timestampDeleted", "timestamp_deleted")),
          val(r, "streams") ?? 0,
          val(r, "isDeleted", "IsDeleted") ? "Yes" : "No",
        ]);
        break;

      default:
        return;
    }

    const lines = [
      headers.map(csvEscape).join(","),
      ...rowsData.map((cols) => cols.map(csvEscape).join(",")),
    ];

    const csvContent = lines.join("\n");

    const safeFrom =
      from || (report?.from ? report.from.split("T")[0] : "from");
    const safeTo = to || (report?.to ? report.to.split("T")[0] : "to");

    const fileName = `admin-${entity}-${safeFrom}-${safeTo}.csv`;

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  return (
    <div className={styles.page}>
      <Topnav />
      <div className={styles.inner}>
        {/*header- date filters */}
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
            <button type="submit" className={styles.applyButton}>
              Apply
            </button>
          </form>
        </div>

        {loading && <div className={styles.status}>Loading report…</div>}
        {error && <div className={styles.error}>{error}</div>}

        {report && !loading && !error && (
          <>
            {/* Range*/}
            <div className={styles.rangeInfo}>
              <span>
                Range:{" "}
                {report.from
                  ? report.from.split("T")[0]
                  : from || "last 30 days"}{" "}
                → {report.to ? report.to.split("T")[0] : to || "now"}
              </span>
            </div>

            {/* grids header */}
            <div className={styles.grid}>
              <SummaryCard title="Users" data={report.users} />
              <SummaryCard title="Musicians" data={report.musicians} />
              <SummaryCard title="Playlists" data={report.playlists} />
              <SummaryCard title="Albums" data={report.albums} />
              <SummaryCard title="Events" data={report.events} />
              <SummaryCard title="Songs" data={report.songs} />
            </div>

            {/* row + filter*/}
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
                    placeholder="Search by name / id…"
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
                    <option value="name-asc">Name: A → Z</option>
                    <option value="name-desc">Name: Z → A</option>
                  </select>
                </div>
                <button
                  type="button"
                  className={styles.applyButton}
                  onClick={onExportCsv}
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

            {/*user activity */}
            <div style={{ marginTop: 24 }}>
              <h2 className={styles.title} style={{ fontSize: 20 }}>
                User Activity
              </h2>
              <p className={styles.subTitle}>
                Look up account info for a specific user id within this date
                range.
              </p>

              <form
                onSubmit={onLoadUserActivity}
                className={styles.filters}
                style={{ marginTop: 10, marginBottom: 10 }}
              >
                <div className={styles.filterField}>
                  <label htmlFor="userIdInput">User ID</label>
                  <input
                    id="userIdInput"
                    type="number"
                    min="1"
                    value={userQuery}
                    onChange={(e) => setUserQuery(e.target.value)}
                    placeholder="Enter user id…"
                  />
                </div>
                <button type="submit" className={styles.applyButton}>
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
                    <span>User ID</span>
                    <span>{userReport.userId ?? "—"}</span>
                  </div>
                  <div className={styles.cardRow}>
                    <span>Username</span>
                    <span>{userReport.username ?? "—"}</span>
                  </div>
                  <div className={styles.cardRow}>
                    <span>Created</span>
                    <span>
                      {userReport.timeCreated
                        ? String(userReport.timeCreated).split("T")[0]
                        : "—"}
                    </span>
                  </div>
                  <div className={styles.cardRow}>
                    <span>Deleted</span>
                    <span>
                      {userReport.timeDeleted
                        ? String(userReport.timeDeleted).split("T")[0]
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
