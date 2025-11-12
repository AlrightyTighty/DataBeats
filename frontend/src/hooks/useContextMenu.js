import { useEffect, useRef, useState } from "react";

export default function useContextMenu() {
  const contextMenuRef = useRef(null);

  const [contextMenu, setContextMenu] = useState({
    items: [],
    functions: [],
    x: 0,
    y: 0,
    visible: false,
  });

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

  return [contextMenuRef, contextMenu, setContextMenu];
}
