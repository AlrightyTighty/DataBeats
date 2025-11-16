import SearchResultsRow from "../Components/SearchResultsRow";
import styles from "./SearchResult.module.css";
import Topnav from "../Components/Topnav";
import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router";
import API from "../lib/api";

export default function SearchResult() {
  const [queryParams, setQueryParams] = useSearchParams();

  const [loading, setLoading] = useState(true);

  const [searchResult, setSearchResult] = useState({
    albums: [],
    artists: [],
    songs: [],
    users: [],
    playlists: [],
    events: [],
  });
  // Mock data for search results

  const { artists, albums, songs, playlists, users, events } = searchResult;

  useEffect(() => {
    setLoading(true);
    (async () => {
      const results = await fetch(
        `${API}/api/search?query=${queryParams.get("query")}`,
        {
          method: "GET",
        }
      );

      setLoading(false);
      setSearchResult(await results.json());
    })();
  }, [queryParams]);

  return (
    <>
      <Topnav />
      {(loading && (
        <div
          className="loader"
          style={{ position: "absolute", left: "50vw", top: "50vh" }}
        />
      )) || (
        <div className={styles.container}>
          <div className={styles.header}>
            <h1 className={styles.headerTitle}>
              Search results for "{queryParams.get("query")}"
            </h1>
          </div>

          <SearchResultsRow title="Songs" items={songs} type="song" />
          <SearchResultsRow title="Artists" items={artists} type="artist" />
          <SearchResultsRow title="Albums" items={albums} type="album" />
          <SearchResultsRow
            title="Playlists"
            items={playlists}
            type="playlist"
          />
          <SearchResultsRow title="Users" items={users} type="user" />
          <SearchResultsRow title="Events" items={events} type="event" />
        </div>
      )}
    </>
  );
}
