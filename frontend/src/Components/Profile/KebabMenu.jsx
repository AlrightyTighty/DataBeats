import { useEffect, useRef, useState } from "react";
import barMenu from "../../assets/barMenu.svg";
import styles from "./KebabMenu.module.css";

export default function KebabMenu({ onShare, onReport }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div className={styles.wrap} ref={ref}>
      <button
        type="button"
        aria-label="Menu"
        onClick={() => setOpen((v) => !v)}
        className={styles.trigger}
      >
        <img src={barMenu} alt="" className={styles.icon} />
      </button>

      {open && (
        <div className={styles.menu} role="menu">
          <button
            type="button"
            className={styles.btn}
            onClick={() => {
              setOpen(false);
              onShare?.();
            }}
            role="menuitem"
          >
            Share
          </button>

          <button
            type="button"
            className={styles.btn}
            onClick={() => {
              setOpen(false);
              onReport?.();
            }}
            role="menuitem"
          >
            Report
          </button>
        </div>
      )}
    </div>
  );
}
