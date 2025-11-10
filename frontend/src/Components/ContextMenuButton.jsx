import reportSymbol from "../assets/graphics/context menu.png";
import styles from "./ContextMenuButton.module.css";

const ContextMenuButton = ({ right, left, top, bottom, width, height, functions, setContextMenu, items }) => {
  return (
    <img
      onClick={(event) => {
        event.stopPropagation();
        setContextMenu({ items: items, functions: functions, x: event.clientX, y: event.clientY, visible: true });
      }}
      className={styles["context-menu-button"]}
      src={reportSymbol}
      style={{ width: width ?? "30px", height: height ?? "30px", right: right, left: left, top: top, bottom: bottom, position: "absolute" }}
    />
  );
};

export default ContextMenuButton;
