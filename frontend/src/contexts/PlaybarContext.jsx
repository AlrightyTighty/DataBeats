import { createContext, useContext, useState } from "react";

const PlaybarContext = createContext();

export const PlaybarProvider = ({ children }) => {
  const [playbarState, setPlaybarState] = useState({
    songId: null,
    albumId: null,
    playlistId: null,
    songList: [],
    visible: false,
  });

  return (
    <PlaybarContext.Provider value={{ playbarState, setPlaybarState }}>
      {children}
      {playbarState.visible && <div styles={{ height: "100px" }} />}
    </PlaybarContext.Provider>
  );
};

export const usePlaybar = () => {
  const context = useContext(PlaybarContext);
  if (!context) {
    throw new Error("usePlaybar must be used within a PlaybarProvider");
  }
  return context;
};
