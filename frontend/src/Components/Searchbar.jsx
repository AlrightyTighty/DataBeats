import React, { useEffect, useState, useRef } from "react";
import styles from "./Searchbar.module.css";
import { useNavigate } from "react-router";

const Searchbar = () => {
  const [typingInBar, setTypingInBar] = useState(false);
  const searchbarRef = useRef();
  const navigate = useNavigate();

  const submitSearch = () => {
    if (!searchbarRef.current) return;

    navigate(`/Search?query=${searchbarRef.current.value}`);
  };

  useEffect(() => {
    if (!typingInBar) return;

    const handleKeystroke = (event) => {
      if (event.key == "Enter") {
        submitSearch();
      }
    };

    document.addEventListener("keydown", handleKeystroke);

    return () => {
      document.removeEventListener("keydown", handleKeystroke);
    };
  }, [typingInBar, searchbarRef]);

  return (
    <input
      type="text"
      onFocus={() => setTypingInBar(true)}
      onBlur={() => setTypingInBar(false)}
      ref={searchbarRef}
      className={styles["searchbar"]}
      placeholder="Search for a song, playlist, artist, or event!"
    />
  );
};

export default Searchbar;
