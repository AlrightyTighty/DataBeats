import React, { useEffect, useState } from "react";
import styles from "./Topnav.module.css";
import { appLogo } from "../App";
import { Link } from "react-router";
import Searchbar from "./Searchbar";

const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:5062";

const Topnav = () => {
  const [accountPath, setAccountPath] = useState("/login");

  useEffect(() => {
    let dead = false;
    (async () => {
      try {
        const r = await fetch(`${API}/api/me`, { credentials: "include" });
        if (!r.ok) return;
        const me = await r.json();
        if (!dead && me?.userId) setAccountPath(`/user/${me.userId}`);
      } catch {}
    })();
    return () => {
      dead = true;
    };
  }, []);

  return (
    <nav className={styles["topnav"]}>
      <div className={styles["links-and-logo"]}>
        <img className={styles["app-logo"]} src={appLogo} />
        <Link className={styles["link"]} to="/authtest">
          Dashboard
        </Link>
        <Link className={styles["link"]} to={accountPath}>
          Account
        </Link>
        <Link className={styles["link"]} to="/events">
          Events
        </Link>
      </div>
      <div className={styles["searchbar-container"]}>
        <Searchbar />
      </div>
      <div className={styles["right-section"]}>
        <Link className={styles["link"]} to="/logout">
          Logout
        </Link>
      </div>
    </nav>
  );
};

export default Topnav;
