import { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router";
import Topnav from "../Components/Topnav";
import { PlaylistSection } from "../Components/PlaylistSection";
import ContextMenu from "../Components/ContextMenu";
import API from "../lib/api";
import useMe from "../Components/UseMe";
import { usePlaybar } from "../contexts/PlaybarContext";
import styles from "./Dashboard.module.css";
import { useMemo } from "react";
import "./Events.css";

export default function Dashboard() {
  const navigate = useNavigate();
  const { me, loading: authLoading } = useMe();
  const { setPlaybarState } = usePlaybar();
  const userId = useMemo(() => me?.userId ?? me?.UserId ?? null, [me]);
  const musicianId = useMemo(
    () => me?.musicianId ?? me?.MusicianId ?? null,
    [me]
  );
  const username = useMemo(() => me?.username ?? me?.Username ?? "there", [me]);

  // Display firstname + lastname if available, otherwise fallback to username
  const displayName = useMemo(() => {
    const fname = me?.fname ?? me?.Fname;
    const lname = me?.lname ?? me?.Lname;
    
    if (fname && lname) {
      return `${fname} ${lname}`;
    } else if (fname) {
      return fname;
    } else {
      return username;
    }
  }, [me, username]);

  const [playlists, setPlaylists] = useState([]);
  const [events, setEvents] = useState([]);
  const [newAlbums, setNewAlbums] = useState([]);
  const [friends, setFriends] = useState([]);
  const [randomSongs, setRandomSongs] = useState([]);
  const [loading, setLoading] = useState(true);

  const [contextMenu, setContextMenu] = useState({
    items: [],
    functions: [],
    x: 0,
    y: 0,
    visible: false,
  });
  const contextMenuRef = useRef(null);

  useEffect(() => {
    if (!authLoading && !me) {
      navigate("/login");
    }
  }, [authLoading, me, navigate]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        contextMenuRef.current &&
        !contextMenuRef.current.contains(event.target)
      ) {
        setContextMenu({
          items: [],
          functions: [],
          x: 0,
          y: 0,
          visible: false,
        });
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (authLoading) return;
    if (!userId) return;

    const controller = new AbortController();
    let mounted = true;

    (async () => {
      try {
        setLoading(true);

        const [
          resPlaylists,
          resEvents,
          resAlbums,
          resTopSongs,
          resFollowers,
          resFollowing,
        ] = await Promise.all([
          fetch(`${API}/api/playlist/me`, {
            credentials: "include",
            signal: controller.signal,
          }),
          fetch(`${API}/api/event`, {
            credentials: "include",
            signal: controller.signal,
          }),
          fetch(`${API}/api/album`, {
            credentials: "include",
            signal: controller.signal,
          }),
          fetch(`${API}/api/history/top-songs?limit=50`, {
            credentials: "include",
            headers: { "X-UserId": String(userId) },
            signal: controller.signal,
          }),
          fetch(`${API}/api/follow/followers/${userId}`, {
            credentials: "include",
            signal: controller.signal,
          }),
          fetch(`${API}/api/follow/following/${userId}`, {
            credentials: "include",
            signal: controller.signal,
          }),
        ]);

        const playlistResponse = resPlaylists.ok
          ? await resPlaylists.json()
          : {};
        const eventsResponse = resEvents.ok ? await resEvents.json() : [];
        const albumsResponse = resAlbums.ok ? await resAlbums.json() : [];
        const topSongsResponse = resTopSongs.ok ? await resTopSongs.json() : {};
        const followersResponse = resFollowers.ok
          ? await resFollowers.json()
          : [];
        const followingResponse = resFollowing.ok
          ? await resFollowing.json()
          : [];

        if (!mounted) return;

        // Playlists
        const owned = Array.isArray(playlistResponse.ownedPlaylists)
          ? playlistResponse.ownedPlaylists
          : [];
        const contrib = Array.isArray(playlistResponse.contributorPlaylists)
          ? playlistResponse.contributorPlaylists
          : [];
        const allPlaylists = [...owned, ...contrib];

        const likedName = "Your Liked Playlist";
        const liked = allPlaylists.find((p) => p.playlistName === likedName);
        const others = allPlaylists.filter((p) => p !== liked);
        const playlistsToShow = liked
          ? [liked, ...others.slice(0, 4)]
          : allPlaylists.slice(0, 5);

        const playlistsWithContext = playlistsToShow.map((playlist) => {
          const id = playlist.playlistId;
          return {
            ...playlist,
            functions: [
              () => {
                navigate("/playlist/" + id);
              },
            ],
            items: ["View/Edit"],
            setContextMenu,
          };
        });
        setPlaylists(playlistsWithContext);

        // Events
        const rawEvents = Array.isArray(eventsResponse) ? eventsResponse : [];
        const sortedEvents = rawEvents.sort(
          (a, b) => new Date(b.eventTime) - new Date(a.eventTime)
        );
        setEvents(sortedEvents.slice(0, 4));

        // New uploads
        const albumsArr = Array.isArray(albumsResponse) ? albumsResponse : [];
        const now = new Date();
        const monthAgo = new Date(now);
        monthAgo.setMonth(now.getMonth() - 1);

        const recent = albumsArr
          .filter((a) => {
            const raw = a.releaseDate ?? null;
            if (!raw) return false;
            const d = new Date(raw);
            return d >= monthAgo && d <= now;
          })
          .slice(0, 5);
        setNewAlbums(recent);

        // Random songs
        const items = Array.isArray(topSongsResponse.items)
          ? topSongsResponse.items
          : [];
        const pool = [...items];
        const pick = [];
        while (pool.length && pick.length < 6) {
          const idx = Math.floor(Math.random() * pool.length);
          pick.push(pool.splice(idx, 1)[0]);
        }
        setRandomSongs(pick);

        // Friends
        const followers = Array.isArray(followersResponse)
          ? followersResponse
          : [];
        const following = Array.isArray(followingResponse)
          ? followingResponse
          : [];
        const followingIds = new Set(following.map((u) => u.userId));
        const friendsList = followers
          .filter((u) => followingIds.has(u.userId))
          .slice(0, 6);
        setFriends(friendsList);
      } catch (err) {
        if (err.name === "AbortError") {
          return;
        }
        console.error("Error loading dashboard:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
      controller.abort();
    };
  }, [authLoading, userId, navigate]);

  const gotoPlaylists = useCallback(() => navigate("/playlists"), [navigate]);
  const gotoRecentPlays = useCallback(() => {
    if (!userId) {
      navigate("/recent-plays");
    } else {
      navigate(`/recent-plays/${userId}`);
    }
  }, [navigate, userId]);

  const handlePlaySong = (song, songList = []) => {
    const songId = song.songId ?? song.SongId;
    const albumId = song.albumId ?? song.AlbumId ?? null;

    setPlaybarState({
      songId,
      albumId,
      songList: songList.length > 0 ? songList : [song],
      playlistId: null,
      visible: true,
    });
  };

  return (
    <>
      <Topnav />
      <ContextMenu
        menuRef={contextMenuRef}
        items={contextMenu.items}
        functions={contextMenu.functions}
        x={contextMenu.x}
        y={contextMenu.y}
        visible={contextMenu.visible}
      />
      <div className={styles.page}>
        <div className={styles.inner}>
          {/* Welcome + Become Musician */}
          <div className={styles.topRow}>
            <div>
              <h1 className={styles.welcome}>
                Welcome to DataBeats, {displayName}!
              </h1>
              <p className={styles.welcomeSub}>
                Jump back into your music, discover new releases, and see what
                your friends are listening to.
              </p>
            </div>
            {!musicianId && (
              <button
                className={styles.musicianBtn}
                onClick={() => navigate("/become-musician")}
              >
                Become a Musician
              </button>
            )}
          </div>

          {/* Sticky top tabs */}
          <div className={styles.taskbar}>
            <button
              type="button"
              onClick={() => navigate("/new")}
              className={styles.btn}
            >
              <div className={styles.btnHighlight} />
              <span>New Releases</span>
            </button>

            <button
              type="button"
              onClick={gotoPlaylists}
              className={styles.btn}
            >
              <div className={styles.btnHighlight} />
              <span>Playlists</span>
            </button>

            <button
              type="button"
              onClick={() => navigate("/albums")}
              className={styles.btn}
            >
              <div className={styles.btnHighlight} />
              <span>Browse Albums</span>
            </button>

            <button
              type="button"
              onClick={() => navigate("/artists")}
              className={styles.btn}
            >
              <div className={styles.btnHighlight} />
              <span>Browse Artists</span>
            </button>

            <button
              type="button"
              onClick={() => navigate("/events")}
              className={styles.btn}
            >
              <div className={styles.btnHighlight} />
              <span>Events</span>
            </button>

            <button
              type="button"
              onClick={gotoRecentPlays}
              className={styles.btn}
            >
              <div className={styles.btnHighlight} />
              <span>Recent Plays</span>
            </button>
          </div>

          {/* Playlists */}
          <section className={styles.section}>
            <div className={styles.sectionHead}>
              <h2>Playlists</h2>
              <span
                className={styles.viewAll}
                onClick={gotoPlaylists}
                role="button"
                tabIndex={0}
              >
                View All
              </span>
            </div>
            {loading ? (
              <p>Loading playlists...</p>
            ) : playlists.length === 0 ? (
              <p>No playlists found.</p>
            ) : (
              <PlaylistSection title="Your Playlists" playlists={playlists} />
            )}
          </section>

          {/* Events */}
          <section className={styles.section}>
            <div className={styles.sectionHead}>
              <h2>Events</h2>
              <span
                className={styles.viewAll}
                onClick={() => navigate("/events")}
                role="button"
                tabIndex={0}
              >
                View All
              </span>
            </div>
            {loading ? (
              <p>Loading events...</p>
            ) : events.length === 0 ? (
              <p>No events available.</p>
            ) : (
              <div className="events-grid">
                {events.map((e) => {
                  const id = e.eventId;
                  const inlineImg = e.imageBase64
                    ? `data:image/${e.imageFileExtension || "jpeg"};base64,${
                        e.imageBase64
                      }`
                    : null;
                  const viewUrl = e.eventPictureFileId
                    ? `${API}/api/event/file/view/${e.eventPictureFileId}`
                    : null;
                  const imgSrc = inlineImg || viewUrl;

                  const dateStr = e.eventTime
                    ? new Date(e.eventTime).toLocaleDateString(undefined, {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })
                    : "—";

                  const timeStr = e.eventTime
                    ? new Date(e.eventTime).toLocaleTimeString(undefined, {
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: true,
                      })
                    : "";

                  const priceStr = `$${Number(e.ticketPrice ?? 0).toFixed(2)}`;

                  const artistDisplay = e.musicianName ?? "Artist";

                  return (
                    <div
                      key={id}
                      className="event-card"
                      role="button"
                      tabIndex={0}
                      onClick={() => navigate(`/event/${id}`)}
                      onKeyDown={(ev) => {
                        if (
                          ev.key === "Enter" ||
                          ev.key === " " ||
                          ev.key === "Spacebar"
                        ) {
                          ev.preventDefault();
                          navigate(`/event/${id}`);
                        }
                      }}
                    >
                      <div className="media">
                        <div className="media-inner">
                          {imgSrc ? (
                            <img
                              src={imgSrc}
                              alt={e.title ?? "Event image"}
                              loading="lazy"
                            />
                          ) : (
                            <img
                              alt={e.title ?? "Event image"}
                              loading="lazy"
                              style={{
                                background: "#e5e7eb",
                                width: "100%",
                                height: "160px",
                                borderRadius: "12px",
                              }}
                            />
                          )}
                        </div>
                      </div>

                      <div className="event-card-content">
                        <div className="event-card-header">
                          <div className="event-title">
                            {e.title ?? "Event"}
                          </div>
                          <div className="event-artist">{artistDisplay}</div>
                        </div>

                        <div className="event-card-divider" />

                        <div className="event-card-footer">
                          <span className="event-meta">
                            {dateStr}
                            <br />
                            {timeStr}
                          </span>
                          <span className="event-price-badge">{priceStr}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* New uploads */}
          <section className={styles.section}>
            <div className={styles.sectionHead}>
              <h2>New Uploads</h2>
              <span className={styles.sectionHint}>
                Albums released in the last month
              </span>
            </div>
            {loading ? (
              <p>Loading new uploads...</p>
            ) : newAlbums.length === 0 ? (
              <p>No new uploads yet.</p>
            ) : (
              <div className={styles.cardGrid}>
                {newAlbums.map((a) => {
                  const albumId = a.albumId;
                  const artFileId = a.albumOrSongArtFileId;
                  const coverSrc = artFileId
                    ? `${API}/api/art/view/${artFileId}`
                    : null;
                  const title = a.albumTitle ?? "Album";
                  const artistName =
                    a.musicianName ??
                    (Array.isArray(a.artists) && a.artists.length > 0
                      ? a.artists.map((x) => x.artistName).join(", ")
                      : "New release");

                  return (
                    <button
                      key={albumId}
                      type="button"
                      className={styles.albumCard}
                      onClick={() => navigate(`/album/${albumId}`)}
                    >
                      {coverSrc ? (
                        <img
                          src={coverSrc}
                          alt={title}
                          className={styles.albumCover}
                          loading="lazy"
                        />
                      ) : (
                        <div className={styles.albumCover} />
                      )}
                      <div className={styles.albumInfo}>
                        <div className={styles.albumTitle}>{title}</div>
                        <div className={styles.albumMeta}>{artistName}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </section>

          {/* Friends */}
          <section className={styles.section}>
            <div className={styles.sectionHead}>
              <h2>Friends</h2>
            </div>
            {loading ? (
              <p>Loading friends...</p>
            ) : friends.length === 0 ? (
              <p>No friends yet.</p>
            ) : (
              <div className={styles.friendsGrid}>
                {friends.map((f) => (
                  <button
                    key={f.userId}
                    type="button"
                    className={styles.friendCard}
                    onClick={() => navigate(`/user/${f.userId}`)}
                  >
                    <div className={styles.friendName}>@{f.username}</div>
                  </button>
                ))}
              </div>
            )}
          </section>

          {/* Random songs */}
          <section className={styles.section}>
            <div className={styles.sectionHead}>
              <h2>Random Songs For You</h2>
            </div>
            {loading ? (
              <p>Loading songs...</p>
            ) : randomSongs.length === 0 ? (
              <p>No plays yet. Start listening to get recommendations.</p>
            ) : (
              <div className={styles.songList}>
                {randomSongs.map((s, i) => {
                  const title = s.songName ?? "Unknown";
                  const artist = s.artistName ?? "Unknown";
                  const album = s.albumTitle ?? "";
                  return (
                    <div
                      key={s.songId ?? s.SongId ?? i}
                      className={styles.songRow}
                      onClick={() =>   handlePlaySong(s, randomSongs)}
                      style={{ cursor: "pointer" }}
                    >
                      <div className={styles.songInfo}>
                        <span className={styles.songIndex}>{i + 1}.</span>
                        <div>
                          <div className={styles.songTitle}>{title}</div>
                          <div className={styles.songMeta}>
                            {artist}
                            {album ? ` • ${album}` : ""}
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        className={styles.playButton}
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePlaySong(s, randomSongs);
                        }}
                      >
                        ▶
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </div>
    </>
  );
}