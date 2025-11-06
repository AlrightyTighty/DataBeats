import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router";
import "./index.css";
import App from "./App.jsx";

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
]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
