import SearchResultsRow from "../Components/SearchResultsRow";
import styles from "./SearchResult.module.css";
import Topnav from "../Components/Topnav";
import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router";

export default function SearchResult() {
  const [queryParams, setQueryParams] = useSearchParams();

  const [searchResult, setSearchResult] = useState({ albums: [], artists: [], songs: [], users: [], playlists: [], events: [] });
  // Mock data for search results

  const artists = searchResult.artists;
  const albums = searchResult.albums;
  const songs = searchResult.songs;
  const users = searchResult.users;
  const playlists = searchResult.playlists;

  const loadedRef = useRef(false);

  useEffect(() => {
    if (loadedRef.current) return;

    loadedRef.current = true;
    (async () => {
      const results = await fetch(`http://localhost:5062/api/search?query=${queryParams.get("query")}`, {
        method: "GET",
      });
      setSearchResult(await results.json());
    })();
  });

  return (
    <>
      <Topnav />
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.headerTitle}>Search results for "{queryParams.get("query")}"</h1>
        </div>

        <SearchResultsRow title="Songs" items={songs} type="song" />
        <SearchResultsRow title="Artists" items={artists} type="artist" />
        <SearchResultsRow title="Albums" items={albums} type="album" />
        <SearchResultsRow title="Playlists" items={playlists} type="playlist" />
        <SearchResultsRow title="Users" items={users} type="user" />
      </div>
    </>
  );
}
