import React from "react";
import styles from "./ContextMenu.module.css";

const ContextMenu = ({ ref, items, functions, x, y, visible }) => {
  if (!visible) return null;

  const handleClick = (index, e) => {
    e.stopPropagation();
    functions[index]?.();
  };

  return (
    <div ref={ref} className={styles.contextMenu} style={{ top: y, left: x, position: "fixed" }}>
      {items.map((item, index) => (
        <div key={index} className={styles.contextMenuItem} onClick={(e) => handleClick(index, e)}>
          {item}
        </div>
      ))}
    </div>
  );
};

export default ContextMenu;
