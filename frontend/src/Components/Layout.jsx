import { Outlet } from "react-router";
import Playbar from "./Playbar";
import { usePlaybar } from "../contexts/PlaybarContext";

const Layout = () => {
  const { playbarState } = usePlaybar();

  return (
    <>
      <Outlet />
      {playbarState.visible && <Playbar />}
    </>
  );
};

export default Layout;
