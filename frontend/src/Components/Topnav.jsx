import React, { useEffect, useRef } from "react";
import styles from "./Topnav.module.css";
import { appLogo } from "../App";
import { Link } from "react-router";
import Searchbar from "./Searchbar";

const Topnav = () => {
  // console.log(styles);

  return (
    <nav className={styles["topnav"]}>
      <div className={styles["links-and-logo"]}>
        <img className={styles["app-logo"]} src={appLogo} />
        <Link className={styles["link"]} to="/authtest">
          Dashboard
        </Link>
        <Link className={styles["link"]} to="/account">
          Account
        </Link>
        <Link className={styles["link"]} to="/events">
          Events
        </Link>
      </div>
      <div className={styles["searchbar-container"]}>
        <Searchbar />
      </div>
    </nav>
  );
};

export default Topnav;
