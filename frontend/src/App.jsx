import "./App.css";
import { useState } from "react";

import _appLogo from "./assets/graphics/DatabeatsLogo.png";

import { createBrowserRouter, RouterProvider } from "react-router";
import "./index.css";

import Login from "./Pages/Login.jsx";
import Signup from "./Pages/Signup.jsx";
import Authtest from "./Pages/Authtest.jsx";
import Register from "./Pages/Register.jsx";
import Stream from "./Pages/Stream.jsx";
import MusicianDashboard from "./Pages/MusicianDashboard.jsx";
import Artist from "./Pages/ArtistProfileUser.jsx";
import StreamPopupTest from "./Pages/StreamPopupTest.jsx";
import Events from "./Pages/Events.jsx";
import EventDetails from "./Pages/EventDetails.jsx";
import CreateEvent from "./Pages/CreateEvent.jsx";
import CreateAlbum from "./Pages/CreateAlbum.jsx";
import SearchResult from "./Pages/SearchResult.jsx";
import Playlists from "./Pages/Playlists.jsx";
import CreatePlaylist from "./Pages/CreatePlaylist.jsx";
import Admin from "./Pages/Admin.jsx";
import Report from "./Pages/Report.jsx";
import ListenerMe from "./Pages/ListenerMe.jsx";
import ListenerPublic from "./Pages/ListenerPublic.jsx";
import ArtistProfileUser from "./Pages/ArtistProfileUser.jsx";
import Dashboard from "./Pages/Dashboard.jsx";
import ArtistEvents from "./Pages/ArtistEvents.jsx";
import ArtistAlbum from "./Pages/ArtistAlbum.jsx";
import Settings from "./Pages/Settings.jsx";
import NewReleases from "./Pages/NewReleases.jsx";
import Album from "./Pages/Album.jsx";
import PlaylistPage from "./Pages/PlaylistPage.jsx";
import GenerateReport from "./Pages/GenerateReport.jsx";
import ReportResult from "./Pages/ReportResult.jsx";
import NotFound from "./Pages/NotFound.jsx";
import Playbar from "./Components/Playbar.jsx";
import History from "./Pages/History.jsx";
import Logout from "./Pages/Logout.jsx";
import Follow from "./Pages/Follow.jsx";

function App() {
  const [playbarState, setPlaybarState] = useState({
    songId: null,
    albumId: null,
    playlistId: null,
    visible: false,
  });

  const router = createBrowserRouter([
    { path: "/", element: <Login /> },
    { path: "/login", element: <Login /> },
    { path: "/signup", element: <Signup /> },
    { path: "/register", element: <Register /> },
    { path: "/authtest", element: <Authtest /> },
    { path: "/stream/:id", element: <Stream /> },
    { path: "/musician-dashboard/:id", element: <MusicianDashboard /> },
    { path: "/artist/:id", element: <Artist /> },
    { path: "/streamtest", element: <StreamPopupTest /> },
    { path: "/events", element: <Events /> },
    { path: "/event/:id", element: <EventDetails /> },
    { path: "/createevent", element: <CreateEvent /> },
    { path: "/createalbum", element: <CreateAlbum /> },
    { path: "/search", element: <SearchResult /> },
    { path: "/playlists", element: <Playlists /> },
    { path: "/createplaylist", element: <CreatePlaylist /> },
    { path: "/admin", element: <Admin /> },
    { path: "/report", element: <Report /> },
    { path: "/dashboard", element: <Dashboard /> },
    { path: "/me/:id", element: <ListenerMe /> },
    { path: "/user/:id", element: <ListenerPublic /> },
    { path: "/artist-user/:id", element: <ArtistProfileUser /> },
    { path: "/artist-events/:id", element: <ArtistEvents /> },
    { path: "/artist-albums/:id", element: <ArtistAlbum /> },
    { path: "/settings", element: <Settings /> },
    { path: "/new", element: <NewReleases /> },
    { path: "/dashboard", element: <Dashboard /> },
    {
      path: "/album/:id",
      element: <Album setPlaybarState={setPlaybarState} />,
    },
    {
      path: "/playlist/:id",
      element: <PlaylistPage setPlaybarState={setPlaybarState} />,
    },
    { path: "/admin/generate-report", element: <GenerateReport /> },
    { path: "/admin/report-result", element: <ReportResult /> },
    { path: "/page-not-found", element: <NotFound /> },
    { path: "*", element: <NotFound /> },
    { path: "/history/:id", element: <History /> },
    { path: "/logout", element: <Logout /> },
    { path: "/follows/:id", element: <Follow /> },
  ]);

  return (
    <>
      <RouterProvider router={router} />
      {playbarState.visible && <Playbar playbarState={playbarState} setPlaybarState={setPlaybarState} />}
    </>
  );
}

export default App;
export const appLogo = _appLogo;
