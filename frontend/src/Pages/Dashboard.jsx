import { useEffect, useMemo, useState, useRef } from "react";
import { useNavigate } from "react-router";
import Topnav from "../Components/Topnav";
import { PlaylistSection } from "../Components/PlaylistSection";
import ContextMenu from "../Components/ContextMenu";
import API from "../lib/api";
import useMe from "../Components/UseMe";
import styles from "./Dashboard.module.css";
import "./Events.css";

export default function Dashboard() {
  const navigate = useNavigate();
  const { me, loading: authLoading } = useMe();
  const userId = useMemo(() => me?.userId ?? me?.UserId ?? null, [me]);
  const musicianId = useMemo(
    () => me?.musicianId ?? me?.MusicianId ?? null,
    [me]
  );
  const username = useMemo(() => me?.username ?? me?.Username ?? "there", [me]);

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
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (authLoading) return;
    if (!userId) return;

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
          fetch(`${API}/api/playlist/me`, { credentials: "include" }),
          fetch(`${API}/api/event`, { credentials: "include" }),
          fetch(`${API}/api/album`, { credentials: "include" }),
          fetch(`${API}/api/history/top-songs?limit=50`, {
            credentials: "include",
            headers: { "X-UserId": String(userId) },
          }),
          fetch(`${API}/api/follow/followers/${userId}`, {
            credentials: "include",
          }),
          fetch(`${API}/api/follow/following/${userId}`, {
            credentials: "include",
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

        // Playlists
        const owned =
          playlistResponse.ownedPlaylists ??
          playlistResponse.OwnedPlaylists ??
          [];
        const contrib =
          playlistResponse.contributorPlaylists ??
          playlistResponse.ContributorPlaylists ??
          [];
        const allPlaylists = [...owned, ...contrib];

        const likedName = "Your Liked Playlist";
        const liked = allPlaylists.find(
          (p) => (p.playlistName ?? p.PlaylistName) === likedName
        );
        const others = allPlaylists.filter((p) => p !== liked);
        const playlistsToShow = liked
          ? [liked, ...others.slice(0, 4)]
          : allPlaylists.slice(0, 5);

        const playlistsWithContext = playlistsToShow.map((playlist) => {
          const id = playlist.playlistId ?? playlist.PlaylistId;
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
        setEvents(
          (Array.isArray(eventsResponse) ? eventsResponse : []).slice(0, 4)
        );

        // New uploads
        const albumsArr = Array.isArray(albumsResponse) ? albumsResponse : [];
        const now = new Date();
        const monthAgo = new Date();
        monthAgo.setMonth(now.getMonth() - 1);

        const recent = albumsArr
          .filter((a) => {
            const raw =
              a.releaseDate ?? a.ReleaseDate ?? a.timestampReleased ?? null;
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
        const followingIds = new Set(
          following.map((u) => u.userId ?? u.UserId)
        );
        const friendsList = followers
          .filter((u) => followingIds.has(u.userId ?? u.UserId))
          .slice(0, 6);
        setFriends(friendsList);
      } catch (err) {
        console.error("Error loading dashboard:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [authLoading, userId, navigate]);

  const gotoPlaylists = () => navigate("/playlists");

  return (
    <>
      <Topnav />
      <ContextMenu
        ref={contextMenuRef}
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
                Welcome to DataBeats, {username}!
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
              onClick={() => navigate("/recent-plays/${profileUserId})")}
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
              <span className={styles.viewAll} onClick={gotoPlaylists}>
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

                  const artistDisplay =
                    e.musicianName ??
                    e.MusicianName ??
                    e.musician?.musicianName ??
                    e.musician?.MusicianName ??
                    "Artist";

                  return (
                    <div
                      key={e.eventId ?? e.EventId}
                      className="event-card"
                      onClick={() =>
                        navigate(`/event/${e.eventId ?? e.EventId}`)
                      }
                      tabIndex={0}
                      onKeyDown={(ev) => {
                        if (ev.key === "Enter" || ev.key === " ") {
                          navigate(`/event/${e.eventId ?? e.EventId}`);
                        }
                      }}
                    >
                      <div className="media">
                        <div className="media-inner">
                          {imgSrc ? (
                            <img src={imgSrc} alt={e.title} loading="lazy" />
                          ) : (
                            <img
                              alt={e.title}
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
                            {e.title ?? e.EventTitle ?? "Event"}
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
                  const albumId = a.albumId ?? a.AlbumId;
                  const artFileId =
                    a.albumOrSongArtFileId ?? a.AlbumOrSongArtFileId;
                  const coverSrc = artFileId
                    ? `${API}/api/art/view/${artFileId}`
                    : null;
                  const title = a.albumTitle ?? a.AlbumTitle ?? "Album";
                  const artistName =
                    a.musicianName ??
                    a.MusicianName ??
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
                    key={f.userId ?? f.UserId}
                    type="button"
                    className={styles.friendCard}
                    onClick={() => navigate(`/user/${f.userId ?? f.UserId}`)}
                  >
                    <div className={styles.friendAvatar} />
                    <div className={styles.friendName}>
                      @{f.username ?? f.Username}
                    </div>
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
                  const title = s.songName ?? s.SongName;
                  const artist =
                    s.artistName ??
                    s.ArtistName ??
                    s.musicianName ??
                    s.MusicianName ??
                    "Unknown";
                  const album = s.albumTitle ?? s.AlbumTitle ?? "";
                  return (
                    <div
                      key={s.songId ?? s.SongId ?? i}
                      className={styles.songRow}
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
